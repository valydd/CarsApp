import React from 'react';
import { DollarSign, Fuel, Gauge, TrendingUp, AlertTriangle, ShieldCheck, Wrench, Sparkles, FileText, CheckSquare, Navigation, Disc, MapPin, Plus } from 'lucide-react';
import { translations } from '../i18n';
import { getDaysRemaining } from '../utils/calculations';

export const DashboardStats = ({
  totalExpenses,
  avgConsumption,
  costPerKm,
  totalKm,
  activeAlertsCount,
  selectedVehicle,
  selectedCount,
  totalVehiclesCount,
  onNavigateTab,
  onOpenAddPersonalTrip,
  records = [],
  vehicles = [],
  personalTrips = [],
  lang = 'ro'
}) => {
  const t = translations[lang] || translations.ro;

  const isMultiSelection = !selectedVehicle && selectedCount && totalVehiclesCount && selectedCount < totalVehiclesCount;

  // Filter records for active selection
  const relevantRecords = selectedVehicle 
    ? records.filter(r => r.vehicleId === selectedVehicle.id)
    : records;

  // Filter personal trips for active selection
  const relevantTrips = selectedVehicle
    ? personalTrips.filter(t => t.vehicleId === selectedVehicle.id)
    : personalTrips;

  // Unpaid personal trips for the dashboard card
  const unpaidTrips = relevantTrips.filter(t => !t.isPaid);
  const unpaidPersonalCost = Number(unpaidTrips.reduce((sum, t) => sum + (Number(t.tripCost) || 0), 0).toFixed(2));
  const unpaidPersonalKm = unpaidTrips.reduce((sum, t) => sum + (Number(t.kmDriven) || 0), 0);
  const totalPersonalCost = Number(relevantTrips.reduce((sum, t) => sum + (Number(t.tripCost) || 0), 0).toFixed(2));

  // 1. REPARATII STATS
  const repairRecords = relevantRecords.filter(r => r.category === 'repair');
  const repairTotal = repairRecords.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

  // 2. REVIZII & SERVICE STATS
  const serviceRecords = relevantRecords.filter(r => r.category === 'service');
  const serviceTotal = serviceRecords.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

  // 3. ANVELOPE STATS
  const tiresRecords = relevantRecords.filter(r => r.category === 'tires');
  const tiresTotal = tiresRecords.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

  // 3. ASIGURARE RCA STATS
  let rcaStatusText = '';
  let rcaStatusColor = 'text-slate-900 dark:text-white';
  let rcaSubText = '';

  if (selectedVehicle) {
    if (selectedVehicle.rcaExpiry) {
      const diffDays = getDaysRemaining(selectedVehicle.rcaExpiry);
      if (diffDays < 0) {
        rcaStatusText = t.expiredFeminine || t.expired || "Expirată!";
        rcaStatusColor = "text-rose-600 dark:text-rose-400";
        rcaSubText = `${t.expiredBy || "Expirat de"} ${Math.abs(diffDays)} ${t.days || "zile"}`;
      } else if (diffDays <= 30) {
        rcaStatusText = `${diffDays} ${t.days || "zile"}`;
        rcaStatusColor = "text-amber-600 dark:text-amber-400";
        rcaSubText = t.expiresSoon || "Expiră în curând";
      } else {
        rcaStatusText = t.validFeminine || t.valid || "Validă";
        rcaStatusColor = "text-emerald-600 dark:text-emerald-400";
        rcaSubText = `${diffDays} ${t.daysLeft || "zile rămase"}`;
      }
    } else {
      rcaStatusText = "—";
      rcaSubText = t.notSet || "Nespecificat";
    }
  } else {
    const expiredCount = vehicles.filter(v => v.rcaExpiry && (getDaysRemaining(v.rcaExpiry) < 0)).length;
    if (expiredCount > 0) {
      rcaStatusText = `${expiredCount} ${t.expired || "expirate"}`;
      rcaStatusColor = "text-rose-600 dark:text-rose-400";
      rcaSubText = t.requiresRenewal || "Necesită reînnoire";
    } else {
      rcaStatusText = t.allValid || "Toate Valide";
      rcaStatusColor = "text-emerald-600 dark:text-emerald-400";
      rcaSubText = `${vehicles.length} ${t.activePolicies || "polițe active"}`;
    }
  }

  // 4. ITP STATS
  let itpStatusText = '';
  let itpStatusColor = 'text-slate-900 dark:text-white';
  let itpSubText = '';

  if (selectedVehicle) {
    if (selectedVehicle.itpExpiry) {
      const diffDays = getDaysRemaining(selectedVehicle.itpExpiry);
      if (diffDays < 0) {
        itpStatusText = t.expired || "Expirat!";
        itpStatusColor = "text-rose-600 dark:text-rose-400";
        itpSubText = `${t.expiredBy || "Expirat de"} ${Math.abs(diffDays)} ${t.days || "zile"}`;
      } else if (diffDays <= 30) {
        itpStatusText = `${diffDays} ${t.days || "zile"}`;
        itpStatusColor = "text-amber-600 dark:text-amber-400";
        itpSubText = t.expiresSoon || "Expiră în curând";
      } else {
        itpStatusText = t.valid || "Valid";
        itpStatusColor = "text-emerald-600 dark:text-emerald-400";
        itpSubText = `${diffDays} ${t.daysLeft || "zile rămase"}`;
      }
    } else {
      itpStatusText = "—";
      itpSubText = t.notSet || "Nespecificat";
    }
  } else {
    const expiredCount = vehicles.filter(v => v.itpExpiry && (getDaysRemaining(v.itpExpiry) < 0)).length;
    if (expiredCount > 0) {
      itpStatusText = `${expiredCount} ${t.expired || "expirate"}`;
      itpStatusColor = "text-rose-600 dark:text-rose-400";
      itpSubText = t.inspectionOverdue || "Inspecție depășită";
    } else {
      itpStatusText = t.allUpToDate || t.allValid || "Toate la zi";
      itpStatusColor = "text-emerald-600 dark:text-emerald-400";
      itpSubText = `${vehicles.length} ${t.activeInspections || "inspecții la zi"}`;
    }
  }

  // 5. ROVINIETA STATS
  let rovStatusText = '';
  let rovStatusColor = 'text-slate-900 dark:text-white';
  let rovSubText = '';

  if (selectedVehicle) {
    if (selectedVehicle.rovinietaExpiry) {
      const diffDays = getDaysRemaining(selectedVehicle.rovinietaExpiry);
      if (diffDays < 0) {
        rovStatusText = t.expiredFeminine || t.expired || "Expirată!";
        rovStatusColor = "text-rose-600 dark:text-rose-400";
        rovSubText = `${t.expiredBy || "Expirat de"} ${Math.abs(diffDays)} ${t.days || "zile"}`;
      } else if (diffDays <= 30) {
        rovStatusText = `${diffDays} ${t.days || "zile"}`;
        rovStatusColor = "text-amber-600 dark:text-amber-400";
        rovSubText = t.expiresSoon || "Expiră în curând";
      } else {
        rovStatusText = t.validFeminine || t.valid || "Validă";
        rovStatusColor = "text-emerald-600 dark:text-emerald-400";
        rovSubText = `${diffDays} ${t.daysLeft || "zile rămase"}`;
      }
    } else {
      rovStatusText = "—";
      rovSubText = t.notSet || "Nespecificat";
    }
  } else {
    const expiredCount = (vehicles || []).filter(v => v && v.rovinietaExpiry && (getDaysRemaining(v.rovinietaExpiry) < 0)).length;
    if (expiredCount > 0) {
      rovStatusText = `${expiredCount} ${t.expired || "expirate"}`;
      rovStatusColor = "text-rose-600 dark:text-rose-400";
      rovSubText = t.requiresPurchase || "Necesită achiziție";
    } else {
      rovStatusText = t.allValid || "Toate Valide";
      rovStatusColor = "text-emerald-600 dark:text-emerald-400";
      rovSubText = `${(vehicles || []).length} ${t.activeVignettes || "roviniete active"}`;
    }
  }

  return (
    <div className="space-y-2 sm:space-y-3 mb-3">
      
      {/* GRILA 1: Costuri, Consum Mediu, Cost / Km, Consum Personal */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5">
        
        {/* 1. Total Cheltuieli */}
        <div 
          onClick={() => onNavigateTab && onNavigateTab('rankings')}
          className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-2.5 sm:p-3 relative overflow-hidden group hover:border-emerald-500/50 transition-all shadow-xs cursor-pointer active:scale-[0.98]"
          title="Apasă pentru detalii costuri"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">
              {selectedVehicle 
                ? `${t.cost || 'Cost'} ${selectedVehicle.plate}` 
                : isMultiSelection 
                  ? `${t.cost || 'Cost'} (${selectedCount} ${t.checkedVehicles || 'mașini'})`
                  : t.totalFleetCost}
            </span>
            <div className="p-1 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500/20 transition-colors shrink-0">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
            {totalExpenses.toLocaleString('ro-RO')} <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">RON</span>
          </div>
          <div className="mt-1 flex items-center text-[10px] text-slate-500 dark:text-slate-400 truncate">
            <TrendingUp className="w-2.5 h-2.5 text-emerald-500 mr-1 shrink-0" />
            <span className="truncate">
              {selectedVehicle 
                ? selectedVehicle.makeModel 
                : isMultiSelection 
                  ? `${selectedCount} / ${totalVehiclesCount} ${t.checkedVehicles || 'bifate'}`
                  : (t.totalFleet || 'Total cheltuieli flotă')}
            </span>
          </div>
        </div>

        {/* 2. Consum Mediu -> Deschide ecranul dedicat carburant */}
        <div 
          onClick={() => onNavigateTab && onNavigateTab('fuel')}
          className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-2.5 sm:p-3 relative overflow-hidden group hover:border-blue-500/50 transition-all shadow-xs cursor-pointer active:scale-[0.98]"
          title={t.fuelConsumptionTitle || "Apasă pentru date despre carburant & consum"}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">
              {selectedVehicle 
                ? `${t.consumption || 'Consum'} ${selectedVehicle.plate}` 
                : isMultiSelection 
                  ? `${t.consumption || 'Consum'} (${selectedCount})`
                  : t.avgFleetConsumption}
            </span>
            <div className="p-1 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:bg-blue-500/20 transition-colors shrink-0">
              <Fuel className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
            {avgConsumption ? (
              <>
                {avgConsumption} <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">L/100</span>
              </>
            ) : (
              <span className="text-sm font-bold text-slate-400 dark:text-slate-500">—</span>
            )}
          </div>
          <div className="mt-1 flex items-center text-[10px] text-slate-500 dark:text-slate-400 truncate">
            <span className="truncate text-blue-600 dark:text-blue-400 font-semibold">
              {t.viewLogs || 'Vezi alimentări →'}
            </span>
          </div>
        </div>

        {/* 3. Cost / Km -> Deschide ecranul dedicat Cost / Kilometru */}
        <div 
          onClick={() => onNavigateTab && onNavigateTab('costPerKm')}
          className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-2.5 sm:p-3 relative overflow-hidden group hover:border-purple-500/50 transition-all shadow-xs cursor-pointer active:scale-[0.98]"
          title={t.costPerKmTitle || "Apasă pentru analiză detaliată Cost / Km"}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">
              {selectedVehicle 
                ? `${t.costPerKm || 'Cost / Km'} ${selectedVehicle.plate}` 
                : isMultiSelection 
                  ? `${t.costPerKm || 'Cost / Km'} (${selectedCount})`
                  : t.costPerKm}
            </span>
            <div className="p-1 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:bg-purple-500/20 transition-colors shrink-0">
              <Gauge className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
            {costPerKm ? (
              <>
                {costPerKm} <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400">RON/km</span>
              </>
            ) : (
              <span className="text-sm font-bold text-slate-400 dark:text-slate-500">—</span>
            )}
          </div>
          <div className="mt-1 flex items-center text-[10px] text-slate-500 dark:text-slate-400 truncate">
            <span className="truncate">
              {selectedVehicle 
                ? `${(selectedVehicle.currentKm || 0).toLocaleString()} km` 
                : `${totalKm.toLocaleString()} km`}
            </span>
          </div>
        </div>

        {/* 4. Curse Weekend & Personal (DOAR SUMELE NEACHITATE) */}
        <div 
          onClick={() => onNavigateTab && onNavigateTab('personal')}
          className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-2.5 sm:p-3 relative overflow-hidden group hover:border-fuchsia-500/50 transition-all shadow-xs cursor-pointer active:scale-[0.98]"
          title={t.personalTripsTitle || "Apasă pentru evidență consum & decontare curse personale"}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">
              {t.weekendTrips || t.personalTrips || "Curse Weekend"}
            </span>
            <div className="p-1 rounded-xl bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400 group-hover:bg-fuchsia-500/20 transition-colors shrink-0">
              <Navigation className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-end justify-between gap-1.5">
            <div className="min-w-0 flex-1">
              <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                {unpaidPersonalCost.toLocaleString('ro-RO')} <span className="text-[10px] font-bold text-fuchsia-600 dark:text-fuchsia-400">RON</span>
              </div>
              <div className="mt-1 flex items-center text-[10px] text-slate-500 dark:text-slate-400 truncate">
                <span className="truncate text-fuchsia-600 dark:text-fuchsia-400 font-semibold">
                  {unpaidPersonalCost > 0 
                    ? `${unpaidPersonalKm.toLocaleString('ro-RO')} km (${unpaidTrips.length} ${unpaidTrips.length === 1 ? (t.trip || 'cursă') : (t.trips || 'curse')})` 
                    : (totalPersonalCost > 0 ? (t.allSettled || "Toate achitate ✓") : (t.noTrips || "0 curse"))}
                </span>
              </div>
            </div>

            {onOpenAddPersonalTrip && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenAddPersonalTrip();
                }}
                className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-full bg-fuchsia-100 hover:bg-fuchsia-200 text-fuchsia-700 dark:bg-fuchsia-950/80 dark:hover:bg-fuchsia-900 dark:text-fuchsia-300 border border-fuchsia-300/80 dark:border-fuchsia-700/80 shadow-xs hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center shrink-0 mb-0.5"
                title={t.addPersonalTrip || "Adaugă rapid cursă personală"}
              >
                <Plus className="w-4.5 h-4.5 stroke-[2.6]" />
              </button>
            )}
          </div>
        </div>

      </div>

      {/* GRILA 2: Reparații, Revizii, Anvelope, Asigurare RCA, ITP, Rovinietă */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-2.5">
        
        {/* 1. Reparații */}
        <div 
          onClick={() => onNavigateTab && onNavigateTab('repairs')}
          className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-2.5 sm:p-3 relative overflow-hidden group hover:border-amber-500/50 transition-all shadow-xs cursor-pointer active:scale-[0.98]"
          title="Apasă pentru detalii reparații"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">
              {t.repairsAndParts || "Reparații & Piese"}
            </span>
            <div className="p-1 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:bg-amber-500/20 transition-colors shrink-0">
              <Wrench className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
            {repairTotal.toLocaleString('ro-RO')} <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">RON</span>
          </div>
          <div className="mt-1 flex items-center text-[10px] text-slate-500 dark:text-slate-400 truncate">
            <span className="truncate">
              {repairRecords.length} {t.interventions || "intervenții"}
            </span>
          </div>
        </div>

        {/* 2. Revizii & Service */}
        <div 
          onClick={() => onNavigateTab && onNavigateTab('service')}
          className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-2.5 sm:p-3 relative overflow-hidden group hover:border-teal-500/50 transition-all shadow-xs cursor-pointer active:scale-[0.98]"
          title="Apasă pentru detalii revizii"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">
              {t.servicesAndOil || "Revizii & Service"}
            </span>
            <div className="p-1 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 group-hover:bg-teal-500/20 transition-colors shrink-0">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
            {serviceTotal.toLocaleString('ro-RO')} <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400">RON</span>
          </div>
          <div className="mt-1 flex items-center text-[10px] text-slate-500 dark:text-slate-400 truncate">
            <span className="truncate">
              {selectedVehicle?.nextServiceKm 
                ? `${t.nextService || 'Următoarea'}: ${selectedVehicle.nextServiceKm.toLocaleString()} km`
                : `${serviceRecords.length} ${t.services || 'revizii'}`}
            </span>
          </div>
        </div>

        {/* 3. Anvelope & Roți */}
        <div 
          onClick={() => onNavigateTab && onNavigateTab('tires')}
          className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-2.5 sm:p-3 relative overflow-hidden group hover:border-cyan-500/50 transition-all shadow-xs cursor-pointer active:scale-[0.98]"
          title="Apasă pentru detalii anvelope"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">
              {t.tiresAndWheels || "Anvelope & Roți"}
            </span>
            <div className="p-1 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 group-hover:bg-cyan-500/20 transition-colors shrink-0">
              <Disc className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
            {tiresTotal > 0 ? (
              <>
                {tiresTotal.toLocaleString('ro-RO')} <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400">RON</span>
              </>
            ) : (
              selectedVehicle?.tires?.size || t.configured || "Configurate"
            )}
          </div>
          <div className="mt-1 flex items-center text-[10px] text-slate-500 dark:text-slate-400 truncate">
            <span className="truncate">
              {tiresRecords.length > 0 
                ? `${tiresRecords.length} ${t.tireRecords || 'achiziții / schimburi'}`
                : (selectedVehicle?.tires ? `${selectedVehicle.tires.brand} (${selectedVehicle.tires.type})` : (t.tireManagement || 'Gestiune anvelope'))}
            </span>
          </div>
        </div>

        {/* 4. Asigurare RCA */}
        <div 
          onClick={() => onNavigateTab && onNavigateTab('insurance')}
          className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-2.5 sm:p-3 relative overflow-hidden group hover:border-blue-500/50 transition-all shadow-xs cursor-pointer active:scale-[0.98]"
          title="Apasă pentru detalii asigurare RCA"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">
              {t.mandatoryInsurance || "Asigurare RCA"}
            </span>
            <div className="p-1 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:bg-blue-500/20 transition-colors shrink-0">
              <FileText className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className={`text-base sm:text-lg font-black tracking-tight ${rcaStatusColor}`}>
            {rcaStatusText}
          </div>
          <div className="mt-1 flex items-center text-[10px] text-slate-500 dark:text-slate-400 truncate">
            <span className="truncate">{rcaSubText}</span>
          </div>
        </div>

        {/* 5. ITP */}
        <div 
          onClick={() => onNavigateTab && onNavigateTab('itp')}
          className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-2.5 sm:p-3 relative overflow-hidden group hover:border-indigo-500/50 transition-all shadow-xs cursor-pointer active:scale-[0.98]"
          title="Apasă pentru detalii ITP"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">
              {t.itpInspection || "Inspecție ITP"}
            </span>
            <div className="p-1 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-500/20 transition-colors shrink-0">
              <CheckSquare className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className={`text-base sm:text-lg font-black tracking-tight ${itpStatusColor}`}>
            {itpStatusText}
          </div>
          <div className="mt-1 flex items-center text-[10px] text-slate-500 dark:text-slate-400 truncate">
            <span className="truncate">{itpSubText}</span>
          </div>
        </div>

        {/* 6. Rovinietă & Taxe */}
        <div 
          onClick={() => onNavigateTab && onNavigateTab('rovinieta')}
          className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-2.5 sm:p-3 relative overflow-hidden group hover:border-emerald-500/50 transition-all shadow-xs cursor-pointer active:scale-[0.98]"
          title="Apasă pentru detalii Rovinietă"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">
              {t.vignetteAndTaxes || "Rovinietă & Taxe"}
            </span>
            <div className="p-1 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500/20 transition-colors shrink-0">
              <MapPin className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className={`text-base sm:text-lg font-black tracking-tight ${rovStatusColor}`}>
            {rovStatusText}
          </div>
          <div className="mt-1 flex items-center text-[10px] text-slate-500 dark:text-slate-400 truncate">
            <span className="truncate">{rovSubText}</span>
          </div>
        </div>

      </div>

      {/* RÂNDUL 3: Atenționări Urgente (Card orizontal complet) */}
      <div 
        onClick={() => onNavigateTab && onNavigateTab('alerts')}
        className={`border rounded-2xl p-2.5 sm:p-3 relative overflow-hidden group transition-all shadow-xs cursor-pointer active:scale-[0.99] flex items-center justify-between gap-3 ${
          activeAlertsCount > 0 
            ? 'bg-rose-50/80 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40 hover:border-rose-500/50' 
            : 'bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800/80 hover:border-emerald-500/50'
        }`}
        title={t.alerts || "Apasă pentru alerte și scadențe"}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`p-1.5 rounded-xl shrink-0 ${
            activeAlertsCount > 0 ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
          }`}>
            {activeAlertsCount > 0 ? <AlertTriangle className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>{t.urgentAlertsCount || 'Atenționări Urgente'}:</span>
              <span className={activeAlertsCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}>
                {activeAlertsCount} {activeAlertsCount === 1 ? (t.alert || 'alertă') : (t.alertsCount || 'alerte')}
              </span>
            </div>
            <p className="text-[10.5px] text-slate-500 dark:text-slate-400 truncate">
              {activeAlertsCount > 0 
                ? (t.inspectDeadlines || 'Apasă pentru a vedea scadențele depășite sau apropiate')
                : (t.allCompliant || 'Toate inspecțiile, reviziile și actele vehiculelor sunt conforme')}
            </p>
          </div>
        </div>

        <span className={`text-[11px] font-bold px-2 py-1 rounded-xl shrink-0 ${
          activeAlertsCount > 0 
            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' 
            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
        }`}>
          {t.viewDetails || 'Vezi >'}
        </span>
      </div>

    </div>
  );
};
