
CREATE TABLE public.pelanggan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama TEXT NOT NULL,
  no_hp TEXT,
  foto_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pelanggan TO anon, authenticated;
GRANT ALL ON public.pelanggan TO service_role;
ALTER TABLE public.pelanggan ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public all pelanggan" ON public.pelanggan FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE public.tagihan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pelanggan_id UUID REFERENCES public.pelanggan(id) ON DELETE CASCADE,
  nama_pelanggan TEXT,
  no_hp TEXT,
  tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
  meter_lama NUMERIC NOT NULL DEFAULT 0,
  meter_baru NUMERIC NOT NULL DEFAULT 0,
  pemakaian NUMERIC NOT NULL DEFAULT 0,
  tarif NUMERIC NOT NULL DEFAULT 2000,
  beban NUMERIC NOT NULL DEFAULT 10000,
  total NUMERIC NOT NULL DEFAULT 0,
  foto_meter_url TEXT,
  status TEXT NOT NULL DEFAULT 'belum',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tagihan TO anon, authenticated;
GRANT ALL ON public.tagihan TO service_role;
ALTER TABLE public.tagihan ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public all tagihan" ON public.tagihan FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE public.kas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
  nama_barang TEXT NOT NULL,
  masuk NUMERIC NOT NULL DEFAULT 0,
  keluar NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.kas TO anon, authenticated;
GRANT ALL ON public.kas TO service_role;
ALTER TABLE public.kas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public all kas" ON public.kas FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE public.pengaturan (
  id INT PRIMARY KEY DEFAULT 1,
  nama_sumur TEXT DEFAULT 'SUMUR BOR JABON 1',
  nama_petugas TEXT DEFAULT 'TURMUZI',
  no_hp_petugas TEXT DEFAULT '0877-1300-0682',
  tarif NUMERIC DEFAULT 2000,
  beban NUMERIC DEFAULT 10000,
  email TEXT,
  website TEXT,
  password TEXT DEFAULT 'JABON1',
  CONSTRAINT pengaturan_singleton CHECK (id = 1)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pengaturan TO anon, authenticated;
GRANT ALL ON public.pengaturan TO service_role;
ALTER TABLE public.pengaturan ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public all pengaturan" ON public.pengaturan FOR ALL USING (true) WITH CHECK (true);

INSERT INTO public.pengaturan (id) VALUES (1) ON CONFLICT DO NOTHING;
