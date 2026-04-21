-- 1. Table shops (une ligne par utilisateur auth)
CREATE TABLE IF NOT EXISTS public.shops (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Table shop_stock (stock d'une boutique, scoped par shop_id = auth.uid())
CREATE TABLE IF NOT EXISTS public.shop_stock (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    shop_id uuid NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
    perfume_name text NOT NULL,
    brand text NOT NULL DEFAULT '',
    price numeric(10,2),
    quantity integer NOT NULL DEFAULT 1,
    is_private_sale boolean NOT NULL DEFAULT false,
    private_sale_price numeric(10,2),
    sale_quantity integer,                          -- nb d'unités mises en braderie (null = toutes)
    private_sale_enabled_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. RLS
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_stock ENABLE ROW LEVEL SECURITY;

-- 4. Politiques shops
CREATE POLICY "shop: lecture" ON public.shops
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "shop: insert" ON public.shops
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "shop: update" ON public.shops
    FOR UPDATE USING (auth.uid() = id);

-- 5. Politiques shop_stock (isolation totale par boutique)
--    Le mobile authentifié voit uniquement son stock via shop_id = auth.uid()
CREATE POLICY "stock: lecture" ON public.shop_stock
    FOR SELECT USING (auth.uid() = shop_id);

CREATE POLICY "stock: insert" ON public.shop_stock
    FOR INSERT WITH CHECK (auth.uid() = shop_id);

CREATE POLICY "stock: update" ON public.shop_stock
    FOR UPDATE USING (auth.uid() = shop_id);

CREATE POLICY "stock: delete" ON public.shop_stock
    FOR DELETE USING (auth.uid() = shop_id);

-- 6. Trigger : crée automatiquement un shop à l'inscription
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
