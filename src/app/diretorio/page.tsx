import { createClient } from "@/lib/supabase/server";
import { ProfessionalCard } from "@/components/ProfessionalCard";
import { ProfessionalsMap } from "@/components/ProfessionalsMap";

type SearchParams = { categoria?: string; cidade?: string };

export default async function DiretorioPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { categoria, cidade } = await searchParams;
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order");

  let query = supabase
    .from("professionals")
    .select("*")
    .eq("verification_status", "verificado")
    .order("avg_rating", { ascending: false });

  if (cidade) {
    query = query.ilike("city", `%${cidade}%`);
  }

  // filtro por categoria exige um join com services; feito à parte para manter
  // a query principal simples nesta fase de fundação.
  let professionalIdsForCategory: string[] | null = null;
  if (categoria) {
    const { data: matchingServices } = await supabase
      .from("services")
      .select("professional_id, categories!inner(slug)")
      .eq("categories.slug", categoria);
    professionalIdsForCategory = [
      ...new Set((matchingServices ?? []).map((s) => s.professional_id)),
    ];
    query = query.in("id", professionalIdsForCategory);
  }

  const { data: professionals } = await query;

  const professionalsWithLocation = (professionals ?? []).filter(
    (p): p is typeof p & { latitude: number; longitude: number } =>
      p.latitude != null && p.longitude != null
  );

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="font-display text-3xl font-semibold text-ink">
        Encontre um profissional
      </h1>
      <p className="mt-2 text-ink/70">
        {professionals?.length ?? 0} profissional(is) verificado(s) encontrado(s).
      </p>

      <form className="mt-6 flex flex-wrap gap-3" action="/diretorio">
        <input
          type="text"
          name="cidade"
          defaultValue={cidade}
          placeholder="Cidade (ex: Uberlândia)"
          className="rounded-md border border-brand-200 px-4 py-2 text-sm"
        />
        <select
          name="categoria"
          defaultValue={categoria ?? ""}
          className="rounded-md border border-brand-200 px-4 py-2 text-sm"
        >
          <option value="">Todas as categorias</option>
          {categories?.map((category) => (
            <option key={category.id} value={category.slug}>
              {category.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-md bg-brand-500 px-5 py-2 text-sm font-medium text-white hover:bg-brand-600"
        >
          Buscar
        </button>
      </form>

      {professionalsWithLocation.length > 0 && (
        <div className="mt-8 h-[420px] w-full overflow-hidden rounded-lg border border-brand-100">
          <ProfessionalsMap professionals={professionalsWithLocation} />
        </div>
      )}

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {professionals?.map((professional) => (
          <ProfessionalCard key={professional.id} professional={professional} />
        ))}
      </div>

      {professionals?.length === 0 && (
        <p className="mt-10 rounded-md border border-dashed border-brand-200 p-8 text-center text-ink/60">
          Nenhum resultado para esse filtro. Tente limpar a busca.
        </p>
      )}
    </div>
  );
}
