ALTER TABLE public.pelanggan
  ADD COLUMN IF NOT EXISTS alamat text,
  ADD COLUMN IF NOT EXISTS nomor_pelanggan text,
  ADD COLUMN IF NOT EXISTS status_aktif boolean NOT NULL DEFAULT true;

UPDATE public.pelanggan p
SET nomor_pelanggan = s.gen
FROM (
  SELECT id, 'PLG-' || lpad((row_number() OVER (ORDER BY created_at))::text, 4, '0') AS gen
  FROM public.pelanggan
) s
WHERE p.id = s.id AND p.nomor_pelanggan IS NULL;

CREATE TABLE IF NOT EXISTS public.pengajuan_perubahan (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pelanggan_id uuid NOT NULL REFERENCES public.pelanggan(id) ON DELETE CASCADE,
  nama_lama text,
  no_hp_lama text,
  nama_baru text,
  no_hp_baru text,
  status text NOT NULL DEFAULT 'menunggu',
  alasan_penolakan text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.pengajuan_perubahan TO authenticated;
GRANT ALL ON public.pengajuan_perubahan TO service_role;

ALTER TABLE public.pengajuan_perubahan ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated manage pengajuan" ON public.pengajuan_perubahan
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$
LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS update_pengajuan_updated_at ON public.pengajuan_perubahan;
CREATE TRIGGER update_pengajuan_updated_at BEFORE UPDATE ON public.pengajuan_perubahan
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_pengajuan_pelanggan ON public.pengajuan_perubahan(pelanggan_id);
CREATE INDEX IF NOT EXISTS idx_pelanggan_no_hp ON public.pelanggan(no_hp);