export const LOCATION_MAP = {
  "AIRPORT": "Airport",
  "AKROTIRI": "Akrotiri",
  "AGIA PARASKEVI": "Monolithos",
  "AGIOS GEORGIOS": "Perivolos",
  "AMMOUDI": "Ammoudi",
  "BAXEDES": "Baxedes",
  "EMPORIO": "Emporio",
  "EXO GONIA": "Exo Gonia",
  "EXOMITIS": "Perivolos",
  "FIRA": "Fira",
  "FIROSTEFANI": "Firostefani",
  "FOINIKIA": "Foinikia",
  "FINIKIA": "Foinikia",
  "IMEROVIGLI": "Imerovigli",
  "KAMARI": "Kamari",
  "KARTERADOS": "Karterados",
  "KOLOUMBO": "Koloumbo",
  "MEGALOCHORI": "Megalochori",
  "MESSARIA": "Messaria",
  "MONOLITHOS": "Monolithos",
  "OIA": "Oia",
  "PERISSA": "Perissa",
  "PERIVOLOS": "Perivolos",
  "PORI": "Pori",
  "PORT": "Port",
  "PYRGOS": "Pyrgos",
  "THIRA": "Fira",
  "VLYCHADA": "Vlychada",
  "VOURVOULOS": "Vourvoulos",
  "VOTHONAS": "Messaria",
};

export function normalizeLocation(value) {
  if (!value) return "";
  const text = value.toString().toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  for (const [key, normalized] of Object.entries(LOCATION_MAP)) {
    if (text.includes(key)) {
      return normalized;
    }
  }
  return value;
}