export const LOCATION_MAP_ATH = {
  "ATHENS AIRPORT": "Athens airport",
  "RAFINA": "Rafina port",
  "RAFINA PORT": "Rafina port",
  "PORT OF PIRAEUS ATHENS": "Port of Piraeus",
  "ATHENS INTERNATIONAL AIRPORT": "Athens Airport",
  "MARATHONAS": "Marathonas",
  "GLYFADA": "Glyfada",
  "PIRAEUS CRUISE PORT (G)": "Port of Piraeus",
  "PIRAUS": "Piraeus",
  "ATHENS": "Athens city centre",
  "KANTIA": "Nafplio",
  "ATHINA": "Athens city centre",
  "PIREAS": "Piraeus",
};

export function normalizeLocationAth(value) {
  if (!value) return "";

  const text = value.toString().toUpperCase();

  for (const [key, normalized] of Object.entries(LOCATION_MAP_ATH)) {
    if (text.includes(key)) {
      return normalized;
    }
  }

  return "Athens city centre";
}