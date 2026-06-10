import Papa from "papaparse";
import * as XLSX from "xlsx";
import { normalizeLocation } from "../utils/locations.js";
import { normalizeHotel } from "../utils/hotels.js";

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

  const VEHICLE_MAP = {
    "STANDARD": "Standard",
    "PEOPLE_CARRIER": "People Carrier",
    "LARGE_PEOPLE_CARRIER": "Large People Carrier",
    "MINIVAN": "Minivan",
    "EXECUTIVE": "Executive",
    "EXECUTIVE_PEOPLE_CARRIER": "Executive People Carrier",
    "EXECUTIVE_LARGE_PEOPLE_CARRIER": "Executive Large People Carrier",
    "EXECUTIVE_MINIVAN": "Executive Minivan",
  };

  rows.slice(1).forEach((row) => {

    const code = row[0];
    const dateTime = row[1].split("T");
    const date = dateTime[0].split("-").reverse().join("/");       
    const start_time = dateTime[1].substring(0, 5);
    const name = `${row[4]} ${row[5]}`;
    const isArrival = row[8].toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes("AIRPORT");
    const hotelArea = normalizeHotel(isArrival ? row[10] : row[8], row[0]);
    const pickup = isArrival ? "Airport" : hotelArea;
    const dropoff = isArrival ? hotelArea : "Airport";
    const hotel = (isArrival ? row[10] : row[8]).split(",")[0].trim();
    const pax = row[6];
    const children = row[5];
    const infants = row[6];
    const routeType = isArrival ? `Arrival Transfer` : `Departure Transfer`;
    const flight = row[15];
    const flight_time = row[16] ? row[16].split("T")[1]?.substring(0, 5) : "";
    const comment = VEHICLE_MAP[row[7]] || row[7];
    const insPrice = row[2];

    const route = isArrival ? `Airport-${hotel}` : `${hotel}-Airport`;
    
    outputRows.push([
      code,
      date,
      start_time,
      name,
      pickup,
      dropoff,
      route,
      pax,
      "",
      "",
      "Transfer",
      routeType,
      "Private",
      "No Brand",
      "",
      flight,
      flight_time,
      comment,
      insPrice,
      "Rideways"
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
