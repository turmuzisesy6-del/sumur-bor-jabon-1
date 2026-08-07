ALTER TABLE public.pelanggan
  ADD COLUMN IF NOT EXISTS akses_token text;

UPDATE public.pelanggan
  SET akses_token = replace(gen_random_uuid()::text, '-', '')
  WHERE akses_token IS NULL;

ALTER TABLE public.pelanggan
  ALTER COLUMN akses_token SET DEFAULT replace(gen_random_uuid()::text, '-', ''),
  ALTER COLUMN akses_token SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS pelanggan_akses_token_key
  ON public.pelanggan (akses_token);