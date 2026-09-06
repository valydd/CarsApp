import React, { useState } from 'react';
import { 
  Trophy, 
  Wrench, 
  TrendingUp, 
  Filter, 
  PieChart as PieIcon, 
  Car, 
  Fuel, 
  Shield, 
  CircleDot,
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import { translations } from '../i18n';
import { calculateCostRankings } from '../utils/calculations';

export const CostRankings = ({ vehicles, records, onSelectVehicle, selectedVehicleId, onNavigateTab, lang }) => {
  const [filterCategory, setFilterCategory] = useState('all');
  const [timePeriod, setTimePeriod] = useState('all');
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const t = translations[lang];

  const activeVeh = selectedVehicleId ? vehicles.find(v => v.id === selectedVehicleId) : null;
  const targetVehicles = selectedVehicleId ? (activeVeh ? [activeVeh] : vehicles) : vehicles;
  const targetRecords = selectedVehicleId ? records.filter(r => r.vehicleId === selectedVehicleId) : records;

  const { rankings, grandTotal, grandRepairTotal, categoryTotals } = calculateCostRankings(
    targetVehicles,
    targetRecords,
    filterCategory,
    timePeriod
  );

  const getRankBadge = (index) => {
    if (index === 0) {
      return (
        <span className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-200 text-slate-950 font-black text-xs flex items-center justify-center shadow-md shadow-amber-500/30">
          🥇
        </span>
      );
    }
    if (index === 1) {
      return (
        <span className="w-7 h-7 rounded-full bg-gradient-to-tr from-slate-300 to-slate-100 text-slate-950 font-black text-xs flex items-center justify-center shadow-md shadow-slate-300/30 border border-slate-300">
          🥈
        </span>
      );
    }
    if (index === 2) {
      return (
        <span className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-700 to-amber-500 text-white font-black text-xs flex items-center justify-center shadow-md shadow-amber-700/30">
          🥉
        </span>
      );
    }
    return (
      <span className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-bold text-xs flex items-center justify-center">
        #{index + 1}
      </span>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-200">
      
      {/* 1. Header & KPI Summary Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-sm space-y-3.5">
        
        {/* Top Line: Title + Vehicle Badge + Fleet Switcher */}
        <div className="flex items-start sm:items-center justify-between gap-2.5 flex-col sm:flex-row">
          <div className="flex items-center gap-2.5 min-w-0 w-full sm:w-auto">
            <div className="p-2 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  {selectedVehicleId && activeVeh ? `Analiză Costuri: ${activeVeh.plate}` : "Clasament & Analiză Costuri"}
                </h2>
                {selectedVehicleId && activeVeh && (
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    ({activeVeh.makeModel})
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                {selectedVehicleId && activeVeh 
                  ? `Șofer: ${activeVeh.driver || "Neatribuit"} • ${activeVeh.currentKm ? `${activeVeh.currentKm.toLocaleString()} km` : ''}` 
                  : `${targetVehicles.length} vehicule în analiză flotă`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 self-stretch sm:self-auto justify-end shrink-0">
            {selectedVehicleId && activeVeh && (
              <button
                onClick={() => onSelectVehicle(null)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[11px] font-black border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 transition-all cursor-pointer shrink-0"
              >
                <span>👥 Vezi Flota</span>
              </button>
            )}

            {/* Time Filter */}
            <select
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value)}
              className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] sm:text-xs font-bold text-slate-700 dark:text-slate-300 rounded-xl px-2 py-1.5 outline-hidden focus:ring-2 focus:ring-emerald-500/30 cursor-pointer shrink-0"
            >
              <option value="all">📅 {t.allTime}</option>
              <option value="thisMonth">📅 {t.thisMonth}</option>
              <option value="last3Months">📅 {t.last3Months}</option>
              <option value="thisYear">📅 {t.thisYear}</option>
            </select>
          </div>
        </div>

        {/* Big Total KPI Row */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-baseline justify-between gap-3">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
              {selectedVehicleId && activeVeh ? `Total Cheltuieli ${activeVeh.plate}` : "Total Cheltuieli Flotă"}
            </span>
            <div className="text-2xl sm:text-3xl font-mono font-black text-slate-900 dark:text-white tracking-tight flex items-baseline gap-1.5 mt-0.5">
              <span>{grandTotal.toLocaleString('ro-RO')}</span>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">RON</span>
            </div>
          </div>

          {filterCategory === 'repair' && (
            <div className="text-right">
              <span className="text-[10px] font-black uppercase tracking-wider text-rose-500 block">
                Total Reparații
              </span>
              <div className="text-lg sm:text-xl font-mono font-black text-rose-600 dark:text-rose-400">
                {grandRepairTotal.toLocaleString('ro-RO')} RON
              </div>
            </div>
          )}
        </div>

        {/* Category Filter Pills (Horizontal Scrollable) */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          {[
            { key: 'all', label: '📊 Toate', activeClass: 'bg-emerald-500 text-slate-950 font-black' },
            { key: 'repair', label: '🔧 Reparații', activeClass: 'bg-rose-500 text-white font-black' },
            { key: 'service', label: '🛢️ Revizii', activeClass: 'bg-amber-500 text-slate-950 font-black' },
            { key: 'tires', label: '🛞 Anvelope', activeClass: 'bg-cyan-500 text-slate-950 font-black' },
            { key: 'fuel', label: '⛽ Carburant', activeClass: 'bg-sky-500 text-white font-black' },
            { key: 'insurance', label: '📋 Asigurări', activeClass: 'bg-teal-500 text-white font-black' },
          ].map(btn => {
            const isActive = filterCategory === btn.key;
            return (
              <button
                key={btn.key}
                onClick={() => setFilterCategory(btn.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? `${btn.activeClass} shadow-xs`
                    : 'bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800/80'
                }`}
              >
                {btn.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Top 3 Spender & Ranking List + Donut Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        
        {/* Left 2 Cols: The Rankings List */}
        <div className="lg:col-span-2 space-y-3">
          {rankings.length === 0 ? (
            <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center text-slate-500 dark:text-slate-400 shadow-sm">
              Nu există înregistrări pentru filtrele selectate.
            </div>
          ) : (
            rankings.map((item, index) => {
              const { vehicle, totalCost, percentage, repairCost, fuelCost, serviceCost, tiresCost, insuranceCost } = item;
              const isTopSpender = index === 0 && totalCost > 0 && rankings.length > 1;

              return (
                <div
                  key={vehicle.id}
                  onClick={() => onSelectVehicle(vehicle.id)}
                  className={`bg-white dark:bg-slate-900/80 border rounded-2xl p-3.5 sm:p-4 transition-all hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer shadow-xs space-y-2.5 ${
                    isTopSpender
                      ? 'border-amber-400 dark:border-amber-500/50 shadow-md shadow-amber-500/5 ring-1 ring-amber-400/20 dark:ring-amber-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  {/* RÂNDUL 1: Medalie + Plăcuță + Model | Sumă RON + Procent */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {getRankBadge(index)}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="whitespace-nowrap shrink-0 inline-flex items-center font-mono text-xs font-black text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-950 px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-700 shadow-2xs">
                            <span className="text-[9px] text-blue-500 font-bold mr-1">RO</span>
                            {vehicle.plate}
                          </span>
                          <span className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-slate-100 truncate">
                            {vehicle.makeModel}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-base sm:text-lg font-mono font-black text-slate-900 dark:text-white">
                        {totalCost.toLocaleString('ro-RO')} <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">RON</span>
                      </div>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                        percentage > 25
                          ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30'
                          : percentage > 15
                          ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30'
                          : 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30'
                      }`}>
                        {percentage}% din total
                      </span>
                    </div>
                  </div>

                  {/* RÂNDUL 2: Detalii mașină (Șofer, km) */}
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-0.5">
                    <span className="truncate">
                      👤 Șofer: <strong className="text-slate-700 dark:text-slate-200">{vehicle.driver || "Neatribuit"}</strong>
                    </span>
                    {vehicle.currentKm ? (
                      <span className="shrink-0 font-mono text-[11px]">
                        🛣️ {vehicle.currentKm.toLocaleString('ro-RO')} km
                      </span>
                    ) : null}
                  </div>

                  {/* RÂNDUL 3: Bară progres proporțională */}
                  <div className="w-full bg-slate-100 dark:bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-200/80 dark:border-slate-800/80">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        index === 0
                          ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                          : index === 1
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-500'
                          : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                      }`}
                      style={{ width: `${Math.max(percentage, 3)}%` }}
                    />
                  </div>

                  {/* RÂNDUL 4: Mini tag-uri categorii */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-[10.5px] text-slate-600 dark:text-slate-300">
                    {repairCost > 0 && (
                      <span className="bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-500/20 font-medium">
                        🔧 Reparații: <strong>{repairCost.toLocaleString('ro-RO')} lei</strong>
                      </span>
                    )}
                    {serviceCost > 0 && (
                      <span className="bg-amber-50 dark:bg-amber-500/10 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-500/20 font-medium">
                        🛢️ Revizii: <strong>{serviceCost.toLocaleString('ro-RO')} lei</strong>
                      </span>
                    )}
                    {tiresCost > 0 && (
                      <span className="bg-cyan-50 dark:bg-cyan-500/10 text-cyan-800 dark:text-cyan-300 px-2 py-0.5 rounded-md border border-cyan-200 dark:border-cyan-500/20 font-medium">
                        🛞 Anvelope: <strong>{tiresCost.toLocaleString('ro-RO')} lei</strong>
                      </span>
                    )}
                    {fuelCost > 0 && (
                      <span className="bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-300 px-2 py-0.5 rounded-md border border-sky-200 dark:border-sky-500/20 font-medium">
                        ⛽ Carburant: <strong>{fuelCost.toLocaleString('ro-RO')} lei</strong>
                      </span>
                    )}
                    {insuranceCost > 0 && (
                      <span className="bg-teal-50 dark:bg-teal-500/10 text-teal-800 dark:text-teal-300 px-2 py-0.5 rounded-md border border-teal-200 dark:border-teal-500/20 font-medium">
                        📋 Asigurări: <strong>{insuranceCost.toLocaleString('ro-RO')} lei</strong>
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Col: Category Breakdown Chart / Insights */}
        <div className="space-y-4">
          
          {/* Top Spender Alert Card (Shown only when viewing entire fleet) */}
          {rankings.length > 1 && rankings[0].totalCost > 0 && (
            <div className="bg-gradient-to-br from-amber-50 to-orange-50/40 dark:from-amber-950/40 dark:via-slate-900 dark:to-slate-900 border border-amber-300 dark:border-amber-500/40 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-xs uppercase tracking-wider mb-2">
                <AlertCircle className="w-4 h-4" />
                <span>{t.topSpender}</span>
              </div>
              <div className="text-xl font-black text-slate-900 dark:text-white whitespace-nowrap inline-flex items-center">
                <span className="text-[11px] text-blue-500 font-bold mr-1.5 bg-slate-100 dark:bg-slate-950 px-1 py-0.5 rounded border border-slate-300 dark:border-slate-700">RO</span>
                {rankings[0].vehicle.plate}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                {rankings[0].vehicle.makeModel}
              </p>
              <div className="mt-3 pt-3 border-t border-amber-200 dark:border-amber-500/20 flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">Total înregistrat:</span>
                <span className="font-mono font-bold text-amber-700 dark:text-amber-300 text-sm">
                  {rankings[0].totalCost.toLocaleString('ro-RO')} RON ({rankings[0].percentage}%)
                </span>
              </div>
            </div>
          )}

          {/* Distribution by Category - Interactive Donut Chart */}
          <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Distribuție pe Categorii</span>
              </h3>
              <span className="text-[10.5px] font-semibold text-slate-400 dark:text-slate-500">
                Apasă pentru detalii
              </span>
            </div>

            {(() => {
              const categories = [
                { key: 'repair', label: 'Reparații & Piese', amount: categoryTotals.repair, color: '#fb7185', bgClass: 'bg-rose-400' },
                { key: 'fuel', label: 'Alimentări Combustibil', amount: categoryTotals.fuel, color: '#38bdf8', bgClass: 'bg-sky-400' },
                { key: 'service', label: 'Revizii & Ulei', amount: categoryTotals.service, color: '#fbbf24', bgClass: 'bg-amber-400' },
                { key: 'insurance', label: 'Asigurări (RCA/CASCO)', amount: categoryTotals.insurance, color: '#34d399', bgClass: 'bg-emerald-400' },
                { key: 'tires', label: 'Anvelope', amount: categoryTotals.tires, color: '#22d3ee', bgClass: 'bg-cyan-400' },
                { key: 'fine', label: 'Amenzi & Taxe', amount: categoryTotals.fine, color: '#fb923c', bgClass: 'bg-orange-400' }
              ].filter(c => c.amount > 0);

              const chartTotal = categories.reduce((sum, c) => sum + c.amount, 0);

              const getCategoryTab = (catKey) => {
                switch (catKey) {
                  case 'repair': return 'repairs';
                  case 'fuel': return 'fuel';
                  case 'service': return 'service';
                  case 'insurance': return 'insurance';
                  case 'tires': return 'tires';
                  case 'itp': return 'itp';
                  case 'fine':
                  case 'rovinieta': return 'rovinieta';
                  default: return 'records';
                }
              };

              const radius = 75;
              const circumference = 2 * Math.PI * radius; // ~471.24
              let accumulatedOffset = 0;

              if (categories.length === 0 || chartTotal === 0) {
                return (
                  <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
                    Nu există cheltuieli înregistrate.
                  </div>
                );
              }

              return (
                <div className="space-y-4">
                  {/* Visual Interactive SVG Donut Chart */}
                  <div className="relative flex items-center justify-center py-2">
                    <svg
                      width="200"
                      height="200"
                      viewBox="0 0 220 220"
                      className="transform -rotate-90"
                    >
                      {/* Base Track (Subtle, lighter background ring) */}
                      <circle
                        cx="110"
                        cy="110"
                        r={radius}
                        fill="none"
                        stroke="currentColor"
                        className="text-slate-100 dark:text-slate-800/60"
                        strokeWidth="18"
                      />

                      {/* Slices with lighter contour separation */}
                      {categories.map((cat) => {
                        const pct = cat.amount / chartTotal;
                        const strokeLength = pct * circumference;
                        const gap = categories.length > 1 ? 3.5 : 0;
                        const effectiveLength = Math.max(0, strokeLength - gap);
                        const strokeDasharray = `${effectiveLength} ${circumference - effectiveLength}`;
                        const strokeDashoffset = -accumulatedOffset;
                        accumulatedOffset += strokeLength;

                        const isHovered = hoveredCategory?.key === cat.key;

                        return (
                          <circle
                            key={cat.key}
                            cx="110"
                            cy="110"
                            r={radius}
                            fill="none"
                            stroke={cat.color}
                            strokeWidth={isHovered ? 23 : 18}
                            strokeDasharray={strokeDasharray}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap={categories.length > 1 ? "round" : "butt"}
                            className="cursor-pointer transition-all duration-300 hover:opacity-85 filter drop-shadow-xs"
                            onClick={() => onNavigateTab && onNavigateTab(getCategoryTab(cat.key))}
                            onMouseEnter={() => setHoveredCategory(cat)}
                            onMouseLeave={() => setHoveredCategory(null)}
                          />
                        );
                      })}
                    </svg>

                    {/* Center Info Overlay */}
                    <div 
                      className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-4"
                    >
                      {hoveredCategory ? (
                        <div className="animate-in fade-in duration-200">
                          <span 
                            className="text-[11px] font-bold block truncate max-w-[120px]"
                            style={{ color: hoveredCategory.color }}
                          >
                            {hoveredCategory.label}
                          </span>
                          <span className="text-base font-black text-slate-900 dark:text-white block font-mono">
                            {hoveredCategory.amount.toLocaleString('ro-RO')}
                          </span>
                          <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 block">
                            {((hoveredCategory.amount / chartTotal) * 100).toFixed(1)}% • Apasă
                          </span>
                        </div>
                      ) : (
                        <div>
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                            Total
                          </span>
                          <span className="text-base font-black text-slate-900 dark:text-white block font-mono">
                            {grandTotal.toLocaleString('ro-RO')}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 block">
                            RON
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Interactive Category List below Donut */}
                  <div className="space-y-2 pt-1">
                    {categories.map((cat) => {
                      const pct = ((cat.amount / chartTotal) * 100).toFixed(1);
                      const isHovered = hoveredCategory?.key === cat.key;
                      const tabName = getCategoryTab(cat.key);

                      return (
                        <div
                          key={cat.key}
                          onClick={() => onNavigateTab && onNavigateTab(tabName)}
                          onMouseEnter={() => setHoveredCategory(cat)}
                          onMouseLeave={() => setHoveredCategory(null)}
                          className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between group active:scale-[0.98] ${
                            isHovered
                              ? 'bg-slate-100/90 dark:bg-slate-800 border-slate-300 dark:border-slate-700 shadow-xs'
                              : 'bg-slate-50/70 dark:bg-slate-950/40 border-slate-100 dark:border-slate-800/80 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 hover:border-slate-200 dark:hover:border-slate-700'
                          }`}
                          title={`Apasă pentru a deschide ${cat.label}`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span
                              className="w-3 h-3 rounded-full shrink-0 shadow-2xs"
                              style={{ backgroundColor: cat.color }}
                            />
                            <div className="min-w-0">
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                {cat.label}
                              </span>
                              <div className="w-24 sm:w-28 bg-slate-200/80 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden mt-1">
                                <div
                                  className="h-full rounded-full transition-all duration-300"
                                  style={{ width: `${pct}%`, backgroundColor: cat.color }}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <div className="text-right">
                              <span className="font-mono font-black text-xs text-slate-900 dark:text-white block">
                                {cat.amount.toLocaleString('ro-RO')} <span className="text-[10px] font-bold text-slate-400">RON</span>
                              </span>
                              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 block">
                                {pct}%
                              </span>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all shrink-0" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>

        </div>

      </div>

    </div>
  );
};
