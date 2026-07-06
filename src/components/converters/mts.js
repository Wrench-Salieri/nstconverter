import * as XLSX from "xlsx";
import { normalizeLocationAth } from "../utils/locations_ath.js";

export async function convertMTS(files) {
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
    const arrivalDeparture = row[8]
    const isArrival = arrivalDeparture.includes("Inbound");
    const code = isArrival ? row[0] : `${row[0]}-1`;
    const [day, month, year] = row[2].split(".");
    const date = `${day}/${month}/${year}`; 
    const name = row[3];

    let flightColumn, hotelColumn;

    if (isArrival) {
      flightColumn = row[9];
      hotelColumn = row[11];
    } else {
      flightColumn = row[11];
      hotelColumn = row[9];
    }
    
    const partsFlight = flightColumn.split(" ");
    const partsHotel = hotelColumn.split(" - ");
    const flight = partsFlight[1] || "";
    const times = (partsFlight[2] || "").split("-");
    const departureFlightTime = times[0] || "";
    const arrivalFlightTime = times[1] || ""; 

    let pickup, dropoff, hotel, start_time, flight_time, route;

    if (isArrival) {
      pickup = "Athens airport";
      dropoff = normalizeLocationAth(row[13]);
      hotel = partsHotel[1] || "";
      route = `Athens Airport-${hotel}`;
      start_time = arrivalFlightTime;
      flight_time = start_time;
    } else {
      pickup = normalizeLocationAth(row[13]);
      dropoff = "Athens airport";
      hotel = partsHotel[1] || "";
      route = `${hotel}-Athens Airport`;
      start_time = row[10];
      flight_time = departureFlightTime;
    }

    const adults = row[4];
    const children = row[5];
    const infants = row[6];
    const transferType = row[7];

    const routeType = (() => {
      if (isArrival) return `Arrival Transfer`;
      return `Departure Transfer`;
    })();

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
      "",
      "",
      "MTS Globe"
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
