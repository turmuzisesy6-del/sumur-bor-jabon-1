import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, FileSpreadsheet, FileText, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { rupiah, tanggalID } from "@/lib/format";
import { exportExcel, exportPDF } from "@/lib/exports";
import { toast } from "sonner";

export const Route = createFileRoute("/sudah-bayar")({
  head: () => ({ meta: [{ title: "Sudah Bayar — SUMUR BOR JABON 1" }] }),
  component: () => <ListBayar status="sudah" title="Sudah Bayar" />,
});

export function ListBayar({ status, title }: { status: "sudah" | "belum"; title: string }) {
  const [rows, setRows] = useState<any[]>([]);
  const [q, setQ] = useState("");

  const load = async () => {
    const { data } = await supabase.from("tagihan").select("*").eq("status", status).order("tanggal", { ascending: false });
    setRows(data || []);
  };
  useEffect(() => { load(); }, [status]);

  const filtered = rows.filter((r) => (r.nama_pelanggan || "").toLowerCase().includes(q.toLowerCase()));
  const totalJumlah = filtered.reduce((s, r) => s + Number(r.total || 0), 0);

  const toggle = async (r: any) => {
    const newStatus = status === "sudah" ? "belum" : "sudah";
    await supabase.from("tagihan").update({ status: newStatus }).eq("id", r.id);
    toast.success(`Dipindahkan ke ${newStatus === "sudah" ? "Sudah Bayar" : "Belum Bayar"}`);
    load();
  };
  const del = async (id: string) => {
    if (!confirm("Hapus data ini?")) return;
    await supabase.from("tagihan").delete().eq("id", id);
    load();
  };

  const doExcel = () => exportExcel(`${status}-bayar`, filtered.map((r, i) => ({
    No: i + 1, Nama: r.nama_pelanggan, Tanggal: tanggalID(r.tanggal), "Masuk (M³)": r.pemakaian, "Jumlah (Rp)": Number(r.total),
  })));
  const doPDF = () => exportPDF(`Laporan ${title}`, ["No", "Nama", "Tanggal", "Masuk (M³)", "Jumlah"],
    filtered.map((r, i) => [i + 1, r.nama_pelanggan, tanggalID(r.tanggal), r.pemakaian, rupiah(Number(r.total))]),
    `${status}-bayar`);

  return (
    <AppShell title={title}>
      <Card className="p-4 md:p-6 shadow-card">
        <div className="flex flex-wrap gap-2 items-center justify-between mb-4">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Cari nama..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={doPDF}><FileText className="h-4 w-4 mr-2" />PDF</Button>
            <Button variant="outline" onClick={doExcel}><FileSpreadsheet className="h-4 w-4 mr-2" />Excel</Button>
          </div>
        </div>

        <div className="rounded-lg border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-10">No</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Hari/Tanggal</TableHead>
                <TableHead className="text-right">Masuk (M³)</TableHead>
                <TableHead className="text-right">Jumlah</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Kosong</TableCell></TableRow>}
              {filtered.map((r, i) => (
                <TableRow key={r.id}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell className="font-medium">{r.nama_pelanggan}</TableCell>
                  <TableCell>{tanggalID(r.tanggal)}</TableCell>
                  <TableCell className="text-right">{r.pemakaian}</TableCell>
                  <TableCell className="text-right font-semibold">{rupiah(Number(r.total))}</TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <Button variant="outline" size="sm" onClick={() => toggle(r)}>
                      {status === "sudah" ? "Batalkan" : "Tandai Lunas"}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => del(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-end mt-4">
          <div className={`rounded-lg px-4 py-2 font-semibold shadow-elegant text-white ${status === "sudah" ? "bg-gradient-success" : "bg-destructive"}`}>
            Total: {rupiah(totalJumlah)}
          </div>
        </div>
      </Card>
    </AppShell>
  );
}
