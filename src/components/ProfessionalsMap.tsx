"use client";

import dynamic from "next/dynamic";
import type { MapProfessional } from "./ProfessionalsMapInner";

// Leaflet acessa `window`/`document` na hora de montar — precisa ficar fora
// do SSR, e next/dynamic com ssr:false só é permitido dentro de um Client
// Component (por isso esse wrapper existe separado da implementação real).
const MapInner = dynamic(() => import("./ProfessionalsMapInner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center text-sm text-ink/50">
      Carregando mapa…
    </div>
  ),
});

export function ProfessionalsMap({ professionals }: { professionals: MapProfessional[] }) {
  return <MapInner professionals={professionals} />;
}
