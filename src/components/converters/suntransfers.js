import Papa from "papaparse";
import * as XLSX from "xlsx";
import { normalizeLocation } from "../utils/locations.js";
import { normalizeLocationAth } from "../utils/locations_ath.js";

export async function convertSuntransfers(files) {
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
  const headers = [
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
  ];

  const santoriniRows = [headers];
  const athensRows = [headers];
  
  rows.slice(1).forEach((row) => {

    const locationText = [row[20], row[21], row[22], row[23], row[24]]
      .join(" ")
      .toUpperCase();

    const isAthens = locationText.includes("ATHENS") || locationText.includes("ATHEN");
    const isSantorini = locationText.includes("SANTORINI") || locationText.includes("THIRA");
    
    const transferLeg = row[2];
    let isArrival;
    if (transferLeg === "Airport") {
      isArrival = true;
    } else {
      isArrival = false;
    }
    const date = row[3];
    const start_time = row[4];
    const name = `${row[7]} ${row[8]}`;
    let pickup, dropoff, customer;
    if (isAthens) {
      pickup = normalizeLocationAth(row[20]);
      dropoff = normalizeLocationAth(row[23]);
      customer = "Suntransfers";
    } else if (isSantorini) {
      pickup = normalizeLocation(row[20]);
      dropoff = normalizeLocation(row[23]);
      customer = "SUNTRANSFERS";
    }
    const code = isArrival ? row[0] : `${row[0]}-1`;
    const hotel = isArrival ? row[24] : row[21];
    const route = isArrival ? `${pickup}-${hotel}` : `${hotel}-${dropoff}`;
    const adults = row[13];
    const children = row[14];
    const infants = row[15];
    const routeType = isArrival ? `Arrival Transfer` : `Departure Transfer`;
    const type = row[11];
    const flight = row[19];
    const flight_time = row[6];
    const comment = row[9];

    const transferType = (() => {
      if (type === "sh") return `Shared`;
      return `Private`;
    })();

    const outputRow = [
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
      comment,
      "",
      customer,
    ];

    if (isSantorini) {
      santoriniRows.push(outputRow);
    } else if (isAthens) {
      athensRows.push(outputRow);
    }
  });

  const writeFile = (outputRows, suffix) => {
    if (outputRows.length <= 1) return; // skip if only headers
    const newWorkbook = XLSX.utils.book_new();
    const newSheet = XLSX.utils.aoa_to_sheet(outputRows);
    XLSX.utils.book_append_sheet(newWorkbook, newSheet, "Converted");
    XLSX.writeFile(newWorkbook, `${file.name.replace(/\.[^.]+$/, "")}_${suffix}_converted.xlsx`);
  };

  writeFile(santoriniRows, `${file.name.replace(/\.[^.]+$/, "")}_Santorini_converted.xlsx`);
  writeFile(athensRows, `${file.name.replace(/\.[^.]+$/, "")}_Athens_converted.xlsx`);
}
