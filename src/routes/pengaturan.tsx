import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Lock, Download, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { setPassword, getPassword } from "@/lib/auth";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/pengaturan")({
  head: () => ({ meta: [{ title: "Pengaturan — SUMUR BOR JABON 1" }] }),
  component: Page,
});

function Page() {
  const [cfg, setCfg] = useState<any>({
    nama_sumur: "SUMUR BOR JABON 1", nama_petugas: "TURMUZI", no_hp_petugas: "0877-1300-0682",
    tarif: 2000, beban: 10000, email: "", website: "",
  });
  const [pwd, setPwd] = useState({ current: "", next: "", confirm: "" });

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("pengaturan").select("*").eq("id", 1).single();
      if (data) setCfg(data);
    })();
  }, []);

  const save = async () => {
    await supabase.from("pengaturan").update({
      nama_sumur: cfg.nama_sumur, nama_petugas: cfg.nama_petugas, no_hp_petugas: cfg.no_hp_petugas,
      tarif: Number(cfg.tarif), beban: Number(cfg.beban), email: cfg.email, website: cfg.website,
    }).eq("id", 1);
    toast.success("Pengaturan disimpan");
  };

  const changePwd = () => {
    if (pwd.current !== getPassword()) return toast.error("Password saat ini salah");
    if (!pwd.next || pwd.next !== pwd.confirm) return toast.error("Konfirmasi password tidak cocok");
    setPassword(pwd.next);
    supabase.from("pengaturan").update({ password: pwd.next }).eq("id", 1);
    toast.success("Password berhasil diubah");
    setPwd({ current: "", next: "", confirm: "" });
  };

  const backup = async () => {
    const [p, t, k, s] = await Promise.all([
      supabase.from("pelanggan").select("*"),
      supabase.from("tagihan").select("*"),
      supabase.from("kas").select("*"),
      supabase.from("pengaturan").select("*"),
    ]);
    const blob = new Blob([JSON.stringify({ pelanggan: p.data, tagihan: t.data, kas: k.data, pengaturan: s.data }, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `backup-sumur-bor-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    toast.success("Backup diunduh");
  };

  const restore = async (f: File | null) => {
    if (!f) return;
    if (!confirm("Restore akan mengganti seluruh data. Lanjutkan?")) return;
    const txt = await f.text();
    const j = JSON.parse(txt);
    if (j.pelanggan) { await supabase.from("pelanggan").delete().not("id", "is", null); await supabase.from("pelanggan").insert(j.pelanggan); }
    if (j.tagihan) { await supabase.from("tagihan").delete().not("id", "is", null); await supabase.from("tagihan").insert(j.tagihan); }
    if (j.kas) { await supabase.from("kas").delete().not("id", "is", null); await supabase.from("kas").insert(j.kas); }
    toast.success("Data berhasil dipulihkan");
  };

  return (
    <AppShell title="Pengaturan">
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-5 shadow-card">
          <h2 className="font-semibold mb-4">Informasi Sumur</h2>
          <div className="space-y-3">
            <div><Label>Nama Sumur BOR</Label><Input value={cfg.nama_sumur || ""} onChange={(e) => setCfg({ ...cfg, nama_sumur: e.target.value })} /></div>
            <div><Label>Nama Petugas</Label><Input value={cfg.nama_petugas || ""} onChange={(e) => setCfg({ ...cfg, nama_petugas: e.target.value })} /></div>
            <div><Label>No. HP Petugas</Label><Input value={cfg.no_hp_petugas || ""} onChange={(e) => setCfg({ ...cfg, no_hp_petugas: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Tarif per M³</Label><Input type="number" value={cfg.tarif || 0} onChange={(e) => setCfg({ ...cfg, tarif: e.target.value })} /></div>
              <div><Label>Beban</Label><Input type="number" value={cfg.beban || 0} onChange={(e) => setCfg({ ...cfg, beban: e.target.value })} /></div>
            </div>
            <div><Label>Email</Label><Input type="email" value={cfg.email || ""} onChange={(e) => setCfg({ ...cfg, email: e.target.value })} /></div>
            <div><Label>Website</Label><Input value={cfg.website || ""} onChange={(e) => setCfg({ ...cfg, website: e.target.value })} /></div>
            <Button onClick={save} className="bg-gradient-primary w-full"><Save className="h-4 w-4 mr-2" />Simpan Perubahan</Button>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-5 shadow-card">
            <h2 className="font-semibold mb-4 flex items-center gap-2"><Lock className="h-4 w-4" />Ganti Password</h2>
            <div className="space-y-3">
              <div><Label>Password Saat Ini</Label><Input type="password" value={pwd.current} onChange={(e) => setPwd({ ...pwd, current: e.target.value })} /></div>
              <div><Label>Password Baru</Label><Input type="password" value={pwd.next} onChange={(e) => setPwd({ ...pwd, next: e.target.value })} /></div>
              <div><Label>Konfirmasi</Label><Input type="password" value={pwd.confirm} onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })} /></div>
              <Button onClick={changePwd} variant="outline" className="w-full">Ubah Password</Button>
            </div>
          </Card>

          <Card className="p-5 shadow-card">
            <h2 className="font-semibold mb-4">Backup & Restore Data</h2>
            <div className="space-y-2">
              <Button onClick={backup} variant="outline" className="w-full"><Download className="h-4 w-4 mr-2" />Backup Database</Button>
              <label>
                <input type="file" accept=".json" className="hidden" onChange={(e) => restore(e.target.files?.[0] || null)} />
                <span className="flex items-center justify-center gap-2 border rounded-md px-3 py-2 text-sm cursor-pointer hover:bg-accent">
                  <Upload className="h-4 w-4" /> Restore Database
                </span>
              </label>
            </div>
            <Separator className="my-4" />
            <p className="text-xs text-muted-foreground">
              Backup berisi seluruh data pelanggan, tagihan, dan kas. Simpan file dengan aman.
            </p>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
