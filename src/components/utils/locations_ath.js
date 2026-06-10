export const LOCATION_MAP_ATH = {
  "RAFINA": "Rafina port",
  "RAFINA PORT": "Rafina port",
  "PORT OF PIRAEUS ATHENS": "Port of Piraeus",
  "ATHENS INTERNATIONAL AIRPORT": "Athens Airport",
  "MARATHONAS": "Marathonas",
  "GLYFADA": "Glyfada",
};

export function normalizeLocation(value) {
  if (!value) return "";

  const text = value.toString().toUpperCase();

  for (const [key, normalized] of Object.entries(LOCATION_MAP_ATH)) {
    if (text.includes(key)) {
      return normalized;
    }
  }

  return value;
}