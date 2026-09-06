import React, { useState } from 'react';
import { 
  Car, 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronDown, 
  Info, 
  Check, 
  X,
  ArrowLeft,
  Layers,
  FileSpreadsheet,
  Settings,
  Pencil,
  QrCode
} from 'lucide-react';
import { translations } from '../i18n';
import { getVehicleAlerts } from '../utils/calculations';

export const VehicleCarousel = ({
  vehicles,
  selectedVehicleIds = [],
  onToggleVehicle,
  onSelectAllVehicles,
  onOpenAddVehicle,
  onOpenVehicleDetails,
  onOpenExport,
  onOpenConnect,
  lang
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const t = translations[lang];

  const isAllSelected = !selectedVehicleIds || selectedVehicleIds.length === vehicles.length;
  const selectedVehicles = vehicles.filter(v => selectedVehicleIds?.includes(v.id));
  const singleVehicle = selectedVehicles.length === 1 ? selectedVehicles[0] : null;

  return (
    <section className="mb-3.5">
      {/* Compact Top Bar: [Vehicule] + [Plate / Badge] on Left, Round [QR] [Backup] on Right */}
      <div className="flex items-center justify-between gap-1.5 px-0.5 w-full">
        {/* Left Group: Vehicule button + Selection summary badge */}
        <div className="flex items-center gap-1.5 min-w-0 flex-1 overflow-hidden">
          {/* Vehicule button */}
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className={`h-8 inline-flex items-center gap-1 px-2.5 rounded-xl border text-[11px] font-black shadow-2xs active:scale-95 transition-all shrink-0 cursor-pointer ${
              !isAllSelected
                ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500/50 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500/20'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 hover:border-emerald-500/50'
            }`}
          >
            <Car className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{t.vehicles}</span>
            <ChevronDown className="w-2.5 h-2.5 text-slate-400 shrink-0" />
          </button>

          {/* If all vehicles are selected */}
          {isAllSelected && (
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 truncate">
              {lang === 'en' ? `All (${vehicles.length})` : `Toate (${vehicles.length})`}
            </span>
          )}

          {/* If exactly 1 car is selected, show plate badge */}
          {singleVehicle && (
            <div className="h-8 inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-2 rounded-xl text-[11px] font-mono font-black text-slate-900 dark:text-slate-100 shadow-2xs whitespace-nowrap shrink-0">
              <span className="text-[8.5px] text-blue-500 font-bold leading-none">RO</span>
              <span className="leading-none tracking-tight">{singleVehicle.plate}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectAllVehicles && onSelectAllVehicles(true);
                }}
                className="text-slate-400 hover:text-rose-500 p-0.5 rounded-md transition-colors ml-0.5 cursor-pointer"
                title={lang === 'en' ? "Select all" : "Selectează toate"}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* If multiple (but not all) are selected */}
          {!isAllSelected && !singleVehicle && (
            <div className="h-8 inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/40 px-2 rounded-xl text-[11px] font-extrabold text-emerald-700 dark:text-emerald-300 shadow-2xs whitespace-nowrap shrink-0">
              <span>
                {lang === 'en' 
                  ? `${selectedVehicleIds.length} of ${vehicles.length}` 
                  : `${selectedVehicleIds.length} din ${vehicles.length}`}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectAllVehicles && onSelectAllVehicles(true);
                }}
                className="text-emerald-600 dark:text-emerald-400 hover:text-rose-500 p-0.5 rounded-md transition-colors ml-0.5 cursor-pointer"
                title={lang === 'en' ? "Select all" : "Selectează toate"}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Right side: Round QR and Backup buttons (No text, icons only, matching height) */}
        <div className="flex items-center gap-2 ml-auto shrink-0">
          {onOpenConnect && (
            <button
              type="button"
              onClick={onOpenConnect}
              className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 transition-all flex items-center justify-center shrink-0 shadow-2xs cursor-pointer active:scale-90"
              title="📲 Conectare Cod QR & Descarcă APK"
            >
              <QrCode className="w-4 h-4 stroke-[2.2]" />
            </button>
          )}

          {onOpenExport && (
            <button
              type="button"
              onClick={onOpenExport}
              className="w-8 h-8 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-400 text-slate-900 dark:text-slate-100 transition-all flex items-center justify-center shrink-0 shadow-2xs cursor-pointer active:scale-90"
              title="Export & Import Date (Backup)"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-slate-900 dark:fill-slate-100" fill="currentColor">
                <path fillRule="evenodd" clipRule="evenodd" d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM13 13v3.5h-2V13H8.5L12 9.5l3.5 3.5H13z" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* FULL-SCREEN VEHICLE SELECTION MODAL WITH CHECKBOXES (BIFE) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-100 dark:bg-[#090d16] flex flex-col animate-in fade-in duration-200">
          
          {/* SLIM COMPACT HEADER (Spațiu minim ocupat sus) */}
          <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-3 py-2 shadow-2xs">
            <div className="flex items-center justify-between gap-1.5 max-w-2xl mx-auto">
              <div className="flex items-center gap-1.5 min-w-0">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title={lang === 'en' ? "Close" : "Închide"}
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-1 min-w-0">
                  <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
                    Vehicule
                  </span>
                  <span className="text-[11px] font-mono font-black text-emerald-600 dark:text-emerald-400 shrink-0">
                    ({selectedVehicleIds.length}/{vehicles.length})
                  </span>
                </div>
              </div>

              {/* Acțiuni rapide pe o singură linie compactă */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => onSelectAllVehicles && onSelectAllVehicles(true)}
                  className="px-2 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold transition-colors"
                >
                  {lang === 'en' ? "All" : "Toate"}
                </button>
                <button
                  type="button"
                  onClick={() => onSelectAllVehicles && onSelectAllVehicles(false)}
                  className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[11px] font-medium transition-colors"
                >
                  {lang === 'en' ? "None" : "Niciuna"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onOpenAddVehicle();
                  }}
                  className="flex items-center gap-1 text-[11px] font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-2 py-1 rounded-lg shadow-xs transition-colors whitespace-nowrap ml-0.5"
                  title={lang === 'en' ? "Add new car" : "Adaugă mașină nouă"}
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>{lang === 'en' ? "New" : "Nouă"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-0.5"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Full-screen Body with Vehicle Cards & Interactive Checkboxes (Bife) */}
          <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-2.5 max-w-2xl mx-auto w-full pb-24">
            {vehicles.map((veh) => {
              const isChecked = selectedVehicleIds.includes(veh.id);
              const alerts = getVehicleAlerts(veh);
              const hasCritical = alerts.some(a => a.severity === 'critical');
              const hasWarning = alerts.some(a => a.severity === 'warning');

              return (
                <div
                  key={veh.id}
                  onClick={() => onToggleVehicle && onToggleVehicle(veh.id)}
                  className={`p-3 sm:p-3.5 rounded-2xl border transition-all cursor-pointer shadow-xs select-none ${
                    isChecked
                      ? 'bg-emerald-500/10 border-emerald-500 ring-2 ring-emerald-500/30'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-70 hover:opacity-100 hover:border-slate-400'
                  }`}
                >
                  {/* RÂNDUL 1: Checkbox + Număr Plăcuță RO (Stânga) | Pictograme Info & Setări (Dreapta) */}
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Checkbox Interactiv */}
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-all ${
                        isChecked 
                          ? 'bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/30 font-black' 
                          : 'border-2 border-slate-300 dark:border-slate-600 bg-transparent'
                      }`}>
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>

                      {/* Plăcuță Înmatriculare */}
                      <span className="whitespace-nowrap shrink-0 inline-flex items-center bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-0.5 font-mono text-xs font-black text-slate-900 dark:text-slate-100 shadow-2xs">
                        <span className="text-[8px] text-blue-500 mr-1 font-bold">RO</span>
                        {veh.plate}
                      </span>
                    </div>

                    {/* Pictograme Dreapta: Informații (i) + Setări/Editează (⚙️) */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Pictogramă Informații Vehicul */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsOpen(false);
                          onOpenVehicleDetails && onOpenVehicleDetails(veh, false);
                        }}
                        className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                        title={lang === 'en' ? "Vehicle details" : "Informații vehicul"}
                      >
                        <Info className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                      </button>

                      {/* Pictogramă Setări / Editează Vehicul */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsOpen(false);
                          onOpenVehicleDetails && onOpenVehicleDetails(veh, true);
                        }}
                        className="p-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-emerald-500/20 text-slate-600 hover:text-emerald-600 dark:text-slate-300 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                        title={lang === 'en' ? "Edit vehicle" : "Setări & Editare vehicul"}
                      >
                        <Settings className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      </button>
                    </div>
                  </div>

                  {/* RÂNDUL 2: Modelul Autovehiculului (COMPLET VIZIBIL, NICIODATĂ TRUNCHIAT) */}
                  <div className="pl-7.5 mb-1.5">
                    <div className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white leading-tight">
                      {veh.makeModel || (lang === 'en' ? "Vehicle model not specified" : "Model nespecificat")}
                    </div>
                  </div>

                  {/* RÂNDUL 3: Kilometri & Șofer (Stânga) | Badge Stare (Dreapta) */}
                  <div className="pl-7.5 flex items-center justify-between gap-2 pt-1.5 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                    <div className="flex items-center gap-2 min-w-0 font-mono text-[11.5px] text-slate-600 dark:text-slate-400 truncate">
                      <span className="font-black text-slate-900 dark:text-slate-100 shrink-0">
                        {veh.currentKm ? `${veh.currentKm.toLocaleString('ro-RO')} km` : (lang === 'en' ? 'No km' : 'Fără km')}
                      </span>
                      {veh.driver && (
                        <>
                          <span className="text-slate-300 dark:text-slate-700 shrink-0">•</span>
                          <span className="truncate">{veh.driver}</span>
                        </>
                      )}
                    </div>

                    {/* Stare Scadențe */}
                    <div className="shrink-0">
                      {hasCritical ? (
                        <span className="inline-flex items-center gap-1 bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-[10px] font-extrabold px-2 py-0.5 rounded-lg">
                          <AlertTriangle className="w-3 h-3 animate-pulse" />
                          {lang === 'en' ? "Alert" : "Alertă"}
                        </span>
                      ) : hasWarning ? (
                        <span className="inline-flex items-center gap-1 bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/30 text-[10px] font-extrabold px-2 py-0.5 rounded-lg">
                          <AlertTriangle className="w-3 h-3" />
                          {lang === 'en' ? "Due Soon" : "Scadent"}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold px-2 py-0.5 rounded-lg">
                          <CheckCircle2 className="w-3 h-3" />
                          OK
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sticky Bottom Apply Button */}
          <div className="sticky bottom-0 bg-white/95 dark:bg-slate-900/95 border-t border-slate-200 dark:border-slate-800 p-3 sm:p-4 backdrop-blur-md">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm rounded-2xl shadow-md shadow-emerald-500/25 transition-all active:scale-95"
            >
              {lang === 'en'
                ? `Apply Selection (${selectedVehicleIds.length} of ${vehicles.length} vehicles in calculations)`
                : `Aplică Selecția (${selectedVehicleIds.length} din ${vehicles.length} mașini în calcule)`}
            </button>
          </div>

        </div>
      )}
    </section>
  );
};
