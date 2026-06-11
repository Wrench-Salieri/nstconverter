import * as XLSX from "xlsx";
import { normalizeLocation } from "../utils/locations.js";
import { normalizeBrands } from "../utils/brands.js";

export async function convertCyclades(files) {
  const file = files[0];

  const data = await file.arrayBuffer();

  const workbook = XLSX.read(data, {
    type: "array",
  });

  const worksheet = workbook.Sheets[workbook.SheetNames[0]];

  const rows = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    raw: false,
    defval: "",
  });

  const outputRows = [];

  //Headers
  outputRows.push([
    "Αριθμός Κράτησης",
    "Ημερομηνία δρομολογίου",
    "Ώρα έναρξης δρομολογίου",
    "Όνομα Κράτησης",
    "Pickup",
    "Dropoff",
    "Περιγραφή Δρομολογίου",
    "Ενήλικες",
    "Παιδιά",
    "Βρέφη",
    "Κατηγορία",
    "Τύπος",
    "Είδος",
    "Brand",
    "Disposal time",
    "Πτήση / Πλοίο",
    "Ώρα άφιξης / αναχώρησης",
    "Σχόλια για το γραφείο κίνησης",
    "Εσωτερικά Σχόλια",
    "Πελάτης",
  ]);

  rows.slice(1).forEach((row) => {
    const arrivalDeparture = row[2]
    const code = arrivalDeparture ? row[0] : `${row[0]}-1`;
    const [month, day, year] = row[3].split("/");
    const date = `${day}/${month}/${year}`; 
    const start_time = row[4];
    const name = row[1];
    const pickup = normalizeLocation(row[22]);
    const dropoff = normalizeLocation(row[23]);
    const hotel = row[14];
    const adults = row[10];
    const children = row[11];
    const infants = row[12];
    const flight = row[5];
    const flight_time = row[7];
    const phone = row[15];
    const type = row[18];

    const route = (() => {
      if (pickup === "Airport" || pickup === "Port") return `${pickup}-${hotel}`;
      if (dropoff === "Airport" || dropoff === "Port") return `${hotel}-${dropoff}`;
      return "";
    })();

    const routeType = (() => {
      if (arrivalDeparture === "ARRIVAL") return `Arrival Transfer`;
      return `Departure Transfer`;
    })();

    const transferType = (() => {
      if (type === "SS" || type === "ES") return `Shared`;
      return `Private`;
    })();

    const brand = type && type.toString().includes("ES")
      ? "Express-Love Holidays"
      : normalizeBrands(row[16]);

    outputRows.push([
      code,
      date,
      start_time,
      name,
      pickup,
      dropoff,
      route,
      adults,
      children,
      infants,
      "Transfer",
      routeType,
      transferType,
      brand,
      "",
      flight,
      flight_time,
      phone,
      type,
      "The Cyclades Collection"
    ]);
  });

  const newWorkbook = XLSX.utils.book_new();

  const newSheet = XLSX.utils.aoa_to_sheet(outputRows);

  XLSX.utils.book_append_sheet(
    newWorkbook,
    newSheet,
    "Converted"
  );

  XLSX.writeFile(
    newWorkbook,
    `${file.name.replace(/\.[^.]+$/, "")}_converted.xlsx`
  );
}
