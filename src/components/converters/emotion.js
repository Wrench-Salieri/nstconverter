import * as pdfjsLib from "pdfjs-dist";
import * as XLSX from "xlsx";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { normalizeLocationAth } from "../utils/locations_ath.js";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export async function convertEmotion(files) {
  const file = files[0];

  const data = await file.arrayBuffer();

  const pdf = await pdfjsLib.getDocument({ data }).promise;

  let fullText = "";

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber);

    const content = await page.getTextContent();

    const pageText = content.items
      .map(item => item.str)
      .join("\n");

    fullText += pageText + "\n";
  }

  const bookings = fullText
  .split(/(?=\d{2}-\d{2}-\d{4}\d{2}:\d{2})/)
  .map(booking =>
    booking
      .replace(/\n+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  )
  .filter(booking => booking !== "");

  bookings.shift();

  bookings[bookings.length - 1] =
    bookings[bookings.length - 1].replace(/\s+Total$/, "");

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

  bookings.forEach((booking) => {

    const match = booking.match(
      /^(\d{2}-\d{2}-\d{4})(\d{2}:\d{2})\s+(\d+)\s+(.*?)\s+(\+\d+)\s+(STANDARD|PEOPLE_CARRIER|LARGE_PEOPLE_CARRIER|MINIBUS|EXECUTIVE)\s+(\d+)\s+(-|[A-Z0-9]+)\s+(.*?)(?:\s*-\s*Rideways NST)?$/
    );
    
    if (!match) return;

    const date = match[1].replace(/-/g, "/");
    const start_time = match[2];
    const code = match[3];
    const name = match[4];
    const phone = match[5];
    const pax = match[7];
    const flight = match[8] === "-" ? "" : match[8];
    const locations = match[9].trim();
    const AIRPORT_PATTERN = /Eleftherios Venizelos International Airport[^,]*,\s*Attiki Odos,\s*Spata\s*19019,\s*Greece/;
    const hasAirportFirst = locations.trimStart().startsWith("Eleftherios Venizelos");

    let pickup, dropoff, routeType, routeDesc, flight_time;

    if (hasAirportFirst) {
      const hotelPart = locations.replace(AIRPORT_PATTERN, "").trim();
      const hotelName = hotelPart.split(",")[0].trim();
      pickup = "Athens airport";
      dropoff = normalizeLocationAth(hotelPart);
      routeType = "Arrival Transfer";
      routeDesc = `Athens airport-${hotelName}`;
      flight_time = start_time;
    } else {
      const hotelPart = locations.replace(AIRPORT_PATTERN, "").trim();
      const hotelName = hotelPart.split(",")[0].trim();
      pickup = normalizeLocationAth(hotelPart);
      dropoff = "Athens airport";
      routeType = "Departure Transfer";
      routeDesc = `${hotelName}-Athens airport`;
      flight_time = "";
    }
    outputRows.push([
      code,
      date,
      start_time,
      name,
      pickup,
      dropoff,
      routeDesc,
      pax,
      "0",
      "0",
      "Transfer",
      routeType,
      "Private",
      "No Brand",
      "",
      flight,
      flight_time,
      phone,
      "",
      "E-MOTION",
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
