import Link from "next/link";

export function Header() {
  return (
    <header className="border-b border-brand-100 bg-paper">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-display text-xl font-semibold text-brand-700">
          Barba&Cia
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium text-ink/80">
          <Link href="/diretorio" className="hover:text-brand-600">
            Encontrar profissional
          </Link>
          <Link href="/cadastro-profissional" className="hover:text-brand-600">
            Sou profissional
          </Link>
          <Link
            href="/login"
            className="rounded-md bg-brand-500 px-4 py-2 text-white hover:bg-brand-600"
          >
            Entrar
          </Link>
        </nav>
      </div>
    </header>
  );
}
