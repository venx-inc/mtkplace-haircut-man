"use client";

import Link from "next/link";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Ícones do pacote leaflet quebram sob bundlers (o caminho relativo às
// imagens não sobrevive ao build) — carregando de um CDN em vez de importar
// os assets locais evita o problema por completo.
const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export type MapProfessional = {
  id: string;
  slug: string;
  business_name: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
};

const BRAZIL_CENTER: [number, number] = [-14.235, -51.9253];

export default function ProfessionalsMapInner({
  professionals,
}: {
  professionals: MapProfessional[];
}) {
  const center: [number, number] =
    professionals.length > 0
      ? [professionals[0].latitude, professionals[0].longitude]
      : BRAZIL_CENTER;

  return (
    <MapContainer
      center={center}
      zoom={professionals.length > 0 ? 11 : 4}
      scrollWheelZoom={false}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {professionals.map((professional) => (
        <Marker
          key={professional.id}
          position={[professional.latitude, professional.longitude]}
          icon={markerIcon}
        >
          <Popup>
            <Link href={`/profissional/${professional.slug}`} className="font-medium text-brand-700">
              {professional.business_name}
            </Link>
            <p className="text-xs text-ink/60">
              {professional.city} — {professional.state}
            </p>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
