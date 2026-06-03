export const LOCATION_MAP_ATH = {
  "AIRPORT": "Athens Airport",
  "ATHENS CENTER": "Athens Center",
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