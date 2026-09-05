import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ProfessionalCard } from "@/components/ProfessionalCard";

export default async function HomePage() {
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order");

  const { data: professionals } = await supabase
    .from("professionals")
    .select("*")
    .eq("verification_status", "verificado")
    .order("avg_rating", { ascending: false })
    .limit(6);

  return (
    <div>
      <section className="mx-auto max-w-6xl px-6 py-20 text-center">
        <h1 className="mx-auto max-w-2xl text-balance font-display text-4xl font-semibold text-ink sm:text-5xl">
          Estética masculina, com quem tem credencial pra isso.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-ink/70">
          Barbeiros, esteticistas e clínicas verificados — com portfólio real e
          avaliação de quem já passou pela cadeira.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/diretorio"
            className="rounded-md bg-brand-500 px-6 py-3 font-medium text-white hover:bg-brand-600"
          >
            Encontrar um profissional
          </Link>
          <Link
            href="/cadastro-profissional"
            className="rounded-md border border-brand-300 px-6 py-3 font-medium text-brand-700 hover:bg-brand-50"
          >
            Quero ser parceiro
          </Link>
        </div>
      </section>

      {categories && categories.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 pb-16">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/diretorio?categoria=${category.slug}`}
                className="rounded-full border border-brand-100 bg-white px-4 py-2 text-sm font-medium text-ink/80 hover:border-brand-300 hover:text-brand-700"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <h2 className="mb-6 font-display text-2xl font-semibold text-ink">
          Profissionais em destaque
        </h2>
        {professionals && professionals.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {professionals.map((professional) => (
              <ProfessionalCard key={professional.id} professional={professional} />
            ))}
          </div>
        ) : (
          <p className="rounded-md border border-dashed border-brand-200 p-8 text-center text-ink/60">
            Nenhum profissional verificado ainda — assim que o banco (Supabase)
            estiver conectado e o primeiro cadastro for aprovado, ele aparece aqui.
          </p>
        )}
      </section>
    </div>
  );
}
