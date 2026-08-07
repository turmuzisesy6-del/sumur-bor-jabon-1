import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Droplets, Phone, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { portalLogin, portalLoginToken } from "@/lib/portal.functions";
import { getPortalId, setPortalId } from "@/lib/portal-session";

export const Route = createFileRoute("/portal/")({
  head: () => ({
    meta: [
      { title: "Portal Pelanggan — Sumur Bor Jabon 1" },
      { name: "description", content: "Cek tagihan air, riwayat pemakaian, dan unduh struk pembayaran Sumur Bor Jabon 1 hanya dengan nomor HP." },
      { property: "og:title", content: "Portal Pelanggan — Sumur Bor Jabon 1" },
      { property: "og:description", content: "Cek tagihan air, riwayat pemakaian, dan unduh struk pembayaran hanya dengan nomor HP." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PortalLogin,
});

function PortalLogin() {
  const navigate = useNavigate();
  const [hp, setHp] = useState("");
  const [loading, setLoading] = useState(false);
  const [splash, setSplash] = useState(true);

  const [autoLogin, setAutoLogin] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("t") || params.get("token");

    if (token) {
      portalLoginToken({ data: { token } })
        .then((res) => {
          if (res.ok) {
            setPortalId(res.id);
            toast.success("✅ Login berhasil");
            navigate({ to: "/portal/beranda" });
          } else {
            toast.error("❌ Tautan tidak valid atau sudah kedaluwarsa");
            setAutoLogin(false);
            setSplash(false);
          }
        })
        .catch(() => {
          toast.error("❌ Gagal terhubung ke server");
          setAutoLogin(false);
          setSplash(false);
        });
      return;
    }

    setAutoLogin(false);
    if (getPortalId()) { navigate({ to: "/portal/beranda" }); return; }
    const t = setTimeout(() => setSplash(false), 1100);
    return () => clearTimeout(t);
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await portalLogin({ data: { no_hp: hp } });
      if (res.ok) {
        setPortalId(res.id);
        toast.success("✅ Login berhasil");
        navigate({ to: "/portal/beranda" });
      } else {
        toast.error("❌ Nomor HP tidak terdaftar");
      }
    } catch {
      toast.error("❌ Gagal terhubung ke server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className={`text-center text-white transition-all duration-700 ${splash ? "scale-110" : "scale-100"}`}>
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-white/20 backdrop-blur-sm shadow-elegant animate-in zoom-in duration-500">
            <Droplets className="h-10 w-10" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">SUMUR BOR JABON 1</h1>
          <p className="text-white/85 text-sm mt-1">Portal Pelanggan</p>
        </div>

        {splash ? (
          <div className="mt-10 flex flex-col items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-white/80" />
            {autoLogin && <p className="text-white/80 text-sm">Membuka portal Anda...</p>}
          </div>
        ) : (
          <Card className="mt-6 p-6 shadow-elegant animate-in fade-in slide-in-from-bottom-4 duration-500">
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="hp">Nomor HP Terdaftar</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="hp" inputMode="tel" value={hp} onChange={(e) => setHp(e.target.value)}
                    placeholder="0812xxxxxxx" className="pl-9" autoFocus required />
                </div>
                <p className="text-xs text-muted-foreground">Masuk cukup dengan nomor HP, tanpa password.</p>
              </div>
              <Button type="submit" disabled={loading} size="lg"
                className="w-full bg-gradient-primary shadow-elegant">
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Memeriksa...</> : "Masuk"}
              </Button>
            </form>
          </Card>
        )}

        <p className="text-center text-xs text-white/70 mt-6">© 2026 Sumur Bor Jabon 1</p>
      </div>
    </div>
  );
}
