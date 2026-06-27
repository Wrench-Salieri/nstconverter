export const CLIENT_MAP = {
  "TUI": "TUI",
};

export function normalizeClient(value) {
  if (!value) return "";
  const text = value.toString().toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  for (const [key, normalized] of Object.entries(CLIENT_MAP)) {
    if (text.includes(key)) {
      return normalized;
    }
  }
  return "Hellenic Zeus";
}
