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
  Settings,
  Trash2,
  QrCode,
  CloudUpload
} from 'lucide-react';
import { translations } from '../i18n';
import { getVehicleAlerts } from '../utils/calculations';
import { AlertsBanner } from './AlertsBanner';

export const VehicleCarousel = ({
  vehicles,
  selectedVehicleIds = [],
  onToggleVehicle,
  onSelectAllVehicles,
  onOpenAddVehicle,
  onOpenVehicleDetails,
  onDeleteVehicle,
  isOpen: externalIsOpen,
  setIsOpen: externalSetIsOpen,
  onOpenAlertsTab,
  activeVehicles,
  lang
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = externalSetIsOpen !== undefined ? externalSetIsOpen : setInternalIsOpen;

  const [vehicleToDelete, setVehicleToDelete] = useState(null);

  const t = translations[lang];

  const isAllSelected = !selectedVehicleIds || selectedVehicleIds.length === vehicles.length;
  const selectedVehicles = vehicles.filter(v => selectedVehicleIds?.includes(v.id));
  const singleVehicle = selectedVehicles.length === 1 ? selectedVehicles[0] : null;

  return (
    <section className="mb-3">
      {/* Rând Unificat: Număr Înmatriculare Aliniat la Stânga + Alertă Inline la Dreapta */}
      <div className="flex items-center gap-2 px-0.5 w-full">
        {/* Stânga: Plăcuță de înmatriculare sau Indicator Selecție */}
        <div className="shrink-0 flex items-center">
          {/* Dacă exact o mașină este selectată: afișează plăcuța de înmatriculare */}
          {singleVehicle && (
            <div className="h-8 inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 border border-slate-700 dark:border-slate-500 px-2.5 rounded-xl text-[11px] font-mono font-black text-slate-900 dark:text-slate-100 shadow-2xs whitespace-nowrap">
              <span className="text-[8.5px] text-blue-500 font-bold leading-none">RO</span>
              <span className="leading-none tracking-tight">{singleVehicle.plate}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectAllVehicles && onSelectAllVehicles(true);
                }}
                className="text-slate-400 hover:text-rose-500 p-0.5 rounded-md transition-colors ml-0.5 cursor-pointer"
                title={lang === 'en' ? "Select all vehicles" : "Selectează toate vehiculele"}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Dacă toate vehiculele sunt selectate */}
          {isAllSelected && !singleVehicle && (
            <button 
              type="button"
              onClick={() => setIsOpen(true)}
              className="h-8 inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 px-2.5 rounded-xl text-[11px] font-extrabold text-slate-800 dark:text-slate-200 shadow-2xs cursor-pointer whitespace-nowrap active:scale-95 transition-all"
              title={lang === 'en' ? "Filter vehicles" : "Filtrează mașinile"}
            >
              <Car className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{lang === 'en' ? `All (${vehicles.length})` : `Toate (${vehicles.length})`}</span>
            </button>
          )}

          {/* Dacă mai multe mașini sunt selectate (dar nu toate) */}
          {!isAllSelected && !singleVehicle && (
            <div className="h-8 inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/40 px-2.5 rounded-xl text-[11px] font-extrabold text-emerald-700 dark:text-emerald-300 shadow-2xs whitespace-nowrap">
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

        {/* Dreapta: Alertă mutată în linie cu numărul de înmatriculare */}
        <div className="flex-1 min-w-0">
          <AlertsBanner
            vehicles={activeVehicles || selectedVehicles}
            onSelectVehicle={(vId) => {
              onToggleVehicle && onToggleVehicle(vId);
            }}
            onOpenAlertsTab={onOpenAlertsTab}
            lang={lang}
            inline={true}
          />
        </div>
      </div>

      {/* FULL-SCREEN VEHICLE SELECTION MODAL WITH CHECKBOXES (BIFE) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-100 dark:bg-[#090d16] flex flex-col animate-in fade-in duration-200">
          
          {/* HEADER CU 2 RÂNDURI (Titlu complet vizibil, fără trunchiere + butoane clare) */}
          <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-3.5 py-2.5 shadow-2xs">
            <div className="max-w-2xl mx-auto space-y-2">
              {/* RÂNDUL 1: Buton Înapoi + Titlu pe 2 rânduri + Buton Închidere */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 -ml-1 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title={lang === 'en' ? "Back" : "Înapoi"}
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="min-w-0">
                    <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-tight">
                      {lang === 'en' ? "Vehicles Fleet" : "Parc Autovehicule"}
                    </h2>
                    <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 leading-tight mt-0.5">
                      {lang === 'en' 
                        ? `${selectedVehicleIds.length} of ${vehicles.length} vehicles selected for calculations` 
                        : `${selectedVehicleIds.length} din ${vehicles.length} mașini selectate în calcule`}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
                  title={lang === 'en' ? "Close" : "Închide"}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* RÂNDUL 2: Filtre Rapide (Toate / Niciuna) + Butonul „+ Vehicul Nou” */}
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => onSelectAllVehicles && onSelectAllVehicles(true)}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 text-xs font-bold transition-colors cursor-pointer"
                  >
                    {lang === 'en' ? "All" : "Toate"}
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectAllVehicles && onSelectAllVehicles(false)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs font-medium transition-colors cursor-pointer"
                  >
                    {lang === 'en' ? "None" : "Niciuna"}
                  </button>
                </div>

                {/* Butonul + Vehicul Nou (Păstrat și redenumit conform cerinței utilizatorului) */}
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onOpenAddVehicle();
                  }}
                  className="flex items-center gap-1.5 text-xs font-black bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 px-3 py-1.5 rounded-xl shadow-xs transition-all transform active:scale-95 shrink-0 cursor-pointer"
                  title={lang === 'en' ? "Add new vehicle" : "Adaugă vehicul nou"}
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>{lang === 'en' ? "New Vehicle" : "Vehicul Nou"}</span>
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
                      <span className="whitespace-nowrap shrink-0 inline-flex items-center bg-slate-100 dark:bg-slate-800 border border-slate-700 dark:border-slate-500 rounded-lg px-2 py-0.5 font-mono text-xs font-black text-slate-900 dark:text-slate-100 shadow-2xs">
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

                      {/* Buton Ștergere Directă Autovehicul (cu confirmare) */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setVehicleToDelete(veh);
                        }}
                        className="p-1.5 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-400 hover:text-rose-600 dark:bg-slate-800 dark:hover:bg-rose-950/50 dark:hover:text-rose-400 transition-colors cursor-pointer"
                        title={lang === 'en' ? "Delete vehicle" : "Șterge vehicul"}
                      >
                        <Trash2 className="w-4 h-4" />
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

      {/* DIALOG DE CONFIRMARE ȘTERGERE AUTOVEHICUL */}
      {vehicleToDelete && (
        <div 
          className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-sm w-full p-5 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-3.5">
              <Trash2 className="w-6 h-6 stroke-[2.2]" />
            </div>
            <h3 className="text-base font-black text-slate-900 dark:text-white text-center">
              {lang === 'en' ? "Delete Vehicle?" : "Ștergeți vehiculul?"}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 text-center mt-2 leading-relaxed">
              {lang === 'en' ? (
                <>Are you sure you want to delete vehicle <strong className="text-slate-900 dark:text-white font-mono">[{vehicleToDelete.plate}]</strong> ({vehicleToDelete.makeModel})? All associated records will be permanently removed.</>
              ) : (
                <>Sigur doriți să ștergeți autovehiculul <strong className="text-slate-900 dark:text-white font-mono">[{vehicleToDelete.plate}]</strong> ({vehicleToDelete.makeModel})? Toate alimentările și datele asociate vor fi șterse definitiv.</>
              )}
            </p>
            <div className="grid grid-cols-2 gap-2.5 mt-5">
              <button
                type="button"
                onClick={() => setVehicleToDelete(null)}
                className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                {lang === 'en' ? "Cancel" : "Anulează"}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeleteVehicle) {
                    onDeleteVehicle(vehicleToDelete.id);
                  }
                  setVehicleToDelete(null);
                }}
                className="py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-md shadow-rose-600/30 transition-all active:scale-95 cursor-pointer"
              >
                {lang === 'en' ? "Delete" : "Da, Șterge"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
