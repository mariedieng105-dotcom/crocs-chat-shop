CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

CREATE TABLE IF NOT EXISTS public.editor_secret (
  id text PRIMARY KEY,
  password_hash text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.editor_secret TO service_role;
ALTER TABLE public.editor_secret ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.check_editor_password(p_password text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, extensions
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.editor_secret
    WHERE id = 'main'
      AND password_hash = encode(digest(p_password, 'sha256'), 'hex')
  );
$$;

CREATE OR REPLACE FUNCTION public.save_catalog(p_password text, p_data jsonb)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  IF NOT public.check_editor_password(p_password) THEN
    RETURN false;
  END IF;
  INSERT INTO public.store_catalog (id, data, updated_at)
  VALUES ('main', p_data, now())
  ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = now();
  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.check_editor_password(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.save_catalog(text, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_editor_password(text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.save_catalog(text, jsonb) TO anon, authenticated, service_role;