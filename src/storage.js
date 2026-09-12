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

const PULSE_ALERTS_KEY = 'carsapp_pulse_alerts_v1';

export const getStoredPulseAlerts = () => {
  try {
    const raw = localStorage.getItem(PULSE_ALERTS_KEY);
    return raw !== null ? raw === 'true' : true;
  } catch (_) {
    return true;
  }
};

export const setStoredPulseAlerts = (enabled) => {
  try {
    localStorage.setItem(PULSE_ALERTS_KEY, String(enabled));
  } catch (_) {}
};

const IMMERSIVE_MODE_KEY = 'carsapp_immersive_mode_v1';

export const getStoredImmersiveMode = () => {
  try {
    return localStorage.getItem(IMMERSIVE_MODE_KEY) === 'true';
  } catch (_) {
    return false;
  }
};

export const setStoredImmersiveMode = (enabled) => {
  try {
    localStorage.setItem(IMMERSIVE_MODE_KEY, String(enabled));
  } catch (_) {}
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

  if (typeof data === 'string') {
    let cleanStr = data.trim();

    // Strip UTF-8 BOM if present
    if (cleanStr.charCodeAt(0) === 0xFEFF) {
      cleanStr = cleanStr.slice(1).trim();
    }

    // Strip Markdown code blocks if user copied from chat/AI
    if (cleanStr.startsWith('```')) {
      cleanStr = cleanStr.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
    }

    try {
      data = JSON.parse(cleanStr);
      if (typeof data === 'string') {
        data = JSON.parse(data.trim());
      }
    } catch (e) {
      console.warn("CarsApp JSON parse failed, trying substring extraction:", e);
      // Try finding JSON object { ... }
      const firstBrace = cleanStr.indexOf('{');
      const lastBrace = cleanStr.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        try {
          data = JSON.parse(cleanStr.substring(firstBrace, lastBrace + 1));
        } catch (err2) {}
      }

      // Try finding JSON array [ ... ]
      if (!data || typeof data !== 'object') {
        const firstBracket = cleanStr.indexOf('[');
        const lastBracket = cleanStr.lastIndexOf(']');
        if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
          try {
            data = JSON.parse(cleanStr.substring(firstBracket, lastBracket + 1));
          } catch (err3) {}
        }
      }
    }
  }

  if (!data || typeof data !== 'object') return null;

  // Unwrap potential wrapper keys
  let source = data;
  if (source.data && typeof source.data === 'object' && !Array.isArray(source.data)) {
    source = { ...source, ...source.data };
  }
  if (source.backup && typeof source.backup === 'object' && !Array.isArray(source.backup)) {
    source = { ...source, ...source.backup };
  }

  // 1. Extract Vehicles
  let vehicles = null;
  if (Array.isArray(source)) {
    if (source.length > 0 && (source[0].plate || source[0].make || source[0].model || source[0].name)) {
      vehicles = source;
    }
  } else if (Array.isArray(source.vehicles)) {
    vehicles = source.vehicles;
  } else if (Array.isArray(source.cars)) {
    vehicles = source.cars;
  } else if (Array.isArray(source.vehicule)) {
    vehicles = source.vehicule;
  } else if (Array.isArray(source.fleet)) {
    vehicles = source.fleet;
  } else if (source.vehicles && typeof source.vehicles === 'object') {
    vehicles = Object.values(source.vehicles);
  }

  // 2. Extract Records
  let records = [];
  if (Array.isArray(source.records)) {
    records = source.records;
  } else if (Array.isArray(source.expenses)) {
    records = source.expenses;
  } else if (Array.isArray(source.cheltuieli)) {
    records = source.cheltuieli;
  } else if (Array.isArray(source.inregistrari)) {
    records = source.inregistrari;
  } else if (source.records && typeof source.records === 'object') {
    records = Object.values(source.records);
  }

  // 3. Extract Personal Trips
  let personalTrips = [];
  if (Array.isArray(source.personalTrips)) {
    personalTrips = source.personalTrips;
  } else if (Array.isArray(source.trips)) {
    personalTrips = source.trips;
  } else if (Array.isArray(source.curse)) {
    personalTrips = source.curse;
  } else if (Array.isArray(source.cursePersonale)) {
    personalTrips = source.cursePersonale;
  } else if (source.personalTrips && typeof source.personalTrips === 'object') {
    personalTrips = Object.values(source.personalTrips);
  }

  // If no vehicles array found directly, but records exist with vehicle IDs
  if ((!vehicles || vehicles.length === 0) && records.length > 0) {
    const uniqueVehIds = [...new Set(records.map(r => r.vehicleId).filter(Boolean))];
    if (uniqueVehIds.length > 0) {
      vehicles = uniqueVehIds.map((id, idx) => ({
        id: id,
        name: `Vehicul ${id}`,
        plate: id,
        type: 'personal',
        currentKm: 0
      }));
    }
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
