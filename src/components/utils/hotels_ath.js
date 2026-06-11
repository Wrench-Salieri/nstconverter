import { normalizeLocation } from "./locations_ath.js";

export const HOTEL_MAP = {
  "Golden Coast": "Marathonas",
  "The Port Square Hotel": "Piraeus",
  "Vincci EverEden": "Anavyssos",
};

export function normalizeHotel(value, reference) {
  if (!value) return "";
  const name = value.split(",")[0].trim();
  
  if (HOTEL_MAP[name] !== undefined) return HOTEL_MAP[name];
  
  const afterFirstComma = value.split(",").slice(1).join(",").trim();
  const locationGuess = normalizeLocation(afterFirstComma);
  if (locationGuess !== afterFirstComma) return locationGuess;

  return `Athens city centre`;
}