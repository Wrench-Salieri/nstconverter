export const BUSSTOP_MAP = {
  "AIRPORT": "6",
  "AKROTIRI": "5",
  "AGIA PARASKEVI": "29",
  "AGIOS GEORGIOS": "33",
  "AMMOUDI": "5",
  "EMPORIO": "9",
  "EXO GONIA": "12",
  "EXO KATIKIES": "14",
  "EXOMITIS": "33",
  "FIRA": "14",
  "FIROSTEFANI": "15",
  "FOINIKIA": "16",
  "IMEROVIGLI": "22",
  "KAMARI": "23",
  "KARTERADOS": "24",
  "MEGALOCHORI": "27",
  "MESSARIA": "28",
  "MONOLITHOS": "29",
  "OIA": "30",
  "PERISSA": "32",
  "PERIVOLOS": "33",
  "PORI": "34",
  "PORT": "35",
  "PYRGOS": "36",
  "VLYCHADA": "38",
};

export function normalizeBusStop(value) {
  if (!value) return "";
  const text = value.toString().toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  for (const [key, normalized] of Object.entries(BUSSTOP_MAP)) {
    if (text.includes(key)) {
      return normalized;
    }
  }
  return value;
}