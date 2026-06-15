import * as XLSX from "xlsx";
import { normalizeLocation } from "../utils/locations.js";
import { normalizeClient } from "../utils/tui.js";

export async function convertTuiArrivals(files) {
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
    const start_time = first[2];
    const vehicle = first[6];
    const transferType = first[7];
    const pax = first[25];
    const [adults, children, infants] = pax.split("/").map(Number);
    const totalPax = first[11];
    const flightAndTime = first[24];
    const [flight, flight_time] = flightAndTime.split(" ").length > 1 ? flightAndTime.split(" ") : ["", ""];
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

    const pickup = normalizeLocation(first[0]);
    const isSingleStop = locations.length === 1;
    const dropoff = locations[locations.length - 1];

    let route, name;

    if (groupRows.length === 1) {
      const passengerName = first[22] ? ` (${first[22].split(",")[0].trim()})` : "";
      name = `${vehicle}${passengerName}`;
      route = `${pickup}-${dropoff}`;
    } else if (isSingleStop) {
      name = vehicle;
      route = `${pickup}-${dropoff}`;
    } else {
      name = vehicle;
      route = `${pickup}/${locations.join("/")}`;
    }

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
      "Arrival Transfer",
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

  let txtContent = "";

  groups.forEach((groupRows, key) => {
    const first = groupRows[0];
    const code = first[10].includes("/") ? first[10].split("/")[1].trim() : first[10].trim();

    const hotelMap = new Map();
    groupRows.forEach((row) => {
      const hotel = row[16].trim();
      if (!hotelMap.has(hotel)) hotelMap.set(hotel, []);
      hotelMap.get(hotel).push(row);
    });

    txtContent += `${code}\n`;
    hotelMap.forEach((hotelRows, hotel) => {
      let hotelAdults = 0, hotelChildren = 0, hotelInfants = 0;
      hotelRows.forEach((row) => {
        const pax = row[25] || "0/0/0";
        const [a, c, i] = pax.split("/").map(s => parseInt(s) || 0);
        hotelAdults += a;
        hotelChildren += c;
        hotelInfants += i;
      });
      const totalHotelPax = hotelAdults + hotelChildren + hotelInfants;
      txtContent += `${hotel}\t${totalHotelPax}\n`;
    });

    txtContent += "-------------------------------\n";

    hotelMap.forEach((hotelRows, hotel) => {
      txtContent += `${hotel}\n`;
      hotelRows.forEach((row) => {
        const pax = row[25] || "0/0/0";
        const [a, c, i] = pax.split("/").map(s => parseInt(s) || 0);
        const passengers = row[22].trim();
        txtContent += `${passengers}\t${a}\t${c}\t${i}\n`;
      });
      txtContent += "\n";
    });

    txtContent += "\n\n";
  });

  // Download TXT
  const blob = new Blob([txtContent], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${file.name.replace(/\.[^.]+$/, "")}_hotels.txt`;
  a.click();
  URL.revokeObjectURL(url);

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
