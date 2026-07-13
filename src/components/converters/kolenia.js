import * as pdfjsLib from "pdfjs-dist";
import * as XLSX from "xlsx";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { normalizeLocation } from "../utils/locations.js";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export async function convertKolenia(files) {
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
  for (const file of files) {
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

    const code = fullText.match(/Num Réservation:\s*(\d+)/)?.[1];
    const date = fullText.match(/Information pour votre arrivée:.*?Date:\s*(\d{2}\/\d{2}\/\d{4})/s)?.[1];
    const name = fullText.match(/Service à l'attention de:\s*(.*?)\s*Date du Voucher/)?.[1];
    const phone = fullText.match(/Numéro de téléphone[\s:]*([\+\d\s()-]+)/i)?.[1]?.trim();
    const start_time = fullText.match(/Heure de rendez-vous:\s*(\d{2}:\d{2})/)?.[1];
    const pickupRaw = fullText.match(/Information pour votre arrivée:.*?De:\s*(.*?)\s*Date:/s)?.[1]?.trim();
    const dropoffRaw = fullText.match( /à:\s*(.*?)\s*Adresse:/s)?.[1]?.trim();
    const address = fullText.match(/Adresse:\s*(.*?)\s*Votre chauffeur/s)?.[1]?.trim();
    const flight = fullText.match(/Vol:\s*([A-Z0-9]+)/)?.[1] || "";
    const adults = fullText.match(/Nombre d'Adultes:\s*(\d+)/)?.[1];
    const children = fullText.match(/Nombre d'Enfants:\s*(\d+)/)?.[1];
    const infants = fullText.match(/Nombre de Bébés:\s*(\d+)/)?.[1];

    const isArrival = pickupRaw?.includes("Airport") || pickupRaw?.includes("Port")

    let pickup, dropoff, routeType, flightTime, route;

    if (isArrival) {
        pickup = "Airport";
        dropoff = normalizeLocation(address);
        routeType = "Arrival Transfer";
        flightTime = start_time;
        route = `${pickup}-${dropoffRaw}`;
    } else {
        pickup = normalizeLocation(address);
        dropoff = "Airport";
        routeType = "Departure Transfer";
        route = `${pickupRaw}-${dropoff}`;
    }

    //Transfer
    outputRows.push([
        code,
        date,
        start_time,
        `${name} ${phone}`,
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
        flightTime,
        "",
        "",
        "Kolenia",
    ]);
  }
  const newWorkbook = XLSX.utils.book_new();

  const newSheet = XLSX.utils.aoa_to_sheet(outputRows);
  XLSX.utils.book_append_sheet(newWorkbook, newSheet, "Converted");
  XLSX.writeFile(newWorkbook, "Kolenia_converted.xlsx");
}