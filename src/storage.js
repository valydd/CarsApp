import { initialVehicles, initialRecords } from './mockData';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

const VEHICLES_KEY = 'carsapp_vehicles_v1';
const RECORDS_KEY = 'carsapp_records_v1';
const PERSONAL_TRIPS_KEY = 'carsapp_personal_trips_v1';
const SELECTED_VEHICLES_KEY = 'carsapp_selected_vehicles_v1';
const LANGUAGE_KEY = 'carsapp_lang_v1';
const THEME_KEY = 'carsapp_theme_v1';

const DB_FILE_NAME = 'carsapp_database.json';
const DB_BAK_NAME = 'carsapp_database.bak';

// Debounced safe writer to native disk storage (Single file database)
let writeTimeout = null;
export const persistDatabaseToFile = (vehicles, records, personalTrips, selectedVehicleIds) => {
  if (!Capacitor.isNativePlatform()) return;

  if (writeTimeout) clearTimeout(writeTimeout);
  writeTimeout = setTimeout(async () => {
    try {
      const v = vehicles || getStoredVehicles();
      const r = records || getStoredRecords();
      const pt = personalTrips || getStoredPersonalTrips();
      const sel = selectedVehicleIds || getStoredSelectedVehicleIds(v);

      const payload = {
        appName: "CarsApp",
        version: "1.0",
        savedAt: new Date().toISOString(),
        vehicles: v,
        records: r,
        personalTrips: pt,
        selectedVehicleIds: sel
      };
      const jsonStr = JSON.stringify(payload, null, 2);

      // Write to primary persistent database file
      await Filesystem.writeFile({
        path: DB_FILE_NAME,
        data: jsonStr,
        directory: Directory.Data,
        encoding: Encoding.UTF8
      });

      // Write safety mirror backup file
      await Filesystem.writeFile({
        path: DB_BAK_NAME,
        data: jsonStr,
        directory: Directory.Data,
        encoding: Encoding.UTF8
      });
      console.log("CarsApp: Database safely written to disk (" + DB_FILE_NAME + ")");
    } catch (e) {
      console.error("CarsApp: Error writing database file to disk:", e);
    }
  }, 300);
};

// Initialize and recover database from native disk file
export const initNativeDatabase = async () => {
  if (!Capacitor.isNativePlatform()) return null;

  try {
    let fileContent = null;
    try {
      const res = await Filesystem.readFile({
        path: DB_FILE_NAME,
        directory: Directory.Data,
        encoding: Encoding.UTF8
      });
      fileContent = res.data;
    } catch (err) {
      // Try safety mirror backup if main file was missing
      try {
        const bakRes = await Filesystem.readFile({
          path: DB_BAK_NAME,
          directory: Directory.Data,
          encoding: Encoding.UTF8
        });
        fileContent = bakRes.data;
      } catch (bakErr) {
        // Fresh install: no disk file yet
      }
    }

    if (fileContent) {
      const parsed = JSON.parse(fileContent);
      if (parsed.vehicles && Array.isArray(parsed.vehicles) && parsed.vehicles.length > 0) {
        localStorage.setItem(VEHICLES_KEY, JSON.stringify(parsed.vehicles));
        if (parsed.records && Array.isArray(parsed.records)) {
          localStorage.setItem(RECORDS_KEY, JSON.stringify(parsed.records));
        }
        if (parsed.personalTrips && Array.isArray(parsed.personalTrips)) {
          localStorage.setItem(PERSONAL_TRIPS_KEY, JSON.stringify(parsed.personalTrips));
        }
        if (parsed.selectedVehicleIds && Array.isArray(parsed.selectedVehicleIds)) {
          localStorage.setItem(SELECTED_VEHICLES_KEY, JSON.stringify(parsed.selectedVehicleIds));
        }
        console.log("CarsApp: Recovered database from disk:", parsed.vehicles.length, "vehicles,", (parsed.records || []).length, "records");
        return {
          vehicles: parsed.vehicles,
          records: parsed.records || [],
          personalTrips: parsed.personalTrips || [],
          selectedVehicleIds: parsed.selectedVehicleIds || null
        };
      }
    }

    // Seed disk file from initial/current state if no disk file existed
    persistDatabaseToFile();
    return null;
  } catch (e) {
    console.error("CarsApp: Error during initNativeDatabase:", e);
    return null;
  }
};

