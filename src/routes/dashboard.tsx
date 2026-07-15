import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Users, Receipt, Wallet, CheckCircle2, XCircle, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { rupiah } from "@/lib/format";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — SUMUR BOR JABON 1" }] }),
  component: Dashboard,
});

function Dashboard() {
  const [stats, setStats] = useState({ pelanggan: 0, tagihanBulan: 0, kas: 0, sudah: 0, belum: 0 });
  const [chart, setChart] = useState<{ bulan: string; pendapatan: number }[]>([]);

  useEffect(() => {
    (async () => {
      const [p, t, k] = await Promise.all([
        supabase.from("pelanggan").select("id", { count: "exact", head: true }),
        supabase.from("tagihan").select("total, status, tanggal, created_at"),
        supabase.from("kas").select("masuk, keluar"),
      ]);
      const now = new Date();
      const bulanIni = (t.data || []).filter((r: any) => {
        const d = new Date(r.tanggal || r.created_at);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
      const tagihanBulan = bulanIni.reduce((s: number, r: any) => s + Number(r.total || 0), 0);
      const sudah = (t.data || []).filter((r: any) => r.status === "sudah").reduce((s: number, r: any) => s + Number(r.total || 0), 0);
      const belum = (t.data || []).filter((r: any) => r.status === "belum").reduce((s: number, r: any) => s + Number(r.total || 0), 0);
      const kas = (k.data || []).reduce((s: number, r: any) => s + Number(r.masuk || 0) - Number(r.keluar || 0), 0);
      setStats({ pelanggan: p.count || 0, tagihanBulan, kas, sudah, belum });

      // 6 bulan terakhir
      const buckets: Record<string, number> = {};
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = d.toLocaleDateString("id-ID", { month: "short", year: "2-digit" });
        buckets[key] = 0;
      }
      (t.data || []).forEach((r: any) => {
        if (r.status !== "sudah") return;
        const d = new Date(r.tanggal || r.created_at);
        const key = d.toLocaleDateString("id-ID", { month: "short", year: "2-digit" });
        if (key in buckets) buckets[key] += Number(r.total || 0);
      });
      setChart(Object.entries(buckets).map(([bulan, pendapatan]) => ({ bulan, pendapatan })));
    })();
  }, []);

  const cards = [
    { label: "Jumlah Pelanggan", value: stats.pelanggan.toString(), icon: Users, color: "from-blue-500 to-blue-600" },
    { label: "Tagihan Bulan Ini", value: rupiah(stats.tagihanBulan), icon: Receipt, color: "from-indigo-500 to-indigo-600" },
    { label: "Total Kas", value: rupiah(stats.kas), icon: Wallet, color: "from-emerald-500 to-emerald-600" },
    { label: "Sudah Bayar", value: rupiah(stats.sudah), icon: CheckCircle2, color: "from-green-500 to-green-600" },
    { label: "Belum Bayar", value: rupiah(stats.belum), icon: XCircle, color: "from-rose-500 to-rose-600" },
  ];

  return (
    <AppShell title="Dashboard">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
        {cards.map((c) => (
          <Card key={c.label} className="p-4 shadow-card hover:shadow-elegant transition-shadow">
            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground font-medium">{c.label}</p>
                <p className="text-xl font-bold mt-1 truncate">{c.value}</p>
              </div>
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${c.color} shrink-0`}>
                <c.icon className="h-5 w-5 text-white" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-4 md:p-6 shadow-card">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">Grafik Pendapatan 6 Bulan Terakhir</h2>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chart}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="bulan" fontSize={12} />
              <YAxis fontSize={12} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: any) => rupiah(Number(v))} />
              <Bar dataKey="pendapatan" fill="oklch(0.52 0.18 250)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </AppShell>
  );
}
