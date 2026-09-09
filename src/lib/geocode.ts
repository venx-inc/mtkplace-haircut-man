type GeocodeResult = { latitude: number; longitude: number };

/**
 * Geocoding gratuito via Nominatim (OpenStreetMap). Sem chave de API, mas com
 * política de uso que exige um User-Agent identificando a aplicação e limite
 * de ~1 requisição/segundo — ok pro nosso caso (uma chamada por cadastro).
 * Retorna coordenadas em nível de cidade, não endereço exato.
 */
export async function geocodeCity(city: string, state: string): Promise<GeocodeResult | null> {
  const query = `${city}, ${state}, Brasil`;
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;

  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "barba-e-cia-marketplace/1.0 (cadastro de profissional)" },
    });

    if (!response.ok) return null;

    const results = (await response.json()) as Array<{ lat: string; lon: string }>;
    const first = results[0];
    if (!first) return null;

    return { latitude: Number(first.lat), longitude: Number(first.lon) };
  } catch (err) {
    console.error("[geocode] falha ao geocodificar", err);
    return null;
  }
}
