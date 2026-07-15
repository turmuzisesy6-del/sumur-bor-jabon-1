import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Droplets, Lock, User, Phone, UserCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { login, isAuthed } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SUMUR BOR JABON 1 — Sistem Informasi Tagihan" },
      { name: "description", content: "Sistem informasi tagihan air Sumur Bor Jabon 1. Kelola pelanggan, tagihan bulanan, kas, dan cetak struk pembayaran." },
      { property: "og:title", content: "SUMUR BOR JABON 1 — Sistem Informasi Tagihan" },
      { property: "og:description", content: "Sistem informasi tagihan air Sumur Bor Jabon 1. Kelola pelanggan, tagihan bulanan, kas, dan cetak struk pembayaran." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    isAuthed().then((ok) => { if (ok) navigate({ to: "/dashboard" }); });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const ok = await login(username, password);
    setLoading(false);
    if (ok) {
      toast.success("Selamat datang, Petugas TURMUZI!");
      navigate({ to: "/dashboard" });
    } else {
      toast.error("Username atau password salah");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6 text-white">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm shadow-elegant">
            <Droplets className="h-10 w-10" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">SUMUR BOR JABON 1</h1>
          <p className="text-white/85 text-sm mt-1">Sistem Informasi Tagihan Air</p>

          <div className="mt-4 inline-flex items-center gap-4 rounded-lg bg-white/10 backdrop-blur-sm px-4 py-2 text-sm">
            <span className="flex items-center gap-1.5"><UserCircle2 className="h-4 w-4" /> TURMUZI</span>
            <span className="opacity-50">•</span>
            <span className="flex items-center gap-1.5"><Phone className="h-4 w-4" /> 0877-1300-0682</span>
          </div>
        </div>

        <Card className="p-6 shadow-elegant">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="u">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="u" value={username} onChange={(e) => setUsername(e.target.value)}
                  placeholder="TURMUZI" className="pl-9" autoFocus required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="p">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="p" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••" className="pl-9" required />
              </div>
            </div>
            <Button type="submit" className="w-full bg-gradient-primary shadow-elegant" size="lg">
              Masuk
            </Button>
          </form>
        </Card>

        <p className="text-center text-xs text-white/70 mt-6">
          © 2026 Sumur Bor Jabon 1 · Dikelola oleh TURMUZI
        </p>
      </div>
    </div>
  );
}
