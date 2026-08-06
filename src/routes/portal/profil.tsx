import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PortalShell } from "@/components/PortalShell";
import { usePortal } from "@/lib/use-portal";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { tanggalID } from "@/lib/format";
import { portalAjukanPerubahan } from "@/lib/portal.functions";
import { clearPortalId } from "@/lib/portal-session";
import { LogOut, Send, Clock, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/portal/profil")({
  head: () => ({
    meta: [
      { title: "Profil Saya — Sumur Bor Jabon 1" },
      { name: "description", content: "Lihat data pelanggan Anda dan kirim pengajuan perubahan nama atau nomor HP untuk disetujui petugas." },
      { property: "og:title", content: "Profil Saya — Sumur Bor Jabon 1" },
      { property: "og:description", content: "Data pelanggan dan pengajuan perubahan nama atau nomor HP." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

function Page() {
  const navigate = useNavigate();
  const { data, loading, refreshing, refresh } = usePortal();
  const [nama, setNama] = useState("");
  const [hp, setHp] = useState("");
  const [sending, setSending] = useState(false);
  const [notified, setNotified] = useState(false);

  const p = data?.pelanggan;
  const aju = data?.pengajuan ?? null;
  const menunggu = aju?.status === "menunggu";

  useEffect(() => {
    if (p) { setNama(p.nama); setHp(p.no_hp || ""); }
  }, [p?.id, p?.nama, p?.no_hp]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (aju?.status === "ditolak" && !notified) {
      toast.error("❌ Pengajuan ditolak Admin");
      setNotified(true);
    }
  }, [aju?.status, notified]);

  const kirim = async () => {
    if (!p) return;
    if (!nama.trim() || hp.replace(/\D/g, "").length < 6) return toast.error("Nama dan nomor HP wajib diisi benar");
    setSending(true);
    try {
      const res = await portalAjukanPerubahan({ data: { id: p.id, nama_baru: nama.trim(), no_hp_baru: hp.trim() } });
      if (res.ok) {
        toast.success("✅ Pengajuan berhasil dikirim");
        refresh();
      } else {
        toast.error(res.error || "Gagal mengirim pengajuan");
      }
    } catch {
      toast.error("❌ Gagal terhubung ke server");
    } finally {
      setSending(false);
    }
  };

  const keluar = () => { clearPortalId(); navigate({ to: "/portal" }); };

  if (loading && !data) {
    return <PortalShell title="Profil Saya"><Skeleton className="h-40 w-full rounded-xl" /><Skeleton className="h-56 w-full rounded-xl" /></PortalShell>;
  }
  if (!p) return <PortalShell title="Profil Saya"><p className="text-muted-foreground">Memuat…</p></PortalShell>;

  return (
    <PortalShell title="Profil Saya" onRefresh={refresh} refreshing={refreshing}>
      <Card className="p-4 shadow-card">
        <div className="flex items-center gap-3">
          <Avatar className="h-14 w-14">
            {p.foto_url ? <AvatarImage src={p.foto_url} alt={p.nama} /> : null}
            <AvatarFallback>{p.nama[0]}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-lg font-bold">{p.nama}</p>
            <p className="text-sm text-muted-foreground">{p.no_hp || "-"}</p>
          </div>
        </div>
        <div className="mt-4 space-y-2 text-sm">
          <Item l="Alamat" v={p.alamat || "-"} />
          <Item l="No. Pelanggan" v={p.nomor_pelanggan || "-"} />
          <Item l="Tanggal Bergabung" v={tanggalID(p.created_at)} />
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status Pelanggan</span>
            <Badge className={p.status_aktif ? "bg-success text-success-foreground" : "bg-muted"}>
              {p.status_aktif ? "AKTIF" : "NONAKTIF"}
            </Badge>
          </div>
        </div>
      </Card>

      {aju && (
        <Card className={`p-4 shadow-card ${menunggu ? "border-warning/40 bg-warning/5" : ""}`}>
          <div className="flex items-center gap-2 font-semibold">
            {menunggu && <><Clock className="h-4 w-4 text-warning" />Menunggu Persetujuan Admin</>}
            {aju.status === "disetujui" && <><CheckCircle2 className="h-4 w-4 text-success" />Pengajuan Selesai</>}
            {aju.status === "ditolak" && <><XCircle className="h-4 w-4 text-destructive" />Pengajuan Ditolak</>}
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {menunggu && "Pengajuan perubahan data telah dikirim dan sedang menunggu persetujuan petugas."}
            {aju.status === "disetujui" && "Perubahan data Anda telah disetujui petugas."}
            {aju.status === "ditolak" && `Alasan: ${aju.alasan_penolakan || "Tidak disebutkan"}. Data lama tetap digunakan.`}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Diajukan {tanggalID(aju.created_at)} · {aju.nama_lama} / {aju.no_hp_lama} → {aju.nama_baru} / {aju.no_hp_baru}
          </p>
        </Card>
      )}

      <Card className="p-4 shadow-card">
        <h3 className="font-semibold">Edit Profil</h3>
        <p className="mb-3 text-xs text-muted-foreground">
          Perubahan tidak langsung berlaku — harus disetujui petugas terlebih dahulu.
        </p>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted/50 p-3 text-xs">
            <div><p className="text-muted-foreground">Nama Lama</p><p className="font-medium">{p.nama}</p></div>
            <div><p className="text-muted-foreground">No. HP Lama</p><p className="font-medium">{p.no_hp || "-"}</p></div>
          </div>
          <div><Label>Nama Baru</Label><Input value={nama} onChange={(e) => setNama(e.target.value)} disabled={menunggu} /></div>
          <div><Label>Nomor HP Baru</Label><Input inputMode="tel" value={hp} onChange={(e) => setHp(e.target.value)} disabled={menunggu} /></div>
          <Button onClick={kirim} disabled={menunggu || sending} className="w-full bg-gradient-primary">
            {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            Kirim Pengajuan
          </Button>
        </div>
      </Card>

      <Button variant="outline" onClick={keluar} className="w-full text-destructive">
        <LogOut className="mr-2 h-4 w-4" />Keluar
      </Button>
    </PortalShell>
  );
}

function Item({ l, v }: { l: string; v: string }) {
  return <div className="flex justify-between gap-4"><span className="text-muted-foreground">{l}</span><span className="text-right font-medium">{v}</span></div>;
}
