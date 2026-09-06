import React, { useState } from 'react';
import { 
  Gauge, 
  ArrowLeft, 
  TrendingUp, 
  Fuel, 
  Wrench, 
  Droplet, 
  ShieldCheck, 
  Disc, 
  Car, 
  Trophy, 
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Info
} from 'lucide-react';
import { translations } from '../i18n';

export const CostPerKmView = ({
  vehicles = [],
  records = [],
  selectedVehicle = null,
  onNavigateBack,
  onSelectVehicle,
  lang = 'ro'
}) => {
  const t = translations[lang] || translations.ro;
  const [timeFilter, setTimeFilter] = useState('all');

  // Filter records by time period if needed
  const now = new Date();
  const filteredRecords = records.filter(r => {
    if (timeFilter === 'all') return true;
    const rDate = new Date(r.date);
    if (timeFilter === 'year') {
      return rDate.getFullYear() === now.getFullYear();
    }
    if (timeFilter === 'month') {
      const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
      return rDate >= thirtyDaysAgo;
    }
    return true;
  });

  // Calculate specific Cost/Km metrics per vehicle
  const targetVehicles = selectedVehicle ? [selectedVehicle] : vehicles;

  const vehicleStats = targetVehicles.map(veh => {
    const vehRecords = filteredRecords.filter(r => r.vehicleId === veh.id);
    
    // Total expenses by category
    let totalCost = 0;
    let fuelCost = 0;
    let repairCost = 0;
    let serviceCost = 0;
    let fixedCost = 0; // Insurance, ITP, Fine, Rovinieta
    let tiresCost = 0;

    vehRecords.forEach(r => {
      const amt = Number(r.amount) || 0;
      totalCost += amt;
      if (r.category === 'fuel') fuelCost += amt;
      else if (r.category === 'repair') repairCost += amt;
      else if (r.category === 'service') serviceCost += amt;
      else if (r.category === 'tires') tiresCost += amt;
      else fixedCost += amt; // insurance, itp, fine, etc.
    });

    // Distance calculation
    const kmRecords = vehRecords
      .filter(r => r.km && Number(r.km) > 0)
      .map(r => Number(r.km))
      .sort((a, b) => a - b);

    let distanceDriven = 0;
    if (kmRecords.length >= 2) {
      distanceDriven = kmRecords[kmRecords.length - 1] - kmRecords[0];
    } else if (veh.currentKm && veh.currentKm > 0) {
      distanceDriven = veh.currentKm;
    }

    // Cost per Km metrics
    const hasKm = distanceDriven > 0;
    const costPerKm = hasKm ? Number((totalCost / distanceDriven).toFixed(2)) : null;
    const fuelPerKm = hasKm ? Number((fuelCost / distanceDriven).toFixed(2)) : null;
    const repairPerKm = hasKm ? Number((repairCost / distanceDriven).toFixed(2)) : null;
    const servicePerKm = hasKm ? Number((serviceCost / distanceDriven).toFixed(2)) : null;
    const fixedPerKm = hasKm ? Number((fixedCost / distanceDriven).toFixed(2)) : null;
    const tiresPerKm = hasKm ? Number((tiresCost / distanceDriven).toFixed(2)) : null;

    return {
      vehicle: veh,
      totalCost,
      distanceDriven,
      costPerKm,
      fuelCost,
      fuelPerKm,
      repairCost,
      repairPerKm,
      serviceCost,
      servicePerKm,
      fixedCost,
      fixedPerKm,
      tiresCost,
      tiresPerKm,
      recordsCount: vehRecords.length
    };
  });

  // Sort by Cost/Km (ascending: lowest cost per km = most efficient first)
  const rankedStats = [...vehicleStats].sort((a, b) => {
    if (a.costPerKm === null) return 1;
    if (b.costPerKm === null) return -1;
    return a.costPerKm - b.costPerKm;
  });

  // Fleet wide totals
  const totalFleetCost = vehicleStats.reduce((sum, s) => sum + s.totalCost, 0);
  const totalFleetKm = vehicleStats.reduce((sum, s) => sum + s.distanceDriven, 0);
  const totalFleetFuelCost = vehicleStats.reduce((sum, s) => sum + s.fuelCost, 0);
  const totalFleetRepairCost = vehicleStats.reduce((sum, s) => sum + (s.repairCost + s.serviceCost), 0);
  
  const fleetAvgCostPerKm = totalFleetKm > 0 ? Number((totalFleetCost / totalFleetKm).toFixed(2)) : null;
  const fleetFuelPerKm = totalFleetKm > 0 ? Number((totalFleetFuelCost / totalFleetKm).toFixed(2)) : null;
  const fleetMaintPerKm = totalFleetKm > 0 ? Number((totalFleetRepairCost / totalFleetKm).toFixed(2)) : null;

  const bestVehicle = rankedStats.find(s => s.costPerKm !== null);
  const mostExpensiveVehicle = [...rankedStats].reverse().find(s => s.costPerKm !== null);

  return (
    <div className="space-y-4">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between gap-2 px-1">
        <button
          onClick={onNavigateBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl shadow-2xs transition-colors shrink-0 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{lang === 'en' ? "Back" : "Înapoi"}</span>
        </button>

        {/* Time period filters */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
          <button
            onClick={() => setTimeFilter('all')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
              timeFilter === 'all'
                ? 'bg-purple-600 text-white shadow-xs font-black'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {lang === 'en' ? "All Time" : "Tot Istoricul"}
          </button>
          <button
            onClick={() => setTimeFilter('year')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
              timeFilter === 'year'
                ? 'bg-purple-600 text-white shadow-xs font-black'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {lang === 'en' ? "This Year" : "Anul Curent"}
          </button>
        </div>
      </div>

      {/* Main Banner Gradient (Purple / Indigo) */}
      <div className="bg-gradient-to-br from-purple-700 via-indigo-700 to-slate-900 rounded-3xl p-4 sm:p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-3 -bottom-4 opacity-10 pointer-events-none">
          <Gauge className="w-36 h-36" />
        </div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md px-2.5 py-1 rounded-xl text-xs font-bold mb-2">
            <Gauge className="w-3.5 h-3.5" />
            <span>
              {selectedVehicle 
                ? `${selectedVehicle.plate} • ${selectedVehicle.makeModel}` 
                : (lang === 'en' ? "Fleet Efficiency & Cost / Km" : "Eficiență Flotă & Cost / Km")}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            {lang === 'en' ? "Cost / Kilometer Analysis" : "Analiză Detaliată Cost / Kilometru"}
          </h2>
          <p className="text-xs text-purple-100 mt-1 max-w-lg">
            {lang === 'en'
              ? "Accurate calculation of true operational cost per kilometer driven, split by fuel, maintenance, parts, and fixed fees."
              : "Calculul exact al costului real de exploatare per kilometru parcurs, defalcat pe carburant, mecanică, revizii și taxe."}
          </p>

          {/* KPI Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-4 border-t border-white/15">
            <div className="bg-white/10 backdrop-blur-md p-2.5 rounded-2xl">
              <span className="text-[10px] text-purple-200 font-semibold block">
                {lang === 'en' ? "Fleet Cost / Km" : "Cost Total / Km"}
              </span>
              <span className="text-base sm:text-xl font-black">
                {fleetAvgCostPerKm ? `${fleetAvgCostPerKm} RON` : "—"}
              </span>
              <span className="text-[9.5px] text-purple-300 block">
                {fleetAvgCostPerKm ? "/ kilometru parcurs" : "Date insuficiente"}
              </span>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-2.5 rounded-2xl">
              <span className="text-[10px] text-purple-200 font-semibold block">
                {lang === 'en' ? "Fuel Cost / Km" : "Carburant / Km"}
              </span>
              <span className="text-base sm:text-xl font-black">
                {fleetFuelPerKm ? `${fleetFuelPerKm} RON` : "—"}
              </span>
              <span className="text-[9.5px] text-emerald-300 block">
                {fleetAvgCostPerKm && fleetFuelPerKm ? `${Math.round((fleetFuelPerKm / fleetAvgCostPerKm) * 100)}% din cost total` : "Carburant"}
              </span>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-2.5 rounded-2xl">
              <span className="text-[10px] text-purple-200 font-semibold block">
                {lang === 'en' ? "Service & Parts / Km" : "Mecanică & Revizii / Km"}
              </span>
              <span className="text-base sm:text-xl font-black">
                {fleetMaintPerKm ? `${fleetMaintPerKm} RON` : "—"}
              </span>
              <span className="text-[9.5px] text-amber-300 block">
                {fleetAvgCostPerKm && fleetMaintPerKm ? `${Math.round((fleetMaintPerKm / fleetAvgCostPerKm) * 100)}% din cost total` : "Întreținere"}
              </span>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-2.5 rounded-2xl">
              <span className="text-[10px] text-purple-200 font-semibold block">
                {lang === 'en' ? "Total Km Driven" : "Kilometri Parcurși"}
              </span>
              <span className="text-base sm:text-xl font-black">
                {totalFleetKm.toLocaleString('ro-RO')} <span className="text-xs font-bold">km</span>
              </span>
              <span className="text-[9.5px] text-purple-300 block">
                Total distanță flotă
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Fleet Efficiency Insights (Best & Worst) */}
      {!selectedVehicle && rankedStats.length > 1 && bestVehicle && mostExpensiveVehicle && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Most Efficient */}
          <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-2xl p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-lg shrink-0">
              🏆
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">
                Cea Mai Economică Mașină
              </span>
              <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
                {bestVehicle.vehicle.plate} • {bestVehicle.vehicle.makeModel}
              </h4>
              <p className="text-[11px] font-mono font-black text-emerald-600 dark:text-emerald-400">
                {bestVehicle.costPerKm} RON / km <span className="text-[10px] font-normal text-slate-500">({bestVehicle.distanceDriven.toLocaleString('ro-RO')} km)</span>
              </p>
            </div>
          </div>

          {/* Highest Cost */}
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center text-lg shrink-0">
              ⚠️
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 block">
                Cel Mai Mare Cost / Km
              </span>
              <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
                {mostExpensiveVehicle.vehicle.plate} • {mostExpensiveVehicle.vehicle.makeModel}
              </h4>
              <p className="text-[11px] font-mono font-black text-amber-700 dark:text-amber-400">
                {mostExpensiveVehicle.costPerKm} RON / km <span className="text-[10px] font-normal text-slate-500">({mostExpensiveVehicle.distanceDriven.toLocaleString('ro-RO')} km)</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* List of Vehicles with Specific Cost/Km Breakdown */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
              {lang === 'en' ? "Vehicles Cost / Km Ranking" : "Clasament Cost / Km per Vehicul"}
            </h3>
            <span className="text-xs font-bold text-slate-400">({rankedStats.length})</span>
          </div>
        </div>

        {rankedStats.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            {lang === 'en' ? "No vehicles found." : "Nu există vehicule înregistrate."}
          </div>
        ) : (
          <div className="space-y-3">
            {rankedStats.map((stat, idx) => {
              const v = stat.vehicle;
              const hasRate = stat.costPerKm !== null;

              // Color coding based on cost per km rate
              let badgeColor = "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30";
              if (stat.costPerKm > 1.5) {
                badgeColor = "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30";
              } else if (stat.costPerKm > 0.9) {
                badgeColor = "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30";
              }

              return (
                <div
                  key={v.id}
                  className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-3.5 hover:border-purple-400/50 transition-colors shadow-2xs"
                >
                  {/* RÂNDUL 1: Mașină + Model | Cost Total / Km mare și clar */}
                  <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-200/50 dark:border-slate-800/50">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="whitespace-nowrap shrink-0 inline-flex items-center bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md px-1.5 py-0.5 text-[11px] font-mono font-black text-slate-800 dark:text-slate-100 shadow-2xs">
                        <span className="text-[9px] text-blue-500 font-bold mr-1">RO</span>
                        {v.plate}
                      </span>
                      <div className="min-w-0">
                        <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">
                          {v.makeModel}
                        </h4>
                        {v.driver && (
                          <span className="text-[10.5px] text-slate-500 dark:text-slate-400 block truncate">
                            👤 {v.driver}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Cost / Km Badge */}
                    <div className="text-right shrink-0">
                      {hasRate ? (
                        <span className={`inline-flex items-center gap-1 font-mono font-black text-xs sm:text-sm px-2.5 py-1 rounded-xl border shadow-2xs ${badgeColor}`}>
                          <Gauge className="w-3.5 h-3.5" />
                          <span>{stat.costPerKm} RON/km</span>
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-slate-400 italic">
                          Fără km suficienți
                        </span>
                      )}
                    </div>
                  </div>

                  {/* RÂNDUL 2: Defalcare detaliată per km pe categorii */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 my-2">
                    {/* Carburant / km */}
                    <div className="bg-white dark:bg-slate-900/90 border border-slate-200/60 dark:border-slate-800/60 p-2 rounded-xl">
                      <span className="text-[9.5px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Fuel className="w-2.5 h-2.5 text-blue-500" />
                        <span>Carburant / km</span>
                      </span>
                      <span className="font-mono font-black text-xs text-blue-600 dark:text-blue-400 block mt-0.5">
                        {stat.fuelPerKm ? `${stat.fuelPerKm} lei/km` : '—'}
                      </span>
                      <span className="text-[9px] text-slate-400 block">
                        Total: {stat.fuelCost.toLocaleString('ro-RO')} lei
                      </span>
                    </div>

                    {/* Reparații / km */}
                    <div className="bg-white dark:bg-slate-900/90 border border-slate-200/60 dark:border-slate-800/60 p-2 rounded-xl">
                      <span className="text-[9.5px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Wrench className="w-2.5 h-2.5 text-rose-500" />
                        <span>Reparații / km</span>
                      </span>
                      <span className="font-mono font-black text-xs text-rose-600 dark:text-rose-400 block mt-0.5">
                        {stat.repairPerKm ? `${stat.repairPerKm} lei/km` : '0 lei/km'}
                      </span>
                      <span className="text-[9px] text-slate-400 block">
                        Total: {stat.repairCost.toLocaleString('ro-RO')} lei
                      </span>
                    </div>

                    {/* Revizii / km */}
                    <div className="bg-white dark:bg-slate-900/90 border border-slate-200/60 dark:border-slate-800/60 p-2 rounded-xl">
                      <span className="text-[9.5px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Droplet className="w-2.5 h-2.5 text-amber-500" />
                        <span>Revizii / km</span>
                      </span>
                      <span className="font-mono font-black text-xs text-amber-600 dark:text-amber-400 block mt-0.5">
                        {stat.servicePerKm ? `${stat.servicePerKm} lei/km` : '0 lei/km'}
                      </span>
                      <span className="text-[9px] text-slate-400 block">
                        Total: {stat.serviceCost.toLocaleString('ro-RO')} lei
                      </span>
                    </div>

                    {/* Taxe & Acte / km */}
                    <div className="bg-white dark:bg-slate-900/90 border border-slate-200/60 dark:border-slate-800/60 p-2 rounded-xl">
                      <span className="text-[9.5px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <ShieldCheck className="w-2.5 h-2.5 text-emerald-500" />
                        <span>Taxe & RCA / km</span>
                      </span>
                      <span className="font-mono font-black text-xs text-emerald-600 dark:text-emerald-400 block mt-0.5">
                        {stat.fixedPerKm ? `${stat.fixedPerKm} lei/km` : '0 lei/km'}
                      </span>
                      <span className="text-[9px] text-slate-400 block">
                        Total: {stat.fixedCost.toLocaleString('ro-RO')} lei
                      </span>
                    </div>
                  </div>

                  {/* RÂNDUL 3: Totaluri absolute (Km parcurși • Total cheltuit • Înregistrări) */}
                  <div className="flex items-center justify-between text-[10.5px] text-slate-500 dark:text-slate-400 pt-1 flex-wrap gap-1">
                    <span className="font-semibold">
                      🛣️ Distanță: <strong className="text-slate-800 dark:text-slate-200">{stat.distanceDriven.toLocaleString('ro-RO')} km</strong>
                    </span>
                    <span>
                      💰 Cheltuieli totale: <strong className="text-slate-800 dark:text-slate-200">{stat.totalCost.toLocaleString('ro-RO')} RON</strong>
                    </span>
                    <span>
                      📝 <strong className="text-slate-800 dark:text-slate-200">{stat.recordsCount}</strong> înregistrări
                    </span>
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
