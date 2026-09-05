import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { approveProfessional, rejectProfessional } from "./actions";

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16">
        <p className="text-ink/70">
          Você precisa <a href="/login" className="text-brand-700 underline">entrar</a> como
          administrador para acessar esta página.
        </p>
      </div>
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16">
        <p className="text-ink/70">Acesso restrito a administradores.</p>
      </div>
    );
  }

  const { data: pending } = await supabase
    .from("professionals")
    .select("*")
    .eq("verification_status", "pendente")
    .order("created_at", { ascending: true });

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="font-display text-3xl font-semibold text-ink">
        Verificação de profissionais
      </h1>
      <p className="mt-2 text-ink/70">
        {pending?.length ?? 0} cadastro(s) aguardando aprovação.
      </p>

      <div className="mt-8 space-y-4">
        {pending?.map((professional) => (
          <div
            key={professional.id}
            className="flex flex-col gap-4 rounded-md border border-brand-100 p-5 sm:flex-row sm:items-center"
          >
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-brand-50">
              {professional.cover_image_url && (
                <Image
                  src={professional.cover_image_url}
                  alt={professional.business_name}
                  fill
                  className="object-cover"
                />
              )}
            </div>

            <div className="flex-1">
              <p className="font-medium text-ink">{professional.business_name}</p>
              <p className="text-sm text-ink/60">
                {professional.city} — {professional.state}
              </p>
              {professional.bio && (
                <p className="mt-1 text-sm text-ink/70">{professional.bio}</p>
              )}
              <a
                href={`/profissional/${professional.slug}`}
                target="_blank"
                className="mt-1 inline-block text-xs text-brand-700 underline"
              >
                ver perfil
              </a>
            </div>

            <div className="flex shrink-0 gap-2">
              <form action={approveProfessional.bind(null, professional.id)}>
                <button
                  type="submit"
                  className="rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
                >
                  Aprovar
                </button>
              </form>
              <form action={rejectProfessional.bind(null, professional.id)}>
                <button
                  type="submit"
                  className="rounded-md border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Rejeitar
                </button>
              </form>
            </div>
          </div>
        ))}

        {pending?.length === 0 && (
          <p className="text-sm text-ink/60">Nenhum cadastro pendente no momento.</p>
        )}
      </div>
    </div>
  );
}
