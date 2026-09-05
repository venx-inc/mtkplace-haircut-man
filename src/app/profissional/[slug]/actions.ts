"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendNewLeadEmail } from "@/lib/email";

export type ContactFormState = { status: "idle" | "success" | "error"; message?: string };

export async function sendContactRequest(
  _prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const professionalId = String(formData.get("professionalId") ?? "");
  const clientName = String(formData.get("clientName") ?? "").trim();
  const clientPhone = String(formData.get("clientPhone") ?? "").trim();
  const clientEmail = String(formData.get("clientEmail") ?? "").trim() || null;
  const message = String(formData.get("message") ?? "").trim() || null;

  if (!professionalId || !clientName || !clientPhone) {
    return { status: "error", message: "Preencha nome e telefone para continuar." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("contact_requests").insert({
    professional_id: professionalId,
    client_name: clientName,
    client_phone: clientPhone,
    client_email: clientEmail,
    message,
  });

  if (error) {
    return { status: "error", message: "Não deu para enviar agora. Tente de novo em instantes." };
  }

  const { data: professional } = await supabase
    .from("professionals")
    .select("business_name, profile_id")
    .eq("id", professionalId)
    .single();

  if (professional) {
    const { data } = await createAdminClient().auth.admin.getUserById(professional.profile_id);
    if (data.user?.email) {
      await sendNewLeadEmail(data.user.email, professional.business_name, clientName, clientPhone);
    }
  }

  return { status: "success", message: "Solicitação enviada! O profissional entra em contato." };
}

export type ReviewFormState = { status: "idle" | "success" | "error"; message?: string };

export async function submitReview(
  _prevState: ReviewFormState,
  formData: FormData
): Promise<ReviewFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", message: "Faça login para avaliar este profissional." };
  }

  const professionalId = String(formData.get("professionalId") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const rating = Number(formData.get("rating") ?? 0);
  const comment = String(formData.get("comment") ?? "").trim() || null;

  if (!professionalId || rating < 1 || rating > 5) {
    return { status: "error", message: "Escolha uma nota de 1 a 5." };
  }

  const { error } = await supabase.from("reviews").insert({
    professional_id: professionalId,
    client_profile_id: user.id,
    rating,
    comment,
  });

  if (error) {
    const message = error.code === "23505"
      ? "Você já avaliou este profissional."
      : "Não deu para enviar a avaliação. " + error.message;
    return { status: "error", message };
  }

  if (slug) revalidatePath(`/profissional/${slug}`);
  return { status: "success", message: "Avaliação enviada, obrigado!" };
}
