import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ContactForm } from "./ContactForm";
import { ReviewForm } from "./ReviewForm";

export default async function ProfessionalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: professional } = await supabase
    .from("professionals")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!professional) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: services }, { data: cases }, { data: reviews }, { data: myReview }] = await Promise.all([
    supabase
      .from("services")
      .select("*, categories(name)")
      .eq("professional_id", professional.id),
    supabase
      .from("portfolio_cases")
      .select("*")
      .eq("professional_id", professional.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("reviews")
      .select("*, profiles(full_name)")
      .eq("professional_id", professional.id)
      .order("created_at", { ascending: false })
      .limit(10),
    user
      ? supabase
          .from("reviews")
          .select("id")
          .eq("professional_id", professional.id)
          .eq("client_profile_id", user.id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex flex-col gap-8 sm:flex-row">
        <div className="relative aspect-square w-full max-w-xs shrink-0 overflow-hidden rounded-lg bg-brand-50">
          {professional.cover_image_url ? (
            <Image
              src={professional.cover_image_url}
              alt={professional.business_name}
              fill
              className="object-cover"
            />
          ) : null}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="font-display text-3xl font-semibold text-ink">
              {professional.business_name}
            </h1>
            {professional.verification_status === "verificado" && (
              <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
                ✓ verificado
              </span>
            )}
          </div>
          <p className="mt-1 text-ink/60">
            {professional.city} — {professional.state}
          </p>
          <div className="mt-2 flex items-center gap-1 text-sm">
            <span aria-hidden>★</span>
            <span>{professional.avg_rating.toFixed(1)}</span>
            <span className="text-ink/50">({professional.review_count} avaliações)</span>
          </div>
          {professional.bio && <p className="mt-4 text-ink/80">{professional.bio}</p>}
        </div>
      </div>

      {services && services.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 font-display text-xl font-semibold">Serviços</h2>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {services.map((service) => (
              <li
                key={service.id}
                className="rounded-md border border-brand-100 p-4"
              >
                <p className="font-medium">{service.name}</p>
                {service.description && (
                  <p className="text-sm text-ink/60">{service.description}</p>
                )}
                {service.price_from != null && (
                  <p className="mt-1 text-sm text-brand-700">
                    a partir de R$ {service.price_from.toFixed(2)}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {cases && cases.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 font-display text-xl font-semibold">Antes e depois</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {cases.map((item) => (
              <div key={item.id} className="rounded-md border border-brand-100 p-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative aspect-square overflow-hidden rounded">
                    <Image src={item.before_image_url} alt="Antes" fill className="object-cover" />
                  </div>
                  <div className="relative aspect-square overflow-hidden rounded">
                    <Image src={item.after_image_url} alt="Depois" fill className="object-cover" />
                  </div>
                </div>
                <p className="mt-2 text-sm font-medium">{item.title}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mt-12 grid grid-cols-1 gap-10 sm:grid-cols-2">
        <div>
          <h2 className="mb-4 font-display text-xl font-semibold">Avaliações</h2>
          {reviews && reviews.length > 0 ? (
            <ul className="space-y-4">
              {reviews.map((review) => (
                <li key={review.id} className="rounded-md border border-brand-100 p-4">
                  <div className="flex items-center gap-2 text-sm">
                    <span aria-hidden>★</span>
                    <span>{review.rating}</span>
                  </div>
                  {review.comment && <p className="mt-1 text-sm text-ink/80">{review.comment}</p>}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink/60">Ainda sem avaliações.</p>
          )}

          <div className="mt-6">
            {myReview ? (
              <p className="text-sm text-ink/60">Você já avaliou este profissional.</p>
            ) : user ? (
              <ReviewForm professionalId={professional.id} slug={slug} />
            ) : (
              <p className="text-sm text-ink/60">
                <a href="/login" className="text-brand-700 underline">Faça login</a> para avaliar
                este profissional.
              </p>
            )}
          </div>
        </div>

        <div>
          <h2 className="mb-4 font-display text-xl font-semibold">Falar com o profissional</h2>
          <ContactForm professionalId={professional.id} />
        </div>
      </section>
    </div>
  );
}
