import React from 'react';
import { ArrowLeft, Fuel, Plus, TrendingUp, DollarSign, Gauge, Calendar, Trash2, Edit3, CheckCircle2, AlertCircle, Clock, User } from 'lucide-react';
import { translations } from '../i18n';
import { calculateVehicleConsumption } from '../utils/calculations';

export const FuelConsumptionView = ({
  vehicles = [],
  records = [],
  selectedVehicle = null,
  onNavigateBack,
  onAddFueling,
  onEditRecord,
  onDeleteRecord,
  lang = 'ro'
}) => {
  const t = translations[lang] || translations.ro;

  // Filter only fuel records
  const fuelRecords = records
    .filter(r => r.category === 'fuel')
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  // Compute fuel statistics
  const totalLiters = fuelRecords.reduce((sum, r) => sum + (Number(r.details?.liters) || 0), 0);
  const totalFuelCost = fuelRecords.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
  const avgPricePerLiter = totalLiters > 0 ? (totalFuelCost / totalLiters).toFixed(2) : null;

  // Consumption calculation
  const consumptionStats = selectedVehicle
    ? calculateVehicleConsumption(fuelRecords.filter(r => r.vehicleId === selectedVehicle.id))
    : calculateVehicleConsumption(fuelRecords);

  const avgConsumption = consumptionStats.avgLitersPer100Km;

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      
      {/* Top Bar with Back and Add buttons */}
      <div className="flex items-center justify-between gap-2 px-1">
        <button
          onClick={onNavigateBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl shadow-2xs transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t.dashboard || (lang === 'en' ? "Main Dashboard" : "Panou Principal")}</span>
        </button>

        {onAddFueling && (
          <button
            onClick={onAddFueling}
            className="inline-flex items-center gap-1.5 text-xs font-black text-slate-950 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 px-3 py-1.5 rounded-xl shadow-md shadow-emerald-500/25 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>{lang === 'en' ? "Fueling" : "Alimentare"}</span>
          </button>
        )}
      </div>

      {/* Header Banner */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-4 sm:p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-3 -bottom-4 opacity-10 pointer-events-none">
          <Fuel className="w-36 h-36" />
        </div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md px-2.5 py-1 rounded-xl text-xs font-bold mb-2">
            <Fuel className="w-3.5 h-3.5" />
            <span>{selectedVehicle ? `${selectedVehicle.plate} • ${selectedVehicle.makeModel}` : (lang === 'en' ? "Entire Fleet" : "Toată Flota")}</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            {t.fuelConsumption || (lang === 'en' ? "Fuel & Consumption" : "Carburant & Consum")}
          </h2>
          <p className="text-xs text-blue-100 mt-1 max-w-md">
            {lang === 'en' 
              ? "Detailed logs, full-tank consumption calculations, and average fuel costs." 
              : "Istoric detaliat alimentări, calcul consum din plinuri și cost mediu carburant."}
          </p>

          {/* KPI Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-4 border-t border-white/15">
            <div className="bg-white/10 backdrop-blur-md p-2.5 rounded-2xl">
              <span className="text-[10px] text-blue-100 font-semibold block">
                {lang === 'en' ? "Avg Consumption" : "Consum Mediu"}
              </span>
              <span className="text-base sm:text-xl font-black">
                {avgConsumption ? `${avgConsumption} L/100` : "—"}
              </span>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-2.5 rounded-2xl">
              <span className="text-[10px] text-blue-100 font-semibold block">
                {lang === 'en' ? "Total Liters" : "Total Litri"}
              </span>
              <span className="text-base sm:text-xl font-black">
                {totalLiters.toLocaleString('ro-RO')} <span className="text-xs font-bold">L</span>
              </span>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-2.5 rounded-2xl">
              <span className="text-[10px] text-blue-100 font-semibold block">
                {lang === 'en' ? "Total Fuel Cost" : "Cost Total"}
              </span>
              <span className="text-base sm:text-xl font-black">
                {totalFuelCost.toLocaleString('ro-RO')} <span className="text-xs font-bold">RON</span>
              </span>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-2.5 rounded-2xl">
              <span className="text-[10px] text-blue-100 font-semibold block">
                {lang === 'en' ? "Avg Price / Liter" : "Preț Mediu / L"}
              </span>
              <span className="text-base sm:text-xl font-black">
                {avgPricePerLiter ? `${avgPricePerLiter} RON` : "—"}
              </span>
            </div>
          </div>

          {/* Bi-Fuel (GPL + Benzină) Breakdown Banner */}
          {consumptionStats.isBiFuel && (
            <div className="mt-3 bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/20 text-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="font-extrabold uppercase text-[10px] tracking-wider text-emerald-300 flex items-center gap-1">
                  <span>🟢 GPL + ⛽ Benzină (Sistem Mixt)</span>
                </span>
                <span className="font-mono font-bold text-white text-[11px]">
                  Cost Total: {consumptionStats.costPerKm ? `${consumptionStats.costPerKm} lei/km` : '—'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-white/10 rounded-xl p-2">
                  <span className="text-[10px] text-blue-100 block">🟢 Consum GPL</span>
                  <span className="font-black text-sm text-white">
                    {consumptionStats.gplAvgL100 ? `${consumptionStats.gplAvgL100} L/100` : `${consumptionStats.gplLiters} L`}
                  </span>
                  <span className="text-[10px] text-emerald-300 block font-mono">
                    {consumptionStats.gplCostPerKm ? `${consumptionStats.gplCostPerKm} lei/km` : `${consumptionStats.gplCost} lei`}
                  </span>
                </div>
                <div className="bg-white/10 rounded-xl p-2">
                  <span className="text-[10px] text-amber-200 block">⛽ Benzină (Rulaj + Porniri)</span>
                  <span className="font-black text-sm text-white">
                    {consumptionStats.petrolAvgL100 ? `${consumptionStats.petrolAvgL100} L/100` : `${consumptionStats.petrolLiters} L`}
                  </span>
                  <span className="text-[10px] text-amber-300 block font-mono">
                    {consumptionStats.petrolCostPerKm ? `${consumptionStats.petrolCostPerKm} lei/km` : `${consumptionStats.petrolCost} lei`}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Helpful Hint if not enough fuelings */}
      {!avgConsumption && (
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-2xl p-3 text-xs text-blue-800 dark:text-blue-300 flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-blue-500" />
          <span>
            {lang === 'en'
              ? "Tip: Check «Full tank» on at least two consecutive fuelings with odometer (km) to calculate exact consumption."
              : "Sfat: Bifează «Plin complet» la cel puțin două alimentări consecutive cu kilometrajul completat pentru a calcula consumul mediu exact."}
          </span>
        </div>
      )}

      {/* Fueling History Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Fuel className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
              {t.fuelHistory || (lang === 'en' ? "Fueling History" : "Istoric Alimentări")}
            </h3>
            <span className="text-xs font-bold text-slate-400">({fuelRecords.length})</span>
          </div>
        </div>

        {fuelRecords.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            {lang === 'en' ? "No fueling records found." : "Nu există nicio alimentare înregistrată încă."}
          </div>
        ) : (
          <div className="space-y-2.5">
            {fuelRecords.map((rec) => {
              const veh = vehicles.find(v => v.id === rec.vehicleId);
              const liters = Number(rec.details?.liters) || 0;
              const pricePerL = Number(rec.details?.pricePerLiter) || (liters > 0 ? (rec.amount / liters).toFixed(2) : null);
              const isFull = rec.details?.fullTank;
              const recTime = rec.time || rec.details?.time || (rec.id && rec.id.startsWith('rec-') && !isNaN(Number(rec.id.replace('rec-', ''))) ? new Date(Number(rec.id.replace('rec-', ''))).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' }) : null);

              return (
                <div
                  key={rec.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-3.5 space-y-2.5 hover:border-blue-400/40 transition-all shadow-xs"
                >
                  {/* RÂNDUL 1: Antet Mașină + Dată/Oră (Stânga) | Butoane Acțiuni (Dreapta) */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 min-w-0">
                      {veh && (
                        <div>
                          <span className="inline-flex items-center bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 px-2 py-0.5 rounded-md text-[11px] font-mono font-black shadow-xs">
                            <span className="text-[9px] text-blue-400 dark:text-blue-600 font-bold mr-1 leading-none">RO</span>
                            <span className="leading-none">{veh.plate}</span>
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{rec.date}</span>
                        {recTime && (
                          <>
                            <span className="text-slate-300 dark:text-slate-700">•</span>
                            <Clock className="w-3 h-3 text-blue-500 shrink-0" />
                            <span className="font-mono">{recTime}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Acțiuni (Edit / Delete) */}
                    <div className="flex items-center gap-0.5 shrink-0 pt-0.5">
                      {onEditRecord && (
                        <button
                          onClick={() => onEditRecord(rec)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Editează"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {onDeleteRecord && (
                        <button
                          onClick={() => {
                            if (window.confirm(t.confirmDelete || "Ștergi această înregistrare?")) {
                              onDeleteRecord(rec.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Șterge"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* RÂNDUL 2: Rânduri Orizontale Unul Sub Altul (Cost Total, Cantitate, Kilometraj) */}
                  <div className="bg-slate-50 dark:bg-slate-950/60 rounded-xl px-3 py-1.5 border border-slate-200/60 dark:border-slate-800/60 divide-y divide-slate-200/60 dark:border-slate-800/60">
                    {/* 1. Cost Total */}
                    <div className="flex items-center justify-between py-1.5">
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>{lang === 'en' ? "Total Cost" : "Cost Total"}</span>
                      </span>
                      <span className="font-mono font-black text-sm text-emerald-600 dark:text-emerald-400">
                        {Number(rec.amount).toLocaleString('ro-RO')} RON
                      </span>
                    </div>

                    {/* 2. Cantitate */}
                    <div className="flex items-center justify-between py-1.5">
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <Fuel className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span>{lang === 'en' ? "Quantity" : "Cantitate"}</span>
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-xs sm:text-sm text-blue-600 dark:text-blue-400">
                          {liters > 0 ? `${liters} L` : "—"}
                        </span>
                        {pricePerL && (
                          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                            ({pricePerL} RON/L)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 3. Kilometraj */}
                    <div className="flex items-center justify-between py-1.5">
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <Gauge className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                        <span>{lang === 'en' ? "Odometer" : "Kilometraj"}</span>
                      </span>
                      <span className="font-mono font-bold text-xs sm:text-sm text-slate-700 dark:text-slate-200">
                        {rec.km ? `${Number(rec.km).toLocaleString('ro-RO')} km` : "—"}
                      </span>
                    </div>
                  </div>

                  {/* RÂNDUL 3: Badges Combustibil + Rezervor + Șofer + Note */}
                  <div className="flex items-center justify-between gap-1.5 pt-0.5 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {rec.details?.fuelType === 'gpl' ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-lg text-[10.5px] font-bold">
                          🟢 GPL
                        </span>
                      ) : rec.details?.fuelType === 'petrol' ? (
                        <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-lg text-[10.5px] font-bold">
                          ⛽ Benzină
                        </span>
                      ) : rec.details?.fuelType === 'diesel' ? (
                        <span className="inline-flex items-center gap-1 bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-lg text-[10.5px] font-bold">
                          ⛽ Diesel
                        </span>
                      ) : null}

                      {isFull ? (
                        <span className="inline-flex items-center gap-1 bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-lg text-[10.5px] font-bold">
                          <CheckCircle2 className="w-3 h-3 text-blue-500" />
                          {lang === 'en' ? "Full tank" : "Plin complet"}
                        </span>
                      ) : (
                        <span className="inline-flex items-center bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-lg text-[10px] font-medium">
                          {lang === 'en' ? "Partial" : "Parțial"}
                        </span>
                      )}

                      {veh?.driver && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 ml-1">
                          <User className="w-3 h-3 text-slate-400" />
                          <span>{veh.driver}</span>
                        </span>
                      )}
                    </div>

                    {rec.notes && (
                      <div className="w-full text-[11px] text-slate-500 dark:text-slate-400 italic bg-slate-100/60 dark:bg-slate-900/60 px-2.5 py-1 rounded-lg border border-slate-200/40 dark:border-slate-800/40 truncate">
                        💬 "{rec.notes}"
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
