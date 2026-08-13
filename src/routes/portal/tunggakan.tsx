import { createFileRoute } from "@tanstack/react-router";
import { PortalShell } from "@/components/PortalShell";
import { usePortal } from "@/lib/use-portal";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { rupiah } from "@/lib/format";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/portal/tunggakan")({
  head: () => ({
    meta: [
      { title: "Tunggakan Belum Bayar — Sumur Bor Jabon 1" },
      { name: "description", content: "Daftar tagihan air yang belum dibayar beserta total tunggakan pelanggan Sumur Bor Jabon 1." },
      { property: "og:title", content: "Tunggakan Belum Bayar — Sumur Bor Jabon 1" },
      { property: "og:description", content: "Lihat tagihan yang belum dibayar dan total tunggakan Anda." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

function Page() {
  const { data, loading, refreshing, refresh } = usePortal();

  const rows = (data?.tagihan || []).filter((t) => t.status !== "sudah");
  const total = rows.reduce((s, t) => s + Number(t.total || 0), 0);

  return (
    <PortalShell title="Tunggakan" onRefresh={refresh} refreshing={refreshing}>
      {loading && !data && (
        <>
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </>
      )}

      {data && (
        <Card className={`p-5 shadow-card ${rows.length ? "bg-destructive/10 border-destructive/30" : "bg-success/10 border-success/30"}`}>
          <div className="flex items-center gap-3">
            {rows.length ? (
              <AlertTriangle className="h-8 w-8 text-destructive" />
            ) : (
              <CheckCircle2 className="h-8 w-8 text-success" />
            )}
            <div>
              <p className="text-xs text-muted-foreground">
                {rows.length ? `${rows.length} tagihan belum dibayar` : "Tidak ada tunggakan"}
              </p>
              <p className="text-2xl font-bold">{rupiah(total)}</p>
            </div>
          </div>
        </Card>
      )}

      {rows.map((t) => (
        <Card key={t.id} className="flex items-center justify-between p-4 shadow-card">
          <div>
            <p className="font-semibold">
              {new Date(t.tanggal).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}
            </p>
            <p className="text-xs text-muted-foreground">
              {t.pemakaian} M³ • meter {t.meter_lama} → {t.meter_baru}
            </p>
          </div>
          <div className="text-right">
            <p className="font-bold">{rupiah(Number(t.total))}</p>
            <Badge className="mt-1 bg-destructive text-destructive-foreground">BELUM BAYAR</Badge>
          </div>
        </Card>
      ))}

      {data && rows.length > 0 && (
        <p className="px-1 text-center text-xs text-muted-foreground">
          Silakan hubungi petugas untuk melakukan pembayaran tunggakan Anda.
        </p>
      )}
    </PortalShell>
  );
}
