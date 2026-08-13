import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const DEFAULT_EMAIL = "turmuzi@sumurbor.jabon1.local";
const DEFAULT_PASSWORD = "JABON1";

/**
 * Ensures the default operator account (TURMUZI) exists in Supabase Auth.
 * Idempotent — safe to call before every login attempt.
 * Uses the service role admin client server-side only.
 */
export const ensureDefaultOperator = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({}).optional().parse(data ?? {})
  )
  .handler(async () => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // List users and check if the default operator already exists
    const { data: list, error: listErr } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 200,
    });
    if (listErr) throw listErr;

    const ensureAdminRole = async (userId: string) => {
      await supabaseAdmin
        .from("user_roles")
        .upsert({ user_id: userId, role: "admin" }, { onConflict: "user_id,role" });
    };

    const existing = list.users.find((u) => u.email === DEFAULT_EMAIL);
    if (existing) {
      await ensureAdminRole(existing.id);
      return { ok: true, email: DEFAULT_EMAIL, created: false };
    }

    const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email: DEFAULT_EMAIL,
      password: DEFAULT_PASSWORD,
      email_confirm: true,
      user_metadata: { username: "TURMUZI" },
    });
    if (createErr) throw createErr;
    if (created?.user) await ensureAdminRole(created.user.id);

    return { ok: true, email: DEFAULT_EMAIL, created: true };
  });

export const OPERATOR_EMAIL = DEFAULT_EMAIL;
