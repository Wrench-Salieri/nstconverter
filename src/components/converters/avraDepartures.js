import * as XLSX from "xlsx";
import { normalizeLocation } from "../utils/locations.js";

export async function convertAvraDepartures(files) {
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

  const groups = new Map();
  
    rows.slice(1).forEach((row) => {
      const type = row[10];
      if (!type) return;
      const busKey = type.trim();
      const key = busKey.toLowerCase().includes("prv")
        ? `${busKey}_${row[1]}`
        : busKey;

      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key).push(row);
    });
    
    groups.forEach((groupRows, key) => {
      const first = groupRows[0];
      const isPrivate = key.toLowerCase().includes("prv");
      const date = first[9];
      const start_time = first[11];
      const dropoff = "Airport";
      const hotel = first[5];
      const adults = parseInt(first[3]) || 0;
      const children = parseInt(first[4]) || 0;
      let totalAdults = 0, totalChildren = 0
      groupRows.forEach((row) => {
        totalAdults += parseInt(row[3]) || 0;
        totalChildren += parseInt(row[4]) || 0;
      });
      const totalPax = totalAdults + totalChildren;
      const flight = first[8];
      const flight_time = first[12];
      const transferTypeRaw = first[13];

      const transferType = isPrivate ? "Private" : "Shared";
      
      let brand;
      if (totalAdults + totalChildren < 6) {
          brand = "No Brand";
      } else {
          brand = "Charter";
      }
  
      const locations = [];
      groupRows.forEach((row) => {
        const loc = normalizeLocation(row[6]);
        if (loc && !locations.includes(loc)) locations.push(loc);
      });
  
      const isSingleStop = locations.length === 1;
      const pickup = locations[0];
  
      let route, name;
  
      if (isPrivate || groupRows.length === 1) {
        name = `Jet2 Departure Private (${first[1].trim()})`;
        route = `${hotel}-${dropoff}`;
      } else if (groupRows.length === 1) {
        name = `Jet2 Departure (${first[1].trim()})`;
        route = `${pickup}-${dropoff}`;
      } else {
        const busNumber = key.replace(/[^0-9]/g, "");
        name = busNumber ? `Jet2 Departure Bus ${busNumber}` : "Jet2 Departure Bus";
        route = `${locations.join("/")}-${dropoff}`;
      }
      
      outputRows.push([
        "",
        date,
        start_time,
        name,
        pickup,
        dropoff,
        route,
        totalAdults,
        totalChildren,
        "",
        "Transfer",
        "Arrival Transfer",
        transferType,
        brand,
        "",
        flight,
        flight_time,
        "",
        "",
        "Avra",
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