export const getStoredSelectedVehicleIds = (allVehicles = []) => {
  try {
    const safeVehicles = Array.isArray(allVehicles) ? allVehicles : [];
    const raw = localStorage.getItem(SELECTED_VEHICLES_KEY);
    if (!raw) return safeVehicles.map(v => v.id);
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const valid = parsed.filter(id => safeVehicles.some(v => v && v.id === id));
      return valid.length > 0 ? valid : safeVehicles.map(v => v.id);
    }
    return safeVehicles.map(v => v.id);
  } catch (e) {
    return (allVehicles || []).map(v => v.id);
  }
};

export const saveStoredSelectedVehicleIds = (ids) => {
  try {
    localStorage.setItem(SELECTED_VEHICLES_KEY, JSON.stringify(ids));
    persistDatabaseToFile(null, null, null, ids);
  } catch (e) {
    console.error("Error saving selected vehicles:", e);
  }
};

export const getStoredLanguage = () => {
  return localStorage.getItem(LANGUAGE_KEY) || 'ro';
};

export const setStoredLanguage = (lang) => {
  localStorage.setItem(LANGUAGE_KEY, lang);
};

export const getStoredTheme = () => {
  return localStorage.getItem(THEME_KEY) || 'dark';
};

export const setStoredTheme = (theme) => {
  localStorage.setItem(THEME_KEY, theme);
};

export const getStoredVehicles = () => {
  try {
    const raw = localStorage.getItem(VEHICLES_KEY);
    if (!raw) {
      localStorage.setItem(VEHICLES_KEY, JSON.stringify(initialVehicles));
      return initialVehicles;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error("Error reading vehicles from localStorage:", e);
    return initialVehicles;
  }
};

export const saveStoredVehicles = (vehicles) => {
  localStorage.setItem(VEHICLES_KEY, JSON.stringify(vehicles));
  persistDatabaseToFile(vehicles);
};

export const getStoredRecords = () => {
  try {
    const raw = localStorage.getItem(RECORDS_KEY);
    if (!raw) {
      localStorage.setItem(RECORDS_KEY, JSON.stringify(initialRecords));
      return initialRecords;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error("Error reading records from localStorage:", e);
    return initialRecords;
  }
};

export const saveStoredRecords = (records) => {
  localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
  persistDatabaseToFile(null, records);
};

export const getStoredPersonalTrips = () => {
  try {
    const raw = localStorage.getItem(PERSONAL_TRIPS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error("Error reading personal trips from localStorage:", e);
    return [];
  }
};

export const saveStoredPersonalTrips = (trips) => {
  localStorage.setItem(PERSONAL_TRIPS_KEY, JSON.stringify(trips));
  persistDatabaseToFile(null, null, trips);
};

export const resetToDefaultData = () => {
  localStorage.setItem(VEHICLES_KEY, JSON.stringify(initialVehicles));
  localStorage.setItem(RECORDS_KEY, JSON.stringify(initialRecords));
  persistDatabaseToFile(initialVehicles, initialRecords, []);
  return { vehicles: initialVehicles, records: initialRecords };
};

export const parseBackupData = (input) => {
  if (!input) return null;
  let data = input;

  // Handle string JSON (even if double serialized)
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data.trim());
      if (typeof data === 'string') {
        data = JSON.parse(data.trim());
      }
    } catch (e) {
      console.error("CarsApp: JSON parse error in parseBackupData:", e);
      return null;
    }
  }

  if (!data || typeof data !== 'object') return null;

  // Handle wrappers like { data: { ... } } or { backup: { ... } }
  if (data.data && typeof data.data === 'object' && !Array.isArray(data.data)) {
    data = { ...data, ...data.data };
  }
  if (data.backup && typeof data.backup === 'object' && !Array.isArray(data.backup)) {
    data = { ...data, ...data.backup };
  }

  // Detect vehicles array
  let vehicles = null;
  if (Array.isArray(data)) {
    vehicles = data;
  } else if (Array.isArray(data.vehicles)) {
    vehicles = data.vehicles;
  } else if (Array.isArray(data.cars)) {
    vehicles = data.cars;
  } else if (Array.isArray(data.vehicule)) {
    vehicles = data.vehicule;
  } else if (Array.isArray(data.fleet)) {
    vehicles = data.fleet;
  }

  // Detect records array
  let records = [];
  if (Array.isArray(data.records)) {
    records = data.records;
  } else if (Array.isArray(data.expenses)) {
    records = data.expenses;
  } else if (Array.isArray(data.cheltuieli)) {
    records = data.cheltuieli;
  } else if (Array.isArray(data.inregistrari)) {
    records = data.inregistrari;
  }

  // Detect personal trips array
  let personalTrips = [];
  if (Array.isArray(data.personalTrips)) {
    personalTrips = data.personalTrips;
  } else if (Array.isArray(data.trips)) {
    personalTrips = data.trips;
  } else if (Array.isArray(data.curse)) {
    personalTrips = data.curse;
  } else if (Array.isArray(data.cursePersonale)) {
    personalTrips = data.cursePersonale;
  }

  if (!vehicles || !Array.isArray(vehicles) || vehicles.length === 0) {
    return null;
  }

  return {
    vehicles,
    records,
    personalTrips
  };
};

