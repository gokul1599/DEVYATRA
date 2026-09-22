const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

const MASTER_TEMPLES_COLUMNS = [
  "Temple_ID", "Temple_Name", "Temple_Name_Local", "Alternate_Name", "Previous_Name",
  "Temple_Type", "Religious_Tradition", "Country", "State", "State_Code",
  "District", "Administrative_Unit_Type", "Mandal_Taluk_Tehsil", "Village_City_Town", "Locality",
  "Address", "PIN_Code", "Latitude", "Longitude", "Google_Place_ID",
  "Map_URL", "Main_Deity", "Secondary_Deities", "Deity_Tradition", "Temple_Goddess_God",
  "Temple_Description", "Why_Famous", "Religious_Significance", "Historical_Significance", "Architectural_Style",
  "Construction_Period", "Founder", "Dynasty", "Historical_Era", "Opening_Time",
  "Closing_Time", "Darshan_Start", "Darshan_End", "Morning_Timings", "Evening_Timings",
  "Special_Darshan_Timings", "Daily_Pooja", "Special_Pooja", "Seva_Available", "Seva_Booking_URL",
  "Ticket_Required", "Ticket_Price", "Special_Darshan_Price", "VIP_Darshan_Available", "Advance_Booking_Required",
  "Advance_Booking_Days", "Online_Booking_URL", "Offline_Ticket_Availability", "Major_Festivals", "Festival_Month",
  "Festival_Dates", "Festival_Importance", "Parking_Available", "Wheelchair_Access", "Elderly_Friendly",
  "Restrooms", "Drinking_Water", "Cloakroom", "Footwear_Storage", "Prasadam_Available",
  "Annadanam", "Accommodation", "Temple_Guest_House", "Nearby_Temples", "Nearby_Restaurants",
  "Nearby_Hotels", "Nearby_Historical_Places", "Nearby_Nature_Attractions", "Nearby_Hospitals", "Nearby_Pharmacies",
  "Nearby_Fuel_Stations", "Nearby_Parking", "Nearby_Transport", "Official_Website", "Official_Email",
  "Official_Phone", "Temple_Authority", "Government_Department", "Image_URL_1", "Image_URL_2",
  "Image_URL_3", "Image_Source", "Primary_Source", "Secondary_Source", "Source_URL",
  "Official_Record_ID", "Source_Type", "Verification_Status", "Last_Verified_Date", "Data_Confidence",
  "Notes"
];

