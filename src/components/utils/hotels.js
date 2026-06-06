export const HOTEL_MAP = {
  "Hillside Elegance": "Oia",
  "Kamari Blue Boutique Hotel": "Kamari",
  "Belvedere Suites": "Firostefani",
  "bus station Fira": "Fira",
  "Callia Retreat Suites - Adults Only": "Fira",
  "Akrotiri Castle View": "Akrotiri",
  "Akrotiri Hidden Gem": "Akrotiri",
  "Avant Garde Firostefani": "Firostefani",
  "Avant Garde": "Akrotiri",
  "Santo Wines": "Pyrgos",
  "Andronikos Santorini Hotel": "Imerovigli",
  "Olympic Villas": "Oia",
};

export function normalizeHotel(value) {
  if (!value) return "";
  const name = value.split(",")[0].trim();
  
  if (HOTEL_MAP[name] !== undefined) return HOTEL_MAP[name];

  // fallback: try location normalization on the full address
  console.warn("Unknown hotel, add to HOTEL_MAP:", name);
  return name;
}