
-- Drop overly permissive policies
DROP POLICY IF EXISTS "public all kas" ON public.kas;
DROP POLICY IF EXISTS "public all pelanggan" ON public.pelanggan;
DROP POLICY IF EXISTS "public all pengaturan" ON public.pengaturan;
DROP POLICY IF EXISTS "public all tagihan" ON public.tagihan;

-- Remove password column from pengaturan (passwords now managed by Supabase Auth)
ALTER TABLE public.pengaturan DROP COLUMN IF EXISTS password;

-- Revoke anon access; only authenticated operator role may access
REVOKE ALL ON public.kas FROM anon;
REVOKE ALL ON public.pelanggan FROM anon;
REVOKE ALL ON public.pengaturan FROM anon;
REVOKE ALL ON public.tagihan FROM anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.kas TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pelanggan TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pengaturan TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tagihan TO authenticated;

GRANT ALL ON public.kas TO service_role;
GRANT ALL ON public.pelanggan TO service_role;
GRANT ALL ON public.pengaturan TO service_role;
GRANT ALL ON public.tagihan TO service_role;

-- Authenticated (signed-in operator) policies: full access, anon denied
CREATE POLICY "authenticated manage kas" ON public.kas
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "authenticated manage pelanggan" ON public.pelanggan
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "authenticated manage pengaturan" ON public.pengaturan
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "authenticated manage tagihan" ON public.tagihan
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
