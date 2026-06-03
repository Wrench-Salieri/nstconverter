export const BRAND_MAP = {
  "SUNTRANSFERS": "Suntransfers",
  "Love Holidays": "Love Holidays",
  "PLENUSTOUR JAPAN": "PLENUSTOUR",
  "transferz.com": "transferz.com",
  "SHUTTLE DIRECT": "SHUTTLE DIRECT",
  "Le Grand": "Le Grand",
};

export function normalizeBrands(value) {
  if (!value) return "No Brand";

  const trimmed = value.toString().trim();

  if (BRAND_MAP[trimmed] !== undefined) return BRAND_MAP[trimmed];

  return "No Brand";
}