async function generateExcel() {
  console.log("==================================================");
  console.log("🇮🇳 COMPILING 11-SHEET EXPANDED EXCEL WORKBOOK");
  console.log("==================================================");

  const baseDir = path.resolve(__dirname, '..');
  const jsonPath = path.join(baseDir, 'india_temple_master.json');
  const xlsxPath = path.join(baseDir, 'india_temple_master.xlsx');

  if (!fs.existsSync(jsonPath)) {
    console.error(`Error: JSON file not found at ${jsonPath}`);
    process.exit(1);
  }

  const rawData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const temples = rawData.temples || [];
  const states = rawData.states || [];
  const districts = rawData.districts || [];
  const adminUnits = rawData.administrative_units || [];
  const sources = rawData.sources || [];
  const festivals = rawData.festivals || [];
  const booking = rawData.booking || [];
  const nearby = rawData.nearby_places || [];
  const importLog = rawData.import_log || [];
  const dataQuality = rawData.data_quality || [];
  const stateCoverage = rawData.state_coverage || [];

  console.log(`Loaded ${temples.length} temples for Excel export.`);

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "India National Temple Master Database Project";
  workbook.lastModifiedBy = "National Temple Registry Authority";
  workbook.created = new Date();
  workbook.modified = new Date();

  function setupSheet(ws, title, columns, data, isSaffronHeader = false) {
    ws.name = title;
    ws.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }];

    ws.columns = columns.map(col => ({
      header: col,
      key: col,
      width: Math.max(col.length + 4, 14)
    }));

    const headerRow = ws.getRow(1);
    headerRow.height = 28;
    headerRow.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: isSaffronHeader ? 'FFE65100' : 'FF1A237E' } // Saffron or Deep Navy
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center', wrapText: false };

    data.forEach((row, rIdx) => {
      const addedRow = ws.addRow(row);
      addedRow.height = 20;
      addedRow.alignment = { vertical: 'middle', wrapText: false };

      if (rIdx % 2 === 1) {
        addedRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF8F9FA' }
        };
      }
    });

    ws.columns.forEach(column => {
      let maxLen = column.header ? column.header.length : 12;
      column.eachCell({ includeEmpty: false }, (cell, rowNumber) => {
        if (rowNumber > 1) {
          const val = cell.value !== undefined && cell.value !== null ? String(cell.value) : "";
          if (val.length > maxLen) {
            maxLen = Math.min(val.length, 45);
          }
        }
      });
      column.width = Math.max(maxLen + 3, 14);
    });

    ws.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: columns.length }
    };
  }

  // 1. MASTER_TEMPLES (Saffron Header)
  setupSheet(workbook.addWorksheet("MASTER_TEMPLES"), "MASTER_TEMPLES", MASTER_TEMPLES_COLUMNS, temples, true);

  // 2. STATES
  setupSheet(
    workbook.addWorksheet("STATES"),
    "STATES",
    ["State_Code", "State_Name", "Capital", "Administrative_Unit_Type", "Total_Districts", "Primary_Endowments_Board", "Official_Portal", "Helpline"],
    states
  );

  // 3. DISTRICTS
  setupSheet(
    workbook.addWorksheet("DISTRICTS"),
    "DISTRICTS",
    ["District_Code", "District_Name", "State_Name", "State_Code", "Headquarters", "Administrative_Division"],
    districts
  );

  // 4. ADMINISTRATIVE_UNITS
  setupSheet(
    workbook.addWorksheet("ADMINISTRATIVE_UNITS"),
    "ADMINISTRATIVE_UNITS",
    ["Unit_Code", "Unit_Name", "Unit_Type", "District_Name", "State_Name"],
    adminUnits
  );

  // 5. TEMPLE_SOURCES
  setupSheet(
    workbook.addWorksheet("TEMPLE_SOURCES"),
    "TEMPLE_SOURCES",
    ["Temple_ID", "Source_Type", "Source_Name", "Source_URL", "Official_Record_ID", "Retrieved_Date", "Verification_Status"],
    sources
  );

  // 6. FESTIVALS
  setupSheet(
    workbook.addWorksheet("FESTIVALS"),
    "FESTIVALS",
    ["Festival_ID", "Festival_Name", "Temple_ID", "State", "District", "Month", "Date", "Description", "Source"],
    festivals
  );

  // 7. BOOKING
  setupSheet(
    workbook.addWorksheet("BOOKING"),
    "BOOKING",
    ["Temple_ID", "Online_Booking", "Booking_URL", "Ticket_Required", "Ticket_Price", "Darshan_Type", "Seva_Booking", "Source", "Last_Verified"],
    booking
  );

  // 8. NEARBY_PLACES
  setupSheet(
    workbook.addWorksheet("NEARBY_PLACES"),
    "NEARBY_PLACES",
    ["Temple_ID", "Place_Name", "Place_Type", "Distance_KM", "Latitude", "Longitude", "Source"],
    nearby
  );

  // 9. IMPORT_LOG
  setupSheet(
    workbook.addWorksheet("IMPORT_LOG"),
    "IMPORT_LOG",
    ["Import_ID", "Source_Organization", "Dataset_Name", "Import_Date", "Records_Ingested", "Status", "Coverage_Scope", "Notes"],
    importLog
  );

  // 10. DATA_QUALITY
  setupSheet(
    workbook.addWorksheet("DATA_QUALITY"),
    "DATA_QUALITY",
    ["Temple_ID", "Missing_Fields", "Duplicate_Flag", "Coordinate_Flag", "Source_Flag", "Verification_Flag", "Quality_Status"],
    dataQuality
  );

  // 11. STATE_COVERAGE (Saffron Header)
  setupSheet(
    workbook.addWorksheet("STATE_COVERAGE"),
    "STATE_COVERAGE",
    ["State", "Districts_Processed", "Temples_Discovered", "Temples_Added", "Officially_Verified", "Source_Verified", "Needs_Verification", "Duplicates_Removed", "Sources_Used", "Coverage_Status", "Last_Updated"],
    stateCoverage,
    true
  );

  console.log("Writing workbook to disk...");
  await workbook.xlsx.writeFile(xlsxPath);
  console.log(`✓ Generated 11-sheet Excel Workbook: ${xlsxPath}`);
}

generateExcel().catch(err => {
  console.error("Excel build error:", err);
  process.exit(1);
});
