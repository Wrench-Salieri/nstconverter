import Papa from "papaparse";
import * as XLSX from "xlsx";
import { normalizeLocation } from "../utils/locations.js";

export async function convertHoliday(files) {
  const file = files[0];

  const text = await file.text();

  const { data } = Papa.parse(text, {
    header: false,
    skipEmptyLines: true,
    quoteChar: '"',
    delimiter: ",",
  });

  const rows = data;

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
    const arrivalDeparture = row[17];
    const isArrival = arrivalDeparture.includes("outbound");
    const code = row[9];
    const date = isArrival ? row[10] : row[21];
    const start_time = isArrival ? row[11] : row[22];
    const name = row[2];
    const pickup = isArrival ? normalizeLocation(row[19]) : normalizeLocation(row[20]);
    const dropoff = isArrival ? normalizeLocation(row[20]) : normalizeLocation(row[19]);
    const hotel = isArrival ? row[13] : row[26];
    const adults = row[4];
    const children = row[5];
    const infants = row[6];
    const routeType = isArrival ? `Arrival Transfer` : `Departure Transfer`;
    const type = row[18];
    const transferType = type.toLowerCase().includes("shared") ? "Shared" : "Private";
    const flight = isArrival ? row[12] : row[25];
    const flight_time = isArrival ? row[11] : row[24];
    const phone = row[3];

    const route = isArrival ? `Airport-${hotel}` : `${hotel}-Airport`;
    
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
      "No Brand",
      "",
      flight,
      flight_time,
      phone,
      type,
      "Holiday Taxis"
    ]);
  });

  const newWorkbook = XLSX.utils.book_new();

  const newSheet = XLSX.utils.aoa_to_sheet(outputRows);
  XLSX.utils.book_append_sheet(newWorkbook, newSheet, "Converted");
  XLSX.writeFile(
    newWorkbook,
    `${file.name.replace(/\.[^.]+$/, "")}_converted.xlsx`
  );

}
