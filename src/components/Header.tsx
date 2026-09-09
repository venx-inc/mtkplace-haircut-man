import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/login/actions";

export async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const profile = user
    ? (
        await supabase.from("profiles").select("role").eq("id", user.id).single()
      ).data
    : null;

  return (
    <header className="border-b border-brand-100 bg-paper">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="font-display text-xl font-semibold text-brand-700">
          Barba&Cia
        </Link>
        <nav className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-medium text-ink/80 sm:gap-x-6">
          <Link href="/diretorio" className="hover:text-brand-600">
            Encontrar profissional
          </Link>

          {profile?.role === "admin" && (
            <Link href="/admin" className="hover:text-brand-600">
              Admin
            </Link>
          )}

          {profile?.role === "profissional" && (
            <Link href="/painel" className="hover:text-brand-600">
              Meus leads
            </Link>
          )}

          {!user && (
            <Link href="/cadastro-profissional" className="hover:text-brand-600">
              Sou profissional
            </Link>
          )}

          {user ? (
            <form action={signOut}>
              <button
                type="submit"
                className="rounded-md bg-brand-500 px-4 py-2 text-white hover:bg-brand-600"
              >
                Sair
              </button>
            </form>
          ) : (
            <Link
              href="/login"
              className="rounded-md bg-brand-500 px-4 py-2 text-white hover:bg-brand-600"
            >
              Entrar
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
