import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const ADMIN_EMAIL = "maelajoly@gmail.com";

/** A reader selects a word without explanation and asks a question about it. */
export const submitLexiconRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        partId: z.string().uuid(),
        slidePosition: z.number().int().min(1),
        term: z.string().min(1).max(200),
        question: z.string().max(2000).default(""),
        link: z.string().max(500),
        context: z.string().max(300).default(""),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: request, error } = await context.supabase
      .from("lexicon_requests")
      .insert({
        user_id: context.userId,
        part_id: data.partId,
        slide_position: data.slidePosition,
        term: data.term,
        question: data.question,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);

    const { data: admin } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .ilike("email", ADMIN_EMAIL)
      .maybeSingle();

    if (admin?.id) {
      await supabaseAdmin.from("notifications").insert({
        user_id: admin.id,
        kind: "lexicon_request",
        title: `Nouvelle demande : « ${data.term} »`,
        body: `${data.context} · Diapo ${data.slidePosition}${data.question ? ` — ${data.question}` : ""}`,
        link: data.link,
      });
    }

    return { id: request.id as string };
  });

/** Admin filled an explanation: close matching requests and notify their authors. */
export const resolveLexiconRequests = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        partId: z.string().uuid(),
        slidePosition: z.number().int().min(1),
        term: z.string().min(1).max(200),
        link: z.string().max(500),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const email = String(context.claims['email'] ?? "").toLowerCase();
    if (email !== ADMIN_EMAIL) throw new Error("Forbidden");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: requests } = await supabaseAdmin
      .from("lexicon_requests")
      .select("id, user_id")
      .eq("part_id", data.partId)
      .eq("slide_position", data.slidePosition)
      .eq("term", data.term)
      .eq("status", "pending");

    if (!requests || requests.length === 0) return { notified: 0 };

    await supabaseAdmin
      .from("lexicon_requests")
      .update({ status: "answered", answered_at: new Date().toISOString() })
      .in("id", requests.map((r) => r.id));

    await supabaseAdmin.from("notifications").insert(
      requests.map((r) => ({
        user_id: r.user_id,
        kind: "lexicon_answer",
        title: `Réponse à votre question : « ${data.term} »`,
        body: "L'explication est disponible : cliquez pour revenir à la diapo.",
        link: data.link,
      })),
    );

    return { notified: requests.length };
  });
