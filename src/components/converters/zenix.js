import Papa from "papaparse";
import * as XLSX from "xlsx";
import { normalizeLocation } from "../utils/locations_ath.js";

export async function convertRideways(files) {
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

    const code = row[0];
    //isArrival = ;
    const dateTime = row[1].split("T");
    const date = dateTime[0].split("-").reverse().join("/");       
    const start_time = dateTime[1].substring(0, 5);
    const name = `${row[4]} ${row[5]}`;
    const adults = row[6];
    const children = row[7];
    const infants = row[8];
    const flight = row[15];
    const flight_time = row[16] ? row[16].split("T")[1]?.substring(0, 5) : "";
    const comment = VEHICLE_MAP[row[7]] || row[7];
    const insPrice = row[2];
    
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
      "Private",
      "No Brand",
      "",
      flight,
      flight_time,
      comment,
      insPrice,
      "EasyJet"
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
