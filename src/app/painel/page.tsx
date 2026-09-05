import { createClient } from "@/lib/supabase/server";
import { updateLeadStatus } from "./actions";

const STATUS_LABEL: Record<string, string> = {
  novo: "Novo",
  respondido: "Respondido",
  concluido: "Concluído",
};

export default async function PainelPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16">
        <p className="text-ink/70">
          Você precisa <a href="/login" className="text-brand-700 underline">entrar</a> para ver
          seus leads.
        </p>
      </div>
    );
  }

  const { data: professional } = await supabase
    .from("professionals")
    .select("id, business_name")
    .eq("profile_id", user.id)
    .single();

  if (!professional) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16">
        <p className="text-ink/70">
          Você ainda não tem um cadastro profissional.{" "}
          <a href="/cadastro-profissional" className="text-brand-700 underline">
            Cadastre seu negócio
          </a>
          .
        </p>
      </div>
    );
  }

  const { data: leads } = await supabase
    .from("contact_requests")
    .select("*")
    .eq("professional_id", professional.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="font-display text-3xl font-semibold text-ink">Meus leads</h1>
      <p className="mt-2 text-ink/70">
        Solicitações de contato recebidas em {professional.business_name}.
      </p>

      <div className="mt-8 space-y-4">
        {leads?.map((lead) => (
          <div key={lead.id} className="rounded-md border border-brand-100 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium text-ink">{lead.client_name}</p>
                <p className="text-sm text-ink/60">
                  {lead.client_phone}
                  {lead.client_email ? ` · ${lead.client_email}` : ""}
                </p>
                {lead.message && <p className="mt-2 text-sm text-ink/80">{lead.message}</p>}
                <p className="mt-2 text-xs text-ink/40">
                  {new Date(lead.created_at).toLocaleString("pt-BR")}
                </p>
              </div>

              <span className="shrink-0 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
                {STATUS_LABEL[lead.status] ?? lead.status}
              </span>
            </div>

            <div className="mt-3 flex gap-2">
              {lead.status !== "respondido" && (
                <form action={updateLeadStatus.bind(null, lead.id, "respondido")}>
                  <button
                    type="submit"
                    className="rounded-md border border-brand-200 px-3 py-1 text-xs font-medium text-brand-700 hover:bg-brand-50"
                  >
                    Marcar como respondido
                  </button>
                </form>
              )}
              {lead.status !== "concluido" && (
                <form action={updateLeadStatus.bind(null, lead.id, "concluido")}>
                  <button
                    type="submit"
                    className="rounded-md border border-brand-200 px-3 py-1 text-xs font-medium text-brand-700 hover:bg-brand-50"
                  >
                    Marcar como concluído
                  </button>
                </form>
              )}
            </div>
          </div>
        ))}

        {leads?.length === 0 && (
          <p className="text-sm text-ink/60">Nenhum lead recebido ainda.</p>
        )}
      </div>
    </div>
  );
}
