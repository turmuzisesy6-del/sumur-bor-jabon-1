import { supabase } from "@/integrations/supabase/client";
import { ensureDefaultOperator } from "./auth-provision.functions";

const OPERATOR_USERNAME = "TURMUZI";
const OPERATOR_EMAIL = "turmuzi@sumurbor.jabon1.local";

export async function isAuthed(): Promise<boolean> {
  const { data } = await supabase.auth.getSession();
  return !!data.session;
}

export async function login(username: string, password: string): Promise<boolean> {
  if (username.trim().toUpperCase() !== OPERATOR_USERNAME) return false;

  // Ensure the default operator account exists (idempotent)
  try {
    await ensureDefaultOperator({ data: {} });
  } catch (e) {
    console.error("Failed to ensure operator account", e);
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: OPERATOR_EMAIL,
    password,
  });
  return !error;
}

export async function logout() {
  await supabase.auth.signOut();
}

export async function changePassword(current: string, next: string): Promise<{ ok: boolean; error?: string }> {
  // Verify current password by re-authenticating
  const { error: signInErr } = await supabase.auth.signInWithPassword({
    email: OPERATOR_EMAIL,
    password: current,
  });
  if (signInErr) return { ok: false, error: "Password saat ini salah" };

  const { error } = await supabase.auth.updateUser({ password: next });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
