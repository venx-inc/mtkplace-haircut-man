"use server";

import { randomUUID } from "crypto";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { sendSignupConfirmationEmail } from "@/lib/email";
import { geocodeCity } from "@/lib/geocode";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

export type ProfessionalFormState = { status: "idle" | "error"; message?: string };

const BUCKET = "professional-photos";
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function toSlug(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function extensionFor(file: File) {
  const fromName = file.name.split(".").pop();
  if (fromName && fromName.length <= 5) return fromName.toLowerCase();
  return file.type.split("/").pop() ?? "jpg";
}

class ImageValidationError extends Error {}

async function uploadImage(
  supabase: SupabaseClient<Database>,
  userId: string,
  prefix: string,
  file: File
) {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new ImageValidationError(`Formato de imagem não suportado em "${file.name}". Use JPG, PNG ou WebP.`);
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new ImageValidationError(`A imagem "${file.name}" passa de 5MB.`);
  }

  const path = `${userId}/${prefix}-${randomUUID()}.${extensionFor(file)}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    throw new Error(`Não deu para enviar a imagem "${file.name}". ${error.message}`);
  }

  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

function readFile(formData: FormData, key: string): File | null {
  const value = formData.get(key);
  return value instanceof File && value.size > 0 ? value : null;
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

  const { data: professional, error } = await supabase
    .from("professionals")
    .insert({
      profile_id: user.id,
      business_name: businessName,
      slug,
      city,
      state,
      bio,
    })
    .select()
    .single();

  if (error || !professional) {
    return { status: "error", message: "Não deu para salvar. " + (error?.message ?? "") };
  }

  if (user.email) {
    await sendSignupConfirmationEmail(user.email, businessName);
  }

  const coordinates = await geocodeCity(city, state);
  if (coordinates) {
    await supabase
      .from("professionals")
      .update({ latitude: coordinates.latitude, longitude: coordinates.longitude })
      .eq("id", professional.id);
  }

  try {
    const coverImage = readFile(formData, "coverImage");
    if (coverImage) {
      const coverUrl = await uploadImage(supabase, user.id, "cover", coverImage);
      await supabase
        .from("professionals")
        .update({ cover_image_url: coverUrl })
        .eq("id", professional.id);
    }

    const caseCount = Number(formData.get("caseCount") ?? 0);
    for (let i = 0; i < caseCount; i += 1) {
      const title = String(formData.get(`case-${i}-title`) ?? "").trim();
      const before = readFile(formData, `case-${i}-before`);
      const after = readFile(formData, `case-${i}-after`);

      if (!title || !before || !after) continue;

      const [beforeUrl, afterUrl] = await Promise.all([
        uploadImage(supabase, user.id, `case-${i}-before`, before),
        uploadImage(supabase, user.id, `case-${i}-after`, after),
      ]);

      await supabase.from("portfolio_cases").insert({
        professional_id: professional.id,
        title,
        before_image_url: beforeUrl,
        after_image_url: afterUrl,
      });
    }
  } catch (err) {
    const message = err instanceof ImageValidationError || err instanceof Error
      ? err.message
      : "Não deu para enviar as imagens.";
    return {
      status: "error",
      message: `Cadastro criado, mas ${message} Você pode adicionar fotos depois.`,
    };
  }

  redirect(`/profissional/${slug}`);
}
