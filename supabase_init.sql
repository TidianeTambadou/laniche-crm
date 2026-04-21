-- Ventes privées : table optionnelle si tu veux historiser les braderies
-- (sinon is_private_sale sur shop_stock suffit pour l'usage actuel)
CREATE TABLE IF NOT EXISTS public.private_sales (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    shop_id uuid NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
    perfume_id uuid NOT NULL REFERENCES public.shop_stock(id) ON DELETE CASCADE,
    discounted_price numeric(10,2),
    status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired')),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.private_sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "private_sales: lecture"
    ON public.private_sales FOR SELECT
    USING (auth.uid() = shop_id);

CREATE POLICY "private_sales: gestion"
    ON public.private_sales FOR ALL
    USING (auth.uid() = shop_id);
