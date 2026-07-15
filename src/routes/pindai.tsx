import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScanLine, Calculator, FileText, Printer, ImageIcon, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { fileToBase64, rupiah } from "@/lib/format";
import { downloadStrukJPG, downloadStrukPDF } from "@/lib/struk";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/pindai")({
  head: () => ({ meta: [{ title: "Pindai Meteran — SUMUR BOR JABON 1" }] }),
  component: Page,
});

function Page() {
  const [pel, setPel] = useState<any[]>([]);
  const [cfg, setCfg] = useState({ tarif: 2000, beban: 10000, nama_sumur: "SUMUR BOR JABON 1", nama_petugas: "TURMUZI", no_hp_petugas: "0877-1300-0682" });
  const [form, setForm] = useState({
    pelanggan_id: "", nama_pelanggan: "", no_hp: "",
    tanggal: new Date().toISOString().slice(0, 10),
    meter_lama: 0, meter_baru: 0, foto: "",
  });

  useEffect(() => {
    (async () => {
      const [p, s] = await Promise.all([
        supabase.from("pelanggan").select("id, nama, no_hp").order("nama"),
        supabase.from("pengaturan").select("*").eq("id", 1).single(),
      ]);
      setPel(p.data || []);
      if (s.data) setCfg({
        tarif: Number(s.data.tarif) || 2000, beban: Number(s.data.beban) || 10000,
        nama_sumur: s.data.nama_sumur || "SUMUR BOR JABON 1",
        nama_petugas: s.data.nama_petugas || "TURMUZI",
        no_hp_petugas: s.data.no_hp_petugas || "0877-1300-0682",
      });
    })();
  }, []);

  const pemakaian = Math.max(0, Number(form.meter_baru) - Number(form.meter_lama));
  const total = pemakaian * cfg.tarif + cfg.beban;

  const pickPel = (id: string) => {
    const p = pel.find((x) => x.id === id);
    setForm((s) => ({ ...s, pelanggan_id: id, nama_pelanggan: p?.nama || "", no_hp: p?.no_hp || "" }));
  };

  const onFoto = async (f: File | null) => {
    if (!f) return;
    const b64 = await fileToBase64(f);
    setForm((s) => ({ ...s, foto: b64 }));
  };

  const struk = () => ({
    namaSumur: cfg.nama_sumur, namaPetugas: cfg.nama_petugas, hpPetugas: cfg.no_hp_petugas,
    namaPelanggan: form.nama_pelanggan || "-", hpPelanggan: form.no_hp || "-",
    tanggal: form.tanggal, meterLama: form.meter_lama, meterBaru: form.meter_baru,
    pemakaian, tarif: cfg.tarif, beban: cfg.beban, total,
  });

  const simpan = async () => {
    if (!form.nama_pelanggan) return toast.error("Nama pelanggan wajib diisi");
    await supabase.from("tagihan").insert({
      pelanggan_id: form.pelanggan_id || null,
      nama_pelanggan: form.nama_pelanggan, no_hp: form.no_hp,
      tanggal: form.tanggal, meter_lama: form.meter_lama, meter_baru: form.meter_baru,
      pemakaian, tarif: cfg.tarif, beban: cfg.beban, total,
      foto_meter_url: form.foto || null, status: "belum",
    });
    toast.success("Tagihan tersimpan");
  };

  return (
    <AppShell title="Pindai Meteran">
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-5 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <ScanLine className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">1. Ambil Foto Meteran</h2>
          </div>

          <label className="block">
            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => onFoto(e.target.files?.[0] || null)} />
            {form.foto ? (
              <img src={form.foto} className="w-full rounded-lg border object-contain max-h-64 bg-muted cursor-pointer" />
            ) : (
              <div className="border-2 border-dashed rounded-xl py-14 text-center cursor-pointer hover:bg-accent">
                <ImageIcon className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-sm font-medium">Ketuk untuk pindai / ambil foto meteran</p>
                <p className="text-xs text-muted-foreground mt-1">Foto akan disimpan sebagai bukti</p>
              </div>
            )}
          </label>

          <div className="mt-4">
            <Label>Pelanggan</Label>
            <Select value={form.pelanggan_id} onValueChange={pickPel}>
              <SelectTrigger><SelectValue placeholder="Pilih pelanggan..." /></SelectTrigger>
              <SelectContent>
                {pel.map((p) => <SelectItem key={p.id} value={p.id}>{p.nama}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div><Label>Nama</Label><Input value={form.nama_pelanggan} onChange={(e) => setForm({ ...form, nama_pelanggan: e.target.value })} /></div>
            <div><Label>No. HP</Label><Input value={form.no_hp} onChange={(e) => setForm({ ...form, no_hp: e.target.value })} /></div>
            <div><Label>Tanggal</Label><Input type="date" value={form.tanggal} onChange={(e) => setForm({ ...form, tanggal: e.target.value })} /></div>
          </div>
        </Card>

        <Card className="p-5 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <Calculator className="h-5 w-5 text-secondary" />
            <h2 className="font-semibold">2. Isi Angka Meter (bisa diedit manual)</h2>
          </div>

          <div className="space-y-3">
            <div>
              <Label>Meter Lama (M³)</Label>
              <Input type="number" value={form.meter_lama} onChange={(e) => setForm({ ...form, meter_lama: Number(e.target.value) })} />
            </div>
            <div>
              <Label>Meter Baru (M³)</Label>
              <Input type="number" value={form.meter_baru} onChange={(e) => setForm({ ...form, meter_baru: Number(e.target.value) })} />
            </div>
          </div>

          <div className="mt-5 rounded-xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5 p-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Tarif per M³</span><span className="font-medium">{rupiah(cfg.tarif)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Beban</span><span className="font-medium">{rupiah(cfg.beban)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Pemakaian</span><span className="font-medium">{pemakaian} M³</span></div>
            <div className="border-t pt-2 flex justify-between items-center">
              <span className="font-semibold">Total Bayar</span>
              <span className="text-2xl font-bold text-primary">{rupiah(total)}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-4">
            <Button variant="outline" onClick={() => downloadStrukPDF(struk(), `struk-${form.nama_pelanggan || "meter"}.pdf`)}>
              <FileText className="h-4 w-4 mr-1" /> PDF
            </Button>
            <Button variant="outline" onClick={() => downloadStrukJPG(struk(), `struk-${form.nama_pelanggan || "meter"}.jpg`)}>
              <Printer className="h-4 w-4 mr-1" /> JPG
            </Button>
            <Button onClick={simpan} className="bg-gradient-primary">
              <Save className="h-4 w-4 mr-1" /> Simpan
            </Button>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
