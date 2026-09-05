import { createClient } from "@/lib/supabase/server";
import { CadastroForm } from "./CadastroForm";

export default async function CadastroProfissionalPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="mx-auto max-w-xl px-6 py-16">
      <h1 className="font-display text-3xl font-semibold text-ink">
        Cadastre seu negócio
      </h1>
      <p className="mt-2 text-ink/70">
        Seu perfil entra em análise de verificação antes de aparecer publicamente
        no diretório — assim mantemos a confiança da plataforma.
      </p>

      {user ? (
        <div className="mt-8">
          <CadastroForm />
        </div>
      ) : (
        <p className="mt-8 rounded-md border border-dashed border-brand-200 p-6 text-ink/70">
          Você precisa <a href="/login" className="text-brand-700 underline">entrar ou criar uma conta</a> como
          profissional antes de cadastrar seu negócio.
        </p>
      )}
    </div>
  );
}
