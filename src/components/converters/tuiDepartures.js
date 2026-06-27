import * as XLSX from "xlsx";
import { normalizeLocation } from "../utils/locations.js";
import { normalizeClient } from "../utils/tui.js";

export async function convertTuiDepartures(files) {
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
    if (!row[10] || !row[10].includes("/")) return;
    if (!row[6] || !row[3]) return;
    const fullCode = row[10];
    const code = fullCode.includes("/") ? fullCode.split("/")[1].trim() : fullCode.trim();
    const vehicle = row[6];
    const key = `${code}__${vehicle}`;

    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key).push(row);
  });
  
  groups.forEach((groupRows, key) => {
    const first = groupRows[0];
    const code = first[10].includes("/") ? first[10].split("/")[1].trim() : first[10].trim();
    const date = first[3];
    const start_time = (first[2] || "").split(" - ")[0].trim();
    const vehicle = first[6];
    const transferType = first[7];
    let totalAdults = 0, totalChildren = 0, totalInfants = 0;
    groupRows.forEach((row) => {
      const pax = row[25] || "0/0/0";
      const [a, c, i] = pax.split("/").map(s => parseInt(s) || 0);
      totalAdults += a;
      totalChildren += c;
      totalInfants += i;
    });
    const totalPax = parseInt(first[11]) || 0;
    const flightAndTime = first[24];
    const flightParts = flightAndTime.split("-");
    const flight = flightParts.length >= 3 ? flightParts[2] : "";
    const flight_time = flightParts.length >= 1 ? flightParts[0] : "";
    const comment = first[23];
    const client = normalizeClient(comment);

    let brand;
    if (transferType.toLowerCase().includes("private")) {
        brand = "Taxi";
    } else {
        if (totalPax < 6) {
            brand = "No Brand";
        } else if (totalPax <= 15) {
            brand = "Minibus";
        } else {
            brand = "Charter";
        }
    }

    const locations = [];
    groupRows.forEach((row) => {
      const loc = normalizeLocation(row[16]);
      if (loc && !locations.includes(loc)) {
        locations.push(loc);
      }
    });

    const dropoff = normalizeLocation(first[0]);
    const isSingleStop = locations.length === 1;
    const pickup = locations[0];

    let route, name;

    if (transferType.toLowerCase().includes("private")) {
      const passengerName = first[22] ? ` (${first[22].split(",").slice(0, 2).join(",").trim()})` : "";
      name = `${vehicle}${passengerName}`;
      const hotelName = first[19].trim();
      route = `${hotelName}-${dropoff}`;
    } else if (groupRows.length === 1) {
      const passengerName = first[22] ? ` (${first[22].split(",").slice(0, 2).join(",").trim()})` : "";
      name = `${vehicle}${passengerName}`;
      route = `${pickup}-${dropoff}`;
    } else {
      name = vehicle;
      route = `${locations.join("/")}-${dropoff}`;
    }
    
    outputRows.push([
      code,
      date,
      start_time,
      name,
      pickup,
      dropoff,
      route,
      totalAdults,
      totalChildren,
      totalInfants,
      "Transfer",
      "Departure Transfer",
      transferType,
      brand,
      "",
      flight,
      flight_time,
      comment,
      "",
      client,
    ]);
  });

  const hotelOutputRows = [];

  groups.forEach((groupRows) => {
    const first = groupRows[0];
    const code = first[10].includes("/") ? first[10].split("/")[1].trim() : first[10].trim();

    hotelOutputRows.push([code, "", "", ""]);

    const hotelMap = new Map();
    groupRows.forEach((row) => {
      const hotel = row[19].trim();
      if (!hotelMap.has(hotel)) hotelMap.set(hotel, []);
      hotelMap.get(hotel).push(row);
    });

    hotelMap.forEach((hotelRows, hotel) => {
      const location = hotelRows[0][16].trim();
      const time = (hotelRows[0][18] || "").split(" - ")[0].trim();

      let hotelAdults = 0, hotelChildren = 0, hotelInfants = 0;
      hotelRows.forEach((row) => {
        const pax = row[25] || "0/0/0";
        const [a, c, i] = pax.split("/").map(s => parseInt(s) || 0);
        hotelAdults += a;
        hotelChildren += c;
        hotelInfants += i;
      });
      const totalHotelPax = hotelAdults + hotelChildren + hotelInfants;

      hotelOutputRows.push([location, hotel, totalHotelPax, time]);
    });

    hotelMap.forEach((hotelRows, hotel) => {
      hotelOutputRows.push([hotel, "", "", ""]);
      hotelRows.forEach((row) => {
        const pax = row[25] || "0/0/0";
        const [a, c, i] = pax.split("/").map(s => parseInt(s) || 0);
        const leadName = (row[22] || "").split(",").slice(0, 2).join(",").trim();
        hotelOutputRows.push(["", leadName, a, c, i]);
      });
    });

    hotelOutputRows.push(["", "", "", ""]);
  });

  const newWorkbook = XLSX.utils.book_new();
  const newSheet = XLSX.utils.aoa_to_sheet(outputRows);
  XLSX.utils.book_append_sheet(newWorkbook, newSheet, "Converted");
  XLSX.writeFile(newWorkbook, `${file.name.replace(/\.[^.]+$/, "")}_converted.xlsx`);

  const hotelsWorkbook = XLSX.utils.book_new();
  const hotelsSheet = XLSX.utils.aoa_to_sheet(hotelOutputRows);
  XLSX.utils.book_append_sheet(hotelsWorkbook, hotelsSheet, "Hotels");
  XLSX.writeFile(hotelsWorkbook, `${file.name.replace(/\.[^.]+$/, "")}_hotels.xlsx`);
}
