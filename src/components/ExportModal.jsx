import React, { useRef, useState } from 'react';
import { 
  X, 
  FileSpreadsheet, 
  Download, 
  Upload, 
  RotateCcw, 
  Smartphone, 
  Share2, 
  Copy, 
  Check, 
  ClipboardPaste
} from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import { translations } from '../i18n';
import { exportAllDataJSON, exportRecordsCSV, resetToDefaultData, parseBackupData } from '../storage';

export const ExportModal = ({
  isOpen,
  onClose,
  vehicles,
  records,
  personalTrips = [],
  onDataRestored,
  onOpenConnect,
  lang
}) => {
  const t = translations[lang];
  const fileInputRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [showPasteArea, setShowPasteArea] = useState(false);
  const [pastedText, setPastedText] = useState('');

  const getBackupJSONString = () => {
    const currentVehicles = (vehicles && vehicles.length > 0) ? vehicles : getStoredVehicles();
    const currentRecords = (records && records.length >= 0) ? records : getStoredRecords();
    const currentTrips = (personalTrips && personalTrips.length >= 0) ? personalTrips : getStoredPersonalTrips();

    const data = {
      appName: "CarsApp",
      version: "1.0",
      exportDate: new Date().toISOString(),
      vehicles: currentVehicles,
      records: currentRecords,
      personalTrips: currentTrips
    };
    return JSON.stringify(data, null, 2);
  };

  const handleExportJSON = async () => {
    const currentVehicles = (vehicles && vehicles.length > 0) ? vehicles : getStoredVehicles();
    const currentRecords = (records && records.length >= 0) ? records : getStoredRecords();
    const currentTrips = (personalTrips && personalTrips.length >= 0) ? personalTrips : getStoredPersonalTrips();
    await exportAllDataJSON(currentVehicles, currentRecords, currentTrips);
  };

  const handleCopyJSON = async () => {
    const text = getBackupJSONString();
    let copiedSuccess = false;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        copiedSuccess = true;
      }
    } catch (err) {
      // ignore
    }
    if (!copiedSuccess) {
      try {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        copiedSuccess = document.execCommand("copy");
        document.body.removeChild(textarea);
      } catch (e) {
        // ignore
      }
    }
    if (copiedSuccess) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } else {
      alert("Nu s-a putut copia automat. Folosește opțiunea «Trimite Backup (WhatsApp / Drive)»");
    }
  };

  const handleShareJSON = async () => {
    await exportAllDataJSON(vehicles, records, personalTrips);
  };

  const handleExportCSV = async () => {
    await exportRecordsCSV(vehicles, records);
  };

  const handleImportJSON = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const parsed = parseBackupData(text);
        if (parsed && Array.isArray(parsed.vehicles) && parsed.vehicles.length > 0) {
          onDataRestored(parsed.vehicles, parsed.records || [], parsed.personalTrips || []);
          alert(`Datele au fost restaurate cu succes! (${parsed.vehicles.length} mașini, ${(parsed.records || []).length} înregistrări, ${(parsed.personalTrips || []).length} curse)`);
          onClose();
        } else {
          alert("Fișierul JSON nu a putut fi recunoscut ca un backup valid CarsApp. Verifică fișierul selectat.");
        }
      } catch (err) {
        alert("Eroare la citirea fișierului JSON.");
      }
    };
    reader.readAsText(file);
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleRestoreFromText = () => {
    if (!pastedText.trim()) return;
    try {
      const parsed = parseBackupData(pastedText);
      if (parsed && Array.isArray(parsed.vehicles) && parsed.vehicles.length > 0) {
        onDataRestored(parsed.vehicles, parsed.records || [], parsed.personalTrips || []);
        alert(`Datele au fost restaurate cu succes! (${parsed.vehicles.length} mașini, ${(parsed.records || []).length} înregistrări, ${(parsed.personalTrips || []).length} curse)`);
        onClose();
      } else {
        alert("Textul introdus nu conține o structură validă CarsApp (lipsesc vehiculele).");
      }
    } catch (e) {
      alert("Format JSON invalid. Verifică dacă ai copiat întregul text al fișierului de backup.");
    }
  };

  const handleReset = () => {
    if (window.confirm("Ești sigur că vrei să resetezi aplicația la datele demo inițiale?")) {
      const reset = resetToDefaultData();
      onDataRestored(reset.vehicles, reset.records);
      alert("Aplicația a fost resetată la datele demo!");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 dark:bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Export & Import Date (Backup)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Transferă datele între telefon și laptop</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options Body */}
        <div className="p-4 sm:p-5 space-y-3 overflow-y-auto">
          
          {/* SECTION: EXPORT DATA */}
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block px-1">
              Exportă Date (Salvare / Trimitere)
            </span>

            {/* 1. Share / Send directly (WhatsApp, Drive, Bluetooth, Email) */}
            <button
              onClick={handleShareJSON}
              className="w-full p-3 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-500/5 border border-emerald-500/40 hover:border-emerald-500 text-left flex items-center justify-between group transition-all shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/20 shrink-0">
                  <Share2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-black text-slate-900 dark:text-white">Trimite Backup (WhatsApp / Drive / Mail)</h4>
                    <span className="text-[9px] uppercase font-black bg-emerald-500 text-slate-950 px-1.5 py-0.2 rounded-md">
                      Recomandat
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">Trimite datele pe WhatsApp sau e-mail către laptop</p>
                </div>
              </div>
              <Share2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform shrink-0" />
            </button>

            {/* 2. Download JSON File */}
            <button
              onClick={handleExportJSON}
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 text-left flex items-center justify-between group transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:bg-blue-500/20 shrink-0">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Descarcă Fișier Backup (JSON)</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Salvează fișierul pe dispozitiv pentru transfer</p>
                </div>
              </div>
              <Download className="w-4 h-4 text-slate-400 group-hover:text-blue-500 shrink-0" />
            </button>

            {/* 3. Copy JSON to Clipboard */}
            <button
              onClick={handleCopyJSON}
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 text-left flex items-center justify-between group transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:bg-amber-500/20 shrink-0">
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    {copied ? "Copiat în memorie!" : "Copiază Textul Backup (Clipboard)"}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Copiază datele și lipește-le direct pe laptop</p>
                </div>
              </div>
              <Copy className="w-4 h-4 text-slate-400 group-hover:text-amber-500 shrink-0" />
            </button>

            {/* 4. CSV Export */}
            <button
              onClick={handleExportCSV}
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 hover:border-slate-400 text-left flex items-center justify-between group transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Export Tabel Excel / CSV</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Toate cheltuielile pentru contabilitate</p>
                </div>
              </div>
              <Download className="w-4 h-4 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-white shrink-0" />
            </button>
          </div>

          {/* SECTION: IMPORT DATA */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block px-1">
              Importă Date (Restaurare)
            </span>

            {/* File Upload */}
            <div>
              <input
                type="file"
                ref={fileInputRef}
                accept=".json"
                onChange={handleImportJSON}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/40 hover:border-purple-500 text-left flex items-center justify-between group transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-purple-500 text-white shadow-md shadow-purple-500/20 shrink-0">
                    <Upload className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white">Încarcă Fișier Backup (JSON)</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Selectează fișierul trimis de pe telefon</p>
                  </div>
                </div>
                <Upload className="w-4 h-4 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform shrink-0" />
              </button>
            </div>

            {/* Paste Code Toggle */}
            <button
              onClick={() => setShowPasteArea(!showPasteArea)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-2">
                <ClipboardPaste className="w-4 h-4 text-slate-400" />
                <span>Sau lipește textul copiat direct</span>
              </div>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400">
                {showPasteArea ? "Ascunde" : "Deschide"}
              </span>
            </button>

            {showPasteArea && (
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                <textarea
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="Lipește aici textul backup-ului JSON primit..."
                  className="w-full h-24 p-2 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-emerald-500 text-slate-900 dark:text-white resize-none"
                />
                <button
                  onClick={handleRestoreFromText}
                  disabled={!pastedText.trim()}
                  className="w-full py-2 bg-emerald-500 disabled:opacity-50 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-xs transition-colors"
                >
                  Restaurează Datele din Text
                </button>
              </div>
            )}
          </div>

          {/* Reset Demo Data */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={handleReset}
              className="w-full p-2 rounded-xl border border-rose-200 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Resetează la datele demonstrative inițiale</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
