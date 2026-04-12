-- 1. Table private_sales
CREATE TABLE IF NOT EXISTS public.private_sales (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    shop_id uuid NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
    perfume_id uuid NOT NULL REFERENCES public.perfumes(id) ON DELETE CASCADE,
    discounted_price numeric(10,2),
    status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired')),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Activer RLS (Row Level Security)
ALTER TABLE public.private_sales ENABLE ROW LEVEL SECURITY;

-- 3. Politique: Les utilisateurs peuvent lire uniquement les private_sales de leur boutique
CREATE POLICY "Les utilisateurs peuvent voir les ventes bradées de leur shop"
    ON public.private_sales
    FOR SELECT
    USING (
        shop_id IN (
            SELECT id FROM public.shops WHERE user_id = auth.uid()
        )
    );

-- 4. Politique: Les utilisateurs peuvent insérer/modifier les private_sales de leur boutique
CREATE POLICY "Les utilisateurs peuvent gerer les ventes bradées de leur shop"
    ON public.private_sales
    FOR ALL
    USING (
        shop_id IN (
            SELECT id FROM public.shops WHERE user_id = auth.uid()
        )
    );
