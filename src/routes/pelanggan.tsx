import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Search, FileSpreadsheet, ImageIcon, Link2, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { fileToBase64 } from "@/lib/format";
import { exportExcel } from "@/lib/exports";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const Route = createFileRoute("/pelanggan")({
  head: () => ({ meta: [{ title: "Data Pelanggan — SUMUR BOR JABON 1" }] }),
  component: Page,
});

interface P { id: string; nama: string; no_hp: string | null; foto_url: string | null; akses_token?: string | null }

function Page() {
  const [rows, setRows] = useState<P[]>([]);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<P | null>(null);
  const [form, setForm] = useState({ nama: "", no_hp: "", foto_url: "" });

  const load = async () => {
    const { data } = await supabase.from("pelanggan").select("*").order("nama");
    setRows((data as P[]) || []);
  };
  useEffect(() => { load(); }, []);

  const linkFor = (r: P) =>
    `${window.location.origin}/p/${r.akses_token ?? ""}`;


  const copyLink = async (r: P) => {
    if (!r.akses_token) return toast.error("Tautan belum tersedia, muat ulang halaman");
    try {
      await navigator.clipboard.writeText(linkFor(r));
      toast.success(`Tautan portal ${r.nama} disalin`);
    } catch {
      toast.error("Gagal menyalin tautan");
    }
  };

  const shareWa = (r: P) => {
    if (!r.akses_token) return toast.error("Tautan belum tersedia, muat ulang halaman");
    const hp = (r.no_hp || "").replace(/\D/g, "").replace(/^0/, "62");
    const pesan = encodeURIComponent(
      `Halo ${r.nama}, berikut tautan pribadi untuk cek tagihan air Sumur Bor Jabon 1:\n${linkFor(r)}\n\nCukup buka tautan ini, tanpa perlu isi nomor HP.`,
    );
    window.open(hp ? `https://wa.me/${hp}?text=${pesan}` : `https://wa.me/?text=${pesan}`, "_blank");
  };

  const openAdd = () => { setEdit(null); setForm({ nama: "", no_hp: "", foto_url: "" }); setOpen(true); };
  const openEdit = (r: P) => { setEdit(r); setForm({ nama: r.nama, no_hp: r.no_hp || "", foto_url: r.foto_url || "" }); setOpen(true); };

  const save = async () => {
    if (!form.nama.trim()) return toast.error("Nama wajib diisi");
    if (edit) {
      await supabase.from("pelanggan").update(form).eq("id", edit.id);
      toast.success("Data pelanggan diperbarui");
    } else {
      await supabase.from("pelanggan").insert(form);
      toast.success("Pelanggan ditambahkan");
    }
    setOpen(false); load();
  };

  const del = async (id: string) => {
    if (!confirm("Hapus pelanggan ini?")) return;
    await supabase.from("pelanggan").delete().eq("id", id);
    toast.success("Data dihapus"); load();
  };

  const onFile = async (f: File | null) => {
    if (!f) return;
    const b64 = await fileToBase64(f);
    setForm((s) => ({ ...s, foto_url: b64 }));
  };

  const filtered = rows.filter((r) =>
    r.nama.toLowerCase().includes(q.toLowerCase()) || (r.no_hp || "").includes(q));

  const doExport = () => {
    exportExcel("data-pelanggan", filtered.map((r, i) => ({
      No: i + 1, Nama: r.nama, "No HP": r.no_hp || "",
    })));
  };

  return (
    <AppShell title="Data Pelanggan">
      <Card className="p-4 md:p-6 shadow-card">
        <div className="flex flex-wrap gap-2 items-center justify-between mb-4">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Cari nama atau nomor HP..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={doExport}><FileSpreadsheet className="h-4 w-4 mr-2" />Excel</Button>
            <Button onClick={openAdd} className="bg-gradient-primary"><Plus className="h-4 w-4 mr-2" />Tambah</Button>
          </div>
        </div>

        <div className="rounded-lg border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-12">No</TableHead>
                <TableHead>Foto</TableHead>
                <TableHead>Nama Pelanggan</TableHead>
                <TableHead>No. HP</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Belum ada data</TableCell></TableRow>
              )}
              {filtered.map((r, i) => (
                <TableRow key={r.id}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell>
                    <Avatar className="h-10 w-10">
                      {r.foto_url ? <AvatarImage src={r.foto_url} /> : null}
                      <AvatarFallback>{r.nama[0]}</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">{r.nama}</TableCell>
                  <TableCell>{r.no_hp || "-"}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" title="Salin tautan portal" onClick={() => copyLink(r)}><Link2 className="h-4 w-4 text-primary" /></Button>
                    <Button variant="ghost" size="icon" title="Kirim tautan via WhatsApp" onClick={() => shareWa(r)}><MessageCircle className="h-4 w-4 text-emerald-600" /></Button>
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
          <DialogHeader><DialogTitle>{edit ? "Edit" : "Tambah"} Pelanggan</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Nama Pelanggan</Label>
              <Input value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} />
            </div>
            <div>
              <Label>No. HP</Label>
              <Input value={form.no_hp} onChange={(e) => setForm({ ...form, no_hp: e.target.value })} />
            </div>
            <div>
              <Label>Foto Pelanggan</Label>
              <div className="flex items-center gap-3">
                {form.foto_url && <img src={form.foto_url} className="h-16 w-16 rounded-lg object-cover border" />}
                <label className="flex-1">
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0] || null)} />
                  <div className="border border-dashed rounded-lg px-3 py-4 text-center cursor-pointer hover:bg-accent flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <ImageIcon className="h-4 w-4" /> Pilih foto
                  </div>
                </label>
              </div>
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
