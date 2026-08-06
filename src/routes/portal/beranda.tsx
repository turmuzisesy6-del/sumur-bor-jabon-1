import { createFileRoute } from "@tanstack/react-router";
import { PortalShell } from "@/components/PortalShell";
import { usePortal } from "@/lib/use-portal";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { rupiah, tanggalID } from "@/lib/format";
import { downloadStrukJPG, downloadStrukPDF } from "@/lib/struk";
import {
  FileText, Image as ImageIcon, MessageCircle, UserCog, Droplets, TrendingUp, BellRing,
} from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { toast } from "sonner";

export const Route = createFileRoute("/portal/beranda")({
  head: () => ({
    meta: [
      { title: "Beranda Pelanggan — Sumur Bor Jabon 1" },
      { name: "description", content: "Lihat tagihan air bulan berjalan, pemakaian M³, total bayar, dan status pembayaran Anda." },
      { property: "og:title", content: "Beranda Pelanggan — Sumur Bor Jabon 1" },
      { property: "og:description", content: "Tagihan air bulan berjalan, pemakaian, dan status pembayaran Anda." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

const bulanTahun = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", { month: "long", year: "numeric" });

function Page() {
  const { data, loading, refreshing, refresh } = usePortal();

  if (loading && !data) {
    return (
      <PortalShell title="Beranda">
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="h-56 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </PortalShell>
    );
  }
  if (!data) return <PortalShell title="Beranda"><p className="text-muted-foreground">Memuat…</p></PortalShell>;

  const { pelanggan, tagihan, pengaturan } = data;
  const t = tagihan[0];
  const lunas = t?.status === "sudah";
  const hpPetugas = pengaturan?.no_hp_petugas || "0877-1300-0682";
  const waLink = `https://wa.me/62${hpPetugas.replace(/\D/g, "").replace(/^0/, "")}?text=${encodeURIComponent(
    `Halo ${pengaturan?.nama_petugas || "Petugas"}, saya ${pelanggan.nama} ingin bertanya soal tagihan air.`,
  )}`;

  const chart = [...tagihan].slice(0, 6).reverse().map((x) => ({
    bulan: new Date(x.tanggal).toLocaleDateString("id-ID", { month: "short" }),
    pemakaian: Number(x.pemakaian) || 0,
  }));

  const struk = () => ({
    namaSumur: pengaturan?.nama_sumur || "SUMUR BOR JABON 1",
    namaPetugas: pengaturan?.nama_petugas || "TURMUZI",
    hpPetugas,
    namaPelanggan: pelanggan.nama,
    hpPelanggan: pelanggan.no_hp || "-",
    tanggal: t.tanggal,
    meterLama: Number(t.meter_lama),
    meterBaru: Number(t.meter_baru),
    pemakaian: Number(t.pemakaian),
    tarif: Number(t.tarif),
    beban: Number(t.beban),
    total: Number(t.total),
  });

  return (
    <PortalShell title="Beranda" onRefresh={() => { refresh(); toast.success("✅ Tagihan berhasil dimuat"); }} refreshing={refreshing}>
      {/* Notifikasi tagihan bar */}
      {t && !lunas && (
        <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm animate-in slide-in-from-top-2">
          <BellRing className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <span>Tagihan <strong>{bulanTahun(t.tanggal)}</strong> sebesar <strong>{rupiah(Number(t.total))}</strong> belum dibayar.</span>
        </div>
      )}

      {/* Profil */}
      <Card className="overflow-hidden shadow-card">
        <div className="bg-gradient-primary p-4 text-primary-foreground">
          <p className="text-xs opacity-80">Petugas: {pengaturan?.nama_petugas || "TURMUZI"} · {hpPetugas}</p>
          <h2 className="mt-1 text-xl font-bold">{pelanggan.nama}</h2>
          <p className="text-sm opacity-90">{pelanggan.no_hp || "-"}</p>
        </div>
        <div className="grid grid-cols-2 gap-3 p-4 text-sm">
          <div><p className="text-muted-foreground text-xs">No. Pelanggan</p><p className="font-medium">{pelanggan.nomor_pelanggan || "-"}</p></div>
          <div><p className="text-muted-foreground text-xs">Status</p>
            <Badge className={pelanggan.status_aktif ? "bg-success text-success-foreground" : "bg-muted"}>
              {pelanggan.status_aktif ? "AKTIF" : "NONAKTIF"}
            </Badge>
          </div>
          <div className="col-span-2"><p className="text-muted-foreground text-xs">Alamat</p><p className="font-medium">{pelanggan.alamat || "-"}</p></div>
        </div>
      </Card>

      {/* Tagihan bulan berjalan */}
      <Card className="p-4 shadow-card">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-semibold"><Droplets className="h-4 w-4 text-primary" />Tagihan Bulan Berjalan</h3>
          {t && (
            <Badge className={lunas ? "bg-success text-success-foreground" : "bg-destructive text-destructive-foreground"}>
              {lunas ? "SUDAH BAYAR" : "BELUM BAYAR"}
            </Badge>
          )}
        </div>

        {!t ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Belum ada tagihan.</p>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">{bulanTahun(t.tanggal)} · {tanggalID(t.tanggal)}</p>
            <div className="mt-3 space-y-1.5 text-sm">
              <Row l="Meter Lama" v={`${t.meter_lama} M³`} />
              <Row l="Meter Baru" v={`${t.meter_baru} M³`} />
              <Row l="Pemakaian" v={`${t.pemakaian} M³`} bold />
              <div className="my-2 border-t" />
              <Row l="Tarif Air" v={`${rupiah(Number(t.tarif))} / M³`} />
              <Row l="Beban" v={rupiah(Number(t.beban))} />
            </div>
            <div className="mt-3 rounded-xl bg-gradient-primary p-4 text-primary-foreground">
              <p className="text-xs opacity-85">Total Tagihan</p>
              <p className="text-2xl font-bold">{rupiah(Number(t.total))}</p>
            </div>

            {lunas ? (
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={() => downloadStrukPDF(struk(), `struk-${pelanggan.nama}.pdf`)}>
                  <FileText className="mr-2 h-4 w-4" />Struk PDF
                </Button>
                <Button variant="outline" onClick={() => downloadStrukJPG(struk(), `struk-${pelanggan.nama}.jpg`)}>
                  <ImageIcon className="mr-2 h-4 w-4" />Struk JPG
                </Button>
              </div>
            ) : (
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Struk dapat diunduh setelah pembayaran dikonfirmasi petugas.
              </p>
            )}
          </>
        )}
      </Card>

      {/* Grafik pemakaian */}
      {chart.length > 0 && (
        <Card className="p-4 shadow-card">
          <h3 className="mb-3 flex items-center gap-2 font-semibold"><TrendingUp className="h-4 w-4 text-success" />Pemakaian Air Bulanan</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chart}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                <XAxis dataKey="bulan" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis fontSize={11} tickLine={false} axisLine={false} width={28} />
                <Tooltip formatter={(v: number) => [`${v} M³`, "Pemakaian"]} />
                <Bar dataKey="pemakaian" fill="var(--primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-2">
        <Button asChild className="bg-success text-success-foreground hover:bg-success/90">
          <a href={waLink} target="_blank" rel="noreferrer"><MessageCircle className="mr-2 h-4 w-4" />WhatsApp Petugas</a>
        </Button>
        <Button variant="outline" asChild>
          <a href="/portal/profil"><UserCog className="mr-2 h-4 w-4" />Ajukan Perubahan</a>
        </Button>
      </div>
    </PortalShell>
  );
}

function Row({ l, v, bold }: { l: string; v: string; bold?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{l}</span>
      <span className={bold ? "font-semibold" : "font-medium"}>{v}</span>
    </div>
  );
}
