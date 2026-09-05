"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ContactStatus } from "@/types/database.types";

export async function updateLeadStatus(leadId: string, status: ContactStatus) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("contact_requests")
    .update({ status })
    .eq("id", leadId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/painel");
}
