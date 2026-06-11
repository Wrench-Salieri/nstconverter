import Papa from "papaparse";
import * as XLSX from "xlsx";
import { normalizeLocation } from "../utils/locations_ath.js";
import { normalizeHotel } from "../utils/hotels_ath.js";

export async function convertZenix(files) {
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
    const date_Arr = row[13];  
    const start_time_Arr = row[14];
    const flight_Arr = row[12];
    const flight_time_Arr = start_time_Arr;
    const date_Dep = row[16];  
    const flight_Dep = row[15];
    const flight_time_Dep = row[17];

    const [hours, minutes] = flight_time_Dep.split(":").map(Number);
    const depDate = new Date();
    depDate.setHours(hours, minutes, 0, 0);
    depDate.setHours(depDate.getHours() - 3);
    const start_time_Dep = depDate.toTimeString().slice(0, 5);

    const name = `${row[4]} ${row[5]}`;
    const adults = row[6];
    const children = row[7];
    const infants = row[8];
    const hotel = row[9];
    const dropoff_Arr = normalizeHotel(hotel);
    const pickup_Dep = normalizeHotel(hotel);
    
    // Arrivals
    outputRows.push([
      code,
      date_Arr,
      start_time_Arr,
      name,
      "Athens airport",
      dropoff_Arr,
      `Athens airport-${hotel}`,
      adults,
      children,
      infants,
      "Transfer",
      "Arrival Transfer",
      "Private",
      "No Brand",
      "",
      flight_Arr,
      flight_time_Arr,
      "",
      "",
      "Easy Jet"
    ]);

    // Departures
    outputRows.push([
      `${code}-1`,
      date_Dep,
      start_time_Dep,
      name,
      pickup_Dep,
      "Athens airport",
      `${hotel}-Athens airport`,
      adults,
      children,
      infants,
      "Transfer",
      "Departure Transfer",
      "Private",
      "No Brand",
      "",
      flight_Dep,
      flight_time_Dep,
      "",
      "",
      "Easy Jet"
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
