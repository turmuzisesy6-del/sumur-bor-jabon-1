import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, FileSpreadsheet, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { rupiah, tanggalID } from "@/lib/format";
import { exportExcel, exportPDF } from "@/lib/exports";
import { toast } from "sonner";

export const Route = createFileRoute("/kas")({
  head: () => ({ meta: [{ title: "Kas — SUMUR BOR JABON 1" }] }),
  component: Page,
});

interface K { id: string; tanggal: string; nama_barang: string; masuk: number; keluar: number }

function Page() {
  const [rows, setRows] = useState<K[]>([]);
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<K | null>(null);
  const [form, setForm] = useState({ tanggal: new Date().toISOString().slice(0, 10), nama_barang: "", masuk: 0, keluar: 0 });

  const load = async () => {
    const { data } = await supabase.from("kas").select("*").order("tanggal", { ascending: false });
    setRows((data as K[]) || []);
  };
  useEffect(() => { load(); }, []);

  const openAdd = () => { setEdit(null); setForm({ tanggal: new Date().toISOString().slice(0, 10), nama_barang: "", masuk: 0, keluar: 0 }); setOpen(true); };
  const openEdit = (r: K) => { setEdit(r); setForm({ tanggal: r.tanggal, nama_barang: r.nama_barang, masuk: Number(r.masuk), keluar: Number(r.keluar) }); setOpen(true); };
  const save = async () => {
    if (!form.nama_barang) return toast.error("Nama barang/transaksi wajib diisi");
    if (edit) await supabase.from("kas").update(form).eq("id", edit.id);
    else await supabase.from("kas").insert(form);
    toast.success("Data kas disimpan"); setOpen(false); load();
  };
  const del = async (id: string) => { if (!confirm("Hapus?")) return; await supabase.from("kas").delete().eq("id", id); load(); };

  let running = 0;
  const withTotal = [...rows].reverse().map((r) => { running += Number(r.masuk) - Number(r.keluar); return { ...r, total: running }; }).reverse();
  const totalKas = withTotal[0]?.total ?? 0;

  const doExcel = () => exportExcel("kas", withTotal.map((r, i) => ({
    No: i + 1, Tanggal: tanggalID(r.tanggal), Nama: r.nama_barang, Masuk: r.masuk, Keluar: r.keluar, Total: r.total,
  })));
  const doPDF = () => exportPDF("Laporan Kas", ["No", "Tanggal", "Nama", "Masuk", "Keluar", "Total"],
    withTotal.map((r, i) => [i + 1, tanggalID(r.tanggal), r.nama_barang, rupiah(Number(r.masuk)), rupiah(Number(r.keluar)), rupiah(r.total)]),
    "laporan-kas");

  return (
    <AppShell title="Kas">
      <Card className="p-4 md:p-6 shadow-card">
        <div className="flex flex-wrap gap-2 items-center justify-between mb-4">
          <div className="rounded-lg bg-gradient-success text-success-foreground px-4 py-2 font-semibold shadow-elegant">
            Saldo Kas: {rupiah(totalKas)}
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
                <TableHead>Hari/Tanggal</TableHead>
                <TableHead>Nama Barang</TableHead>
                <TableHead className="text-right">Masuk</TableHead>
                <TableHead className="text-right">Keluar</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {withTotal.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">Belum ada transaksi</TableCell></TableRow>}
              {withTotal.map((r, i) => (
                <TableRow key={r.id}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell>{tanggalID(r.tanggal)}</TableCell>
                  <TableCell className="font-medium">{r.nama_barang}</TableCell>
                  <TableCell className="text-right text-success">{r.masuk > 0 ? rupiah(Number(r.masuk)) : "-"}</TableCell>
                  <TableCell className="text-right text-destructive">{r.keluar > 0 ? rupiah(Number(r.keluar)) : "-"}</TableCell>
                  <TableCell className="text-right font-semibold">{rupiah(r.total)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(r)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => del(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{edit ? "Edit" : "Tambah"} Transaksi Kas</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Tanggal</Label><Input type="date" value={form.tanggal} onChange={(e) => setForm({ ...form, tanggal: e.target.value })} /></div>
            <div><Label>Nama Barang / Keterangan</Label><Input value={form.nama_barang} onChange={(e) => setForm({ ...form, nama_barang: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Masuk (Rp)</Label><Input type="number" value={form.masuk} onChange={(e) => setForm({ ...form, masuk: Number(e.target.value) })} /></div>
              <div><Label>Keluar (Rp)</Label><Input type="number" value={form.keluar} onChange={(e) => setForm({ ...form, keluar: Number(e.target.value) })} /></div>
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
