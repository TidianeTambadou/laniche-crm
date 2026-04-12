-- 1. Table shops (boutiques)
CREATE TABLE IF NOT EXISTS public.shops (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Table perfumes (avec toute la data de stock et ventes privées)
CREATE TABLE IF NOT EXISTS public.perfumes (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    shop_id uuid NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
    name text NOT NULL,
    brand text NOT NULL,
    price numeric(10,2) NOT NULL DEFAULT 0,
    quantity integer NOT NULL DEFAULT 0,
    is_sale boolean NOT NULL DEFAULT false,
    sale_price numeric(10,2),
    views integer NOT NULL DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Activer RLS (Row Level Security)
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perfumes ENABLE ROW LEVEL SECURITY;

-- 4. Politiques Shops
CREATE POLICY "Les utilisateurs lisent leur propre shop"
    ON public.shops FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Les utilisateurs modifient leur propre shop"
    ON public.shops FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Les utilisateurs insèrent leur propre shop"
    ON public.shops FOR INSERT WITH CHECK (auth.uid() = id);

-- 5. Politiques Perfumes
CREATE POLICY "Acces lecture parfums"
    ON public.perfumes FOR SELECT USING (auth.uid() = shop_id);

CREATE POLICY "Acces insert parfums"
    ON public.perfumes FOR INSERT WITH CHECK (auth.uid() = shop_id);

CREATE POLICY "Acces update parfums"
    ON public.perfumes FOR UPDATE USING (auth.uid() = shop_id);

CREATE POLICY "Acces delete parfums"
    ON public.perfumes FOR DELETE USING (auth.uid() = shop_id);

-- 6. Trigger pour insérer automatiquement un shop à la création de compte Auth (Optionnel)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.shops (id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', 'Nouvelle Boutique'));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
