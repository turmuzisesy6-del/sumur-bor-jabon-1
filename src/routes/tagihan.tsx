import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Plus, Pencil, Trash2, Search, FileSpreadsheet, FileText, Printer, ImageIcon,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { rupiah, tanggalID, fileToBase64 } from "@/lib/format";
import { exportExcel, exportPDF } from "@/lib/exports";
import { downloadStrukPDF, downloadStrukJPG } from "@/lib/struk";
import { toast } from "sonner";

export const Route = createFileRoute("/tagihan")({
  head: () => ({ meta: [{ title: "Tagihan Bulanan — SUMUR BOR JABON 1" }] }),
  component: Page,
});

interface T {
  id: string; pelanggan_id: string | null; nama_pelanggan: string; no_hp: string | null;
  tanggal: string; meter_lama: number; meter_baru: number; pemakaian: number;
  tarif: number; beban: number; total: number; foto_meter_url: string | null; status: string;
}
interface Pel { id: string; nama: string; no_hp: string | null }

function Page() {
  const [rows, setRows] = useState<T[]>([]);
  const [pel, setPel] = useState<Pel[]>([]);
  const [pengaturan, setPengaturan] = useState({ tarif: 2000, beban: 10000, nama_sumur: "SUMUR BOR JABON 1", nama_petugas: "TURMUZI", no_hp_petugas: "0877-1300-0682" });
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<T | null>(null);
  const [form, setForm] = useState({
    pelanggan_id: "", nama_pelanggan: "", no_hp: "", tanggal: new Date().toISOString().slice(0, 10),
    meter_lama: 0, meter_baru: 0, foto_meter_url: "", status: "belum",
  });

  const load = async () => {
    const [t, p, s] = await Promise.all([
      supabase.from("tagihan").select("*").order("created_at", { ascending: false }),
      supabase.from("pelanggan").select("id, nama, no_hp").order("nama"),
      supabase.from("pengaturan").select("*").eq("id", 1).single(),
    ]);
    setRows((t.data as T[]) || []);
    setPel((p.data as Pel[]) || []);
    if (s.data) setPengaturan({
      tarif: Number(s.data.tarif) || 2000, beban: Number(s.data.beban) || 10000,
      nama_sumur: s.data.nama_sumur || "SUMUR BOR JABON 1",
      nama_petugas: s.data.nama_petugas || "TURMUZI",
      no_hp_petugas: s.data.no_hp_petugas || "0877-1300-0682",
    });
  };
  useEffect(() => { load(); }, []);

  const pemakaian = Math.max(0, Number(form.meter_baru) - Number(form.meter_lama));
  const total = pemakaian * pengaturan.tarif + pengaturan.beban;

  const openAdd = () => {
    setEdit(null);
    setForm({ pelanggan_id: "", nama_pelanggan: "", no_hp: "", tanggal: new Date().toISOString().slice(0, 10), meter_lama: 0, meter_baru: 0, foto_meter_url: "", status: "belum" });
    setOpen(true);
  };
  const openEdit = (r: T) => {
    setEdit(r);
    setForm({
      pelanggan_id: r.pelanggan_id || "", nama_pelanggan: r.nama_pelanggan, no_hp: r.no_hp || "",
      tanggal: r.tanggal, meter_lama: Number(r.meter_lama), meter_baru: Number(r.meter_baru),
      foto_meter_url: r.foto_meter_url || "", status: r.status,
    });
    setOpen(true);
  };
  const pickPel = (id: string) => {
    const p = pel.find((x) => x.id === id);
    setForm((s) => ({ ...s, pelanggan_id: id, nama_pelanggan: p?.nama || "", no_hp: p?.no_hp || "" }));
  };

  const save = async () => {
    if (!form.nama_pelanggan) return toast.error("Nama pelanggan wajib diisi");
    const payload = {
      pelanggan_id: form.pelanggan_id || null,
      nama_pelanggan: form.nama_pelanggan, no_hp: form.no_hp,
      tanggal: form.tanggal, meter_lama: form.meter_lama, meter_baru: form.meter_baru,
      pemakaian, tarif: pengaturan.tarif, beban: pengaturan.beban, total,
      foto_meter_url: form.foto_meter_url || null, status: form.status,
    };
    if (edit) await supabase.from("tagihan").update(payload).eq("id", edit.id);
    else await supabase.from("tagihan").insert(payload);
    toast.success("Tagihan disimpan");
    setOpen(false); load();
  };

  const del = async (id: string) => {
    if (!confirm("Hapus tagihan?")) return;
    await supabase.from("tagihan").delete().eq("id", id);
    load();
  };

  const strukData = (r: T) => ({
    namaSumur: pengaturan.nama_sumur, namaPetugas: pengaturan.nama_petugas, hpPetugas: pengaturan.no_hp_petugas,
    namaPelanggan: r.nama_pelanggan, hpPelanggan: r.no_hp || "-", tanggal: r.tanggal,
    meterLama: Number(r.meter_lama), meterBaru: Number(r.meter_baru), pemakaian: Number(r.pemakaian),
    tarif: Number(r.tarif), beban: Number(r.beban), total: Number(r.total),
  });

  const filtered = rows.filter((r) => r.nama_pelanggan.toLowerCase().includes(q.toLowerCase()));

  const totalSemua = filtered.reduce((s, r) => s + Number(r.total), 0);

  const doExcel = () => exportExcel("tagihan-bulanan", filtered.map((r, i) => ({
    No: i + 1, Nama: r.nama_pelanggan, Tanggal: tanggalID(r.tanggal),
    "Meter Lama": r.meter_lama, "Meter Baru": r.meter_baru, "Pemakaian (M³)": r.pemakaian,
    Total: Number(r.total), Status: r.status,
  })));
  const doPDF = () => exportPDF("Laporan Tagihan Bulanan", ["No", "Nama", "Tanggal", "Pemakaian (M³)", "Total", "Status"],
    filtered.map((r, i) => [i + 1, r.nama_pelanggan, tanggalID(r.tanggal), r.pemakaian, rupiah(Number(r.total)), r.status]),
    "tagihan-bulanan");

  const onMeterFoto = async (f: File | null) => {
    if (!f) return;
    setForm((s) => ({ ...s, foto_meter_url: await fileToBase64(f) }));
  };

  return (
    <AppShell title="Tagihan Bulanan">
      <Card className="p-4 md:p-6 shadow-card">
        <div className="flex flex-wrap gap-2 items-center justify-between mb-4">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Cari nama..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={doPDF}><FileText className="h-4 w-4 mr-2" />PDF</Button>
            <Button variant="outline" onClick={doExcel}><FileSpreadsheet className="h-4 w-4 mr-2" />Excel</Button>
            <Button onClick={openAdd} className="bg-gradient-primary"><Plus className="h-4 w-4 mr-2" />Tambah</Button>
          </div>
        </div>

        <div className="rounded-lg border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-10">No</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead className="text-right">Pemakaian</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">Belum ada tagihan</TableCell></TableRow>
              )}
              {filtered.map((r, i) => (
                <TableRow key={r.id}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell className="font-medium">{r.nama_pelanggan}</TableCell>
                  <TableCell>{tanggalID(r.tanggal)}</TableCell>
                  <TableCell className="text-right">{r.pemakaian} M³</TableCell>
                  <TableCell className="text-right font-semibold">{rupiah(Number(r.total))}</TableCell>
                  <TableCell>
                    <Badge variant={r.status === "sudah" ? "default" : "destructive"} className={r.status === "sudah" ? "bg-success" : ""}>
                      {r.status === "sudah" ? "Lunas" : "Belum"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <Button variant="ghost" size="icon" title="Struk PDF" onClick={() => downloadStrukPDF(strukData(r), `struk-${r.nama_pelanggan}.pdf`)}>
                      <FileText className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Struk JPG" onClick={() => downloadStrukJPG(strukData(r), `struk-${r.nama_pelanggan}.jpg`)}>
                      <Printer className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openEdit(r)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => del(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-end mt-4 text-sm">
          <div className="rounded-lg bg-gradient-primary text-primary-foreground px-4 py-2 font-semibold shadow-elegant">
            Total Bayaran Semua: {rupiah(totalSemua)}
          </div>
        </div>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{edit ? "Edit" : "Tambah"} Tagihan</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Pelanggan</Label>
              <Select value={form.pelanggan_id} onValueChange={pickPel}>
                <SelectTrigger><SelectValue placeholder="Pilih pelanggan..." /></SelectTrigger>
                <SelectContent>
                  {pel.map((p) => <SelectItem key={p.id} value={p.id}>{p.nama}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Nama</Label><Input value={form.nama_pelanggan} onChange={(e) => setForm({ ...form, nama_pelanggan: e.target.value })} /></div>
              <div><Label>No. HP</Label><Input value={form.no_hp} onChange={(e) => setForm({ ...form, no_hp: e.target.value })} /></div>
              <div><Label>Tanggal</Label><Input type="date" value={form.tanggal} onChange={(e) => setForm({ ...form, tanggal: e.target.value })} /></div>
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="belum">Belum Bayar</SelectItem>
                    <SelectItem value="sudah">Sudah Bayar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Meter Lama (M³)</Label><Input type="number" value={form.meter_lama} onChange={(e) => setForm({ ...form, meter_lama: Number(e.target.value) })} /></div>
              <div><Label>Meter Baru (M³)</Label><Input type="number" value={form.meter_baru} onChange={(e) => setForm({ ...form, meter_baru: Number(e.target.value) })} /></div>
            </div>

            <div>
              <Label>Foto Meteran (opsional)</Label>
              <div className="flex gap-2 items-center">
                {form.foto_meter_url && <img src={form.foto_meter_url} className="h-16 w-16 rounded-lg object-cover border" />}
                <label className="flex-1">
                  <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => onMeterFoto(e.target.files?.[0] || null)} />
                  <div className="border border-dashed rounded-lg py-3 text-center cursor-pointer hover:bg-accent text-sm text-muted-foreground flex items-center justify-center gap-2">
                    <ImageIcon className="h-4 w-4" /> Ambil / pilih foto
                  </div>
                </label>
              </div>
            </div>

            <div className="rounded-lg border bg-muted/40 p-3 space-y-1 text-sm">
              <div className="flex justify-between"><span>Tarif per M³</span><span>{rupiah(pengaturan.tarif)}</span></div>
              <div className="flex justify-between"><span>Beban</span><span>{rupiah(pengaturan.beban)}</span></div>
              <div className="flex justify-between"><span>Pemakaian</span><span>{pemakaian} M³</span></div>
              <div className="flex justify-between font-bold text-base pt-2 border-t"><span>Total Bayar</span><span className="text-primary">{rupiah(total)}</span></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
            <Button onClick={save} className="bg-gradient-primary">Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
