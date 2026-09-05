"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type ProfessionalFormState = { status: "idle" | "error"; message?: string };

function toSlug(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function createProfessional(
  _prevState: ProfessionalFormState,
  formData: FormData
): Promise<ProfessionalFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", message: "Faça login como profissional antes de continuar." };
  }

  const businessName = String(formData.get("businessName") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const state = String(formData.get("state") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim() || null;

  if (!businessName || !city || !state) {
    return { status: "error", message: "Preencha nome do negócio, cidade e estado." };
  }

  const slug = `${toSlug(businessName)}-${user.id.slice(0, 6)}`;

  const { error } = await supabase.from("professionals").insert({
    profile_id: user.id,
    business_name: businessName,
    slug,
    city,
    state,
    bio,
  });

  if (error) {
    return { status: "error", message: "Não deu para salvar. " + error.message };
  }

  redirect(`/profissional/${slug}`);
}
