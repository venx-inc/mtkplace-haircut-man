"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendVerificationStatusEmail } from "@/lib/email";

async function setVerificationStatus(
  professionalId: string,
  status: "verificado" | "rejeitado"
) {
  const supabase = await createClient();
  const { data: professional, error } = await supabase
    .from("professionals")
    .update({ verification_status: status })
    .eq("id", professionalId)
    .select("business_name, profile_id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (professional) {
    const { data } = await createAdminClient().auth.admin.getUserById(professional.profile_id);
    if (data.user?.email) {
      await sendVerificationStatusEmail(data.user.email, professional.business_name, status);
    }
  }

  revalidatePath("/admin");
}

export async function approveProfessional(professionalId: string) {
  await setVerificationStatus(professionalId, "verificado");
}

export async function rejectProfessional(professionalId: string) {
  await setVerificationStatus(professionalId, "rejeitado");
}
