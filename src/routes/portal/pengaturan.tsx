import { createFileRoute } from "@tanstack/react-router";
import { PortalShell } from "@/components/PortalShell";
import { usePortal } from "@/lib/use-portal";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Info, MessageCircle, Globe, Mail, Phone } from "lucide-react";

export const Route = createFileRoute("/portal/pengaturan")({
  head: () => ({
    meta: [
      { title: "Pengaturan — Portal Pelanggan Sumur Bor Jabon 1" },
      { name: "description", content: "Informasi aplikasi portal pelanggan, versi, dan kontak WhatsApp petugas Sumur Bor Jabon 1." },
      { property: "og:title", content: "Pengaturan — Portal Pelanggan Sumur Bor Jabon 1" },
      { property: "og:description", content: "Informasi aplikasi, versi, dan kontak WhatsApp petugas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

function Page() {
  const { data, refreshing, refresh } = usePortal();
  const s = data?.pengaturan;
  const hp = s?.no_hp_petugas || "0877-1300-0682";
  const wa = `https://wa.me/62${hp.replace(/\D/g, "").replace(/^0/, "")}`;

  return (
    <PortalShell title="Pengaturan" onRefresh={refresh} refreshing={refreshing}>
      <Card className="p-4 shadow-card">
        <h3 className="mb-3 flex items-center gap-2 font-semibold"><Info className="h-4 w-4 text-primary" />Tentang Aplikasi</h3>
        <div className="space-y-2 text-sm">
          <Row l="Nama Sumur" v={s?.nama_sumur || "SUMUR BOR JABON 1"} />
          <Row l="Aplikasi" v="Portal Pelanggan" />
          <Row l="Versi" v="1.0.0" />
          <Row l="Tarif Air" v={`Rp ${(s?.tarif ?? 2000).toLocaleString("id-ID")} / M³`} />
          <Row l="Beban" v={`Rp ${(s?.beban ?? 10000).toLocaleString("id-ID")}`} />
        </div>
      </Card>

      <Card className="p-4 shadow-card">
        <h3 className="mb-3 font-semibold">Hubungi Petugas</h3>
        <div className="space-y-2 text-sm">
          <Row l="Nama Petugas" v={s?.nama_petugas || "TURMUZI"} />
          <div className="flex justify-between"><span className="text-muted-foreground flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />WhatsApp</span><span className="font-medium">{hp}</span></div>
          {s?.email && <div className="flex justify-between"><span className="text-muted-foreground flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />Email</span><span className="font-medium">{s.email}</span></div>}
          {s?.website && <div className="flex justify-between"><span className="text-muted-foreground flex items-center gap-1.5"><Globe className="h-3.5 w-3.5" />Website</span><span className="font-medium">{s.website}</span></div>}
        </div>
        <Button asChild className="mt-4 w-full bg-success text-success-foreground hover:bg-success/90">
          <a href={wa} target="_blank" rel="noreferrer"><MessageCircle className="mr-2 h-4 w-4" />Chat WhatsApp Petugas</a>
        </Button>
      </Card>

      <p className="pb-2 text-center text-xs text-muted-foreground">© 2026 Sumur Bor Jabon 1</p>
    </PortalShell>
  );
}

function Row({ l, v }: { l: string; v: string }) {
  return <div className="flex justify-between gap-4"><span className="text-muted-foreground">{l}</span><span className="text-right font-medium">{v}</span></div>;
}
