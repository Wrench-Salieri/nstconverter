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
    const pickupRaw = row[8];
    const dropoffRaw = row[10];
    const pickupUp = pickupRaw.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const dropoffUp = dropoffRaw.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const pickupHotelName = pickupRaw.split(",")[0].trim();
    const dropoffHotelName = dropoffRaw.split(",")[0].trim();
    
    let pickup, dropoff, routeType, route;

    if (pickupUp.includes("AIRPORT") || pickupUp.includes("PORT")) {
      const pickupLabel = pickupUp.includes("AIRPORT") ? "Airport" : "Port";
      const dropoffArea = normalizeHotel(dropoffRaw, row[0]);
      pickup = pickupLabel;
      dropoff = dropoffArea;
      routeType = "Arrival Transfer";
      route = `${pickupLabel}-${dropoffHotelName}`;
    } else if (dropoffUp.includes("AIRPORT") || dropoffUp.includes("PORT")) {
      const dropoffLabel = dropoffUp.includes("AIRPORT") ? "Airport" : "Port";
      const pickupArea = normalizeHotel(pickupRaw, row[0]);
      pickup = pickupArea;
      dropoff = dropoffLabel;
      routeType = "Departure Transfer";
      route = `${pickupHotelName}-${dropoffLabel}`;
    } else {
      pickup = normalizeHotel(pickupRaw, row[0]);
      dropoff = normalizeHotel(dropoffRaw, row[0]);
      routeType = "In-Between Transfer";
      route = `${pickupHotelName}-${dropoffHotelName}`;
    }

    const pax = row[6];
    const children = row[5];
    const infants = row[6];
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
