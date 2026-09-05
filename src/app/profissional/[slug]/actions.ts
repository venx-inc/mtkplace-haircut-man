"use server";

import { createClient } from "@/lib/supabase/server";

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

  return { status: "success", message: "Solicitação enviada! O profissional entra em contato." };
}
