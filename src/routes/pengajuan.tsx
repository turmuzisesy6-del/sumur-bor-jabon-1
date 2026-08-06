import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { tanggalID } from "@/lib/format";
import { Check, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/pengajuan")({
  head: () => ({
    meta: [
      { title: "Pengajuan Perubahan Data — SUMUR BOR JABON 1" },
      { name: "description", content: "Setujui atau tolak pengajuan perubahan nama dan nomor HP dari pelanggan Sumur Bor Jabon 1." },
      { property: "og:title", content: "Pengajuan Perubahan Data — SUMUR BOR JABON 1" },
      { property: "og:description", content: "Setujui atau tolak pengajuan perubahan data pelanggan." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

interface Row {
  id: string; pelanggan_id: string; nama_lama: string | null; no_hp_lama: string | null;
  nama_baru: string | null; no_hp_baru: string | null; status: string;
  alasan_penolakan: string | null; created_at: string;
}

function Page() {
  const [rows, setRows] = useState<Row[]>([]);
  const [tolak, setTolak] = useState<Row | null>(null);
  const [alasan, setAlasan] = useState("");

  const load = async () => {
    const { data } = await supabase
      .from("pengajuan_perubahan").select("*").order("created_at", { ascending: false });
    setRows((data as Row[]) || []);
  };
  useEffect(() => { load(); }, []);

  const setujui = async (r: Row) => {
    const { error: e1 } = await supabase.from("pelanggan")
      .update({ nama: r.nama_baru || "", no_hp: r.no_hp_baru }).eq("id", r.pelanggan_id);
    if (e1) return toast.error(e1.message);
    await supabase.from("pengajuan_perubahan").update({ status: "disetujui" }).eq("id", r.id);
    toast.success("Pengajuan disetujui, data pelanggan diperbarui");
    load();
  };

  const simpanTolak = async () => {
    if (!tolak) return;
    await supabase.from("pengajuan_perubahan")
      .update({ status: "ditolak", alasan_penolakan: alasan || "Tidak disebutkan" }).eq("id", tolak.id);
    setTolak(null); setAlasan("");
    toast.success("Pengajuan ditolak");
    load();
  };

  const badge = (s: string) =>
    s === "menunggu" ? <Badge className="bg-warning text-warning-foreground">MENUNGGU</Badge>
      : s === "disetujui" ? <Badge className="bg-success text-success-foreground">DISETUJUI</Badge>
      : <Badge className="bg-destructive text-destructive-foreground">DITOLAK</Badge>;

  return (
    <AppShell title="Pengajuan Perubahan Data">
      <Card className="p-4 md:p-6 shadow-card">
        <div className="rounded-lg border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-12">No</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Data Lama</TableHead>
                <TableHead>Data Baru</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 && (
                <TableRow><TableCell colSpan={6} className="py-8 text-center text-muted-foreground">Belum ada pengajuan</TableCell></TableRow>
              )}
              {rows.map((r, i) => (
                <TableRow key={r.id}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell>{tanggalID(r.created_at)}</TableCell>
                  <TableCell>{r.nama_lama}<br /><span className="text-xs text-muted-foreground">{r.no_hp_lama || "-"}</span></TableCell>
                  <TableCell className="font-medium">{r.nama_baru}<br /><span className="text-xs text-muted-foreground">{r.no_hp_baru || "-"}</span></TableCell>
                  <TableCell>{badge(r.status)}{r.status === "ditolak" && r.alasan_penolakan && (
                    <p className="mt-1 text-xs text-muted-foreground">{r.alasan_penolakan}</p>)}</TableCell>
                  <TableCell className="text-right">
                    {r.status === "menunggu" && (
                      <>
                        <Button size="sm" onClick={() => setujui(r)} className="mr-2 bg-success text-success-foreground hover:bg-success/90">
                          <Check className="mr-1 h-4 w-4" />Setujui
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => { setTolak(r); setAlasan(""); }}>
                          <X className="mr-1 h-4 w-4" />Tolak
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={!!tolak} onOpenChange={(o) => !o && setTolak(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Tolak Pengajuan</DialogTitle></DialogHeader>
          <div>
            <Label>Alasan Penolakan</Label>
            <Input value={alasan} onChange={(e) => setAlasan(e.target.value)} placeholder="Contoh: Nomor HP sudah dipakai" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTolak(null)}>Batal</Button>
            <Button onClick={simpanTolak} variant="destructive">Tolak Pengajuan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