export const exportAllDataJSON = async (vehicles, records, personalTrips = []) => {
  const data = {
    appName: "CarsApp",
    version: "1.0",
    exportDate: new Date().toISOString(),
    vehicles,
    records,
    personalTrips
  };
  const jsonStr = JSON.stringify(data, null, 2);
  const fileName = `CarsApp_Flota_Backup_${new Date().toISOString().slice(0, 10)}.json`;

  if (Capacitor.isNativePlatform()) {
    try {
      const writeResult = await Filesystem.writeFile({
        path: fileName,
        data: jsonStr,
        directory: Directory.Cache,
        encoding: Encoding.UTF8
      });

      await Share.share({
        title: "CarsApp Backup Flota",
        text: "Copie de siguranță date flotă CarsApp",
        url: writeResult.uri,
        dialogTitle: "Salvează sau Trimite Backup"
      });
      return { success: true, native: true };
    } catch (err) {
      console.warn("Native file share error, fallback to text share", err);
      try {
        await Share.share({
          title: "CarsApp Backup Flota",
          text: jsonStr,
          dialogTitle: "Salvează sau Trimite Backup"
        });
        return { success: true, native: true };
      } catch (shareErr) {
        console.error("Share failed", shareErr);
      }
    }
  }

  // Browser download fallback
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
  return { success: true, native: false };
};

export const exportRecordsCSV = async (vehicles, records) => {
  const vehMap = {};
  vehicles.forEach(v => { vehMap[v.id] = v.plate; });

  const headers = ["Data", "Masina", "Categorie", "Titlu", "Suma (RON)", "Kilometraj", "Detalii / Note"];
  const rows = records.map(r => [
    r.date,
    `"${vehMap[r.vehicleId] || r.vehicleId}"`,
    `"${r.category}"`,
    `"${(r.title || '').replace(/"/g, '""')}"`,
    r.amount,
    r.km || '',
    `"${(r.notes || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
  const fileName = `CarsApp_Jurnal_Cheltuieli_${new Date().toISOString().slice(0, 10)}.csv`;

  if (Capacitor.isNativePlatform()) {
    try {
      const writeResult = await Filesystem.writeFile({
        path: fileName,
        data: csvContent,
        directory: Directory.Cache,
        encoding: Encoding.UTF8
      });

      await Share.share({
        title: "CarsApp Jurnal Cheltuieli (CSV)",
        url: writeResult.uri,
        dialogTitle: "Salvează sau Trimite Raport Excel/CSV"
      });
      return;
    } catch (e) {
      console.warn("Native CSV share failed", e);
    }
  }

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
};
