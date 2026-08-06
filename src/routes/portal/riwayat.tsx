import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PortalShell } from "@/components/PortalShell";
import { usePortal } from "@/lib/use-portal";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { rupiah } from "@/lib/format";
import { Search, History } from "lucide-react";

export const Route = createFileRoute("/portal/riwayat")({
  head: () => ({
    meta: [
      { title: "Riwayat Tagihan — Sumur Bor Jabon 1" },
      { name: "description", content: "Daftar tagihan air bulan-bulan sebelumnya lengkap dengan pemakaian, total, dan status pembayaran." },
      { property: "og:title", content: "Riwayat Tagihan — Sumur Bor Jabon 1" },
      { property: "og:description", content: "Daftar tagihan air bulan sebelumnya, pemakaian, total, dan status." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

function Page() {
  const { data, loading, refreshing, refresh } = usePortal();
  const [q, setQ] = useState("");

  const rows = (data?.tagihan || []).filter((t) => {
    const label = new Date(t.tanggal).toLocaleDateString("id-ID", { month: "long", year: "numeric" });
    return label.toLowerCase().includes(q.toLowerCase());
  });

  return (
    <PortalShell title="Riwayat Tagihan" onRefresh={refresh} refreshing={refreshing}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari bulan / tahun…" className="pl-9" />
      </div>

      {loading && !data && <><Skeleton className="h-20 w-full rounded-xl" /><Skeleton className="h-20 w-full rounded-xl" /></>}

      {data && rows.length === 0 && (
        <Card className="p-8 text-center text-sm text-muted-foreground shadow-card">
          <History className="mx-auto mb-2 h-8 w-8 opacity-40" />Belum ada riwayat tagihan.
        </Card>
      )}

      {rows.map((t) => {
        const lunas = t.status === "sudah";
        return (
          <Card key={t.id} className="flex items-center justify-between p-4 shadow-card transition-transform active:scale-[0.99]">
            <div>
              <p className="font-semibold">
                {new Date(t.tanggal).toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
              </p>
              <p className="text-xs text-muted-foreground">{t.pemakaian} M³ terpakai</p>
            </div>
            <div className="text-right">
              <p className="font-bold">{rupiah(Number(t.total))}</p>
              <Badge className={`mt-1 ${lunas ? "bg-success text-success-foreground" : "bg-destructive text-destructive-foreground"}`}>
                {lunas ? "SUDAH BAYAR" : "BELUM BAYAR"}
              </Badge>
            </div>
          </Card>
        );
      })}
    </PortalShell>
  );
}
