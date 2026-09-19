CREATE TABLE public.store_catalog (
  id text PRIMARY KEY,
  data jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.store_catalog TO anon, authenticated;
GRANT ALL ON public.store_catalog TO service_role;

ALTER TABLE public.store_catalog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Catalogue visible par tous"
ON public.store_catalog
FOR SELECT
TO anon, authenticated
USING (id = 'main');