import Image from "next/image";
import Link from "next/link";
import type { Professional } from "@/types/database.types";

export function ProfessionalCard({ professional }: { professional: Professional }) {
  return (
    <Link
      href={`/profissional/${professional.slug}`}
      className="group block overflow-hidden rounded-lg border border-brand-100 bg-white transition hover:shadow-md"
    >
      <div className="relative aspect-[4/3] w-full bg-brand-50">
        {professional.cover_image_url ? (
          <Image
            src={professional.cover_image_url}
            alt={professional.business_name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-brand-300">
            Sem foto
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-display text-lg font-semibold text-ink group-hover:text-brand-600">
          {professional.business_name}
        </h3>
        <p className="text-sm text-ink/60">
          {professional.city} — {professional.state}
        </p>
        <div className="mt-2 flex items-center gap-1 text-sm text-ink/80">
          <span aria-hidden>★</span>
          <span>{professional.avg_rating.toFixed(1)}</span>
          <span className="text-ink/50">({professional.review_count} avaliações)</span>
        </div>
      </div>
    </Link>
  );
}
