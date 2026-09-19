import { DollarSign, Fuel, Gauge, TrendingUp, AlertTriangle, ShieldCheck, Wrench, Sparkles, FileText, CheckSquare, Navigation, Disc, MapPin, Plus, X } from 'lucide-react';
import { translations } from '../i18n';
import { getDaysRemaining, formatDateRo } from '../utils/calculations';

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

  // Arched single checkmark ("un singur v și mai arcuit")
  const ArchedCheck = ({ className = "w-3 h-3 text-emerald-600 dark:text-emerald-400" }) => (
    <svg 
      viewBox="0 0 20 20" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.8" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
      aria-hidden="true"
    >
      <path d="M3.5 10.5 C 5 12, 6.8 14.2, 8.2 15.5 C 11.5 10.5, 14.5 6.5, 17.5 4.5" />
    </svg>
  );

  // Helper to render main value: exact format of tire code in tire card (text-sm sm:text-base font-black)
  const renderDocumentMainValue = (expiryDate, expiredCount, totalCount) => {
    if (selectedVehicle) {
      if (expiryDate) {
        const diffDays = getDaysRemaining(expiryDate);
        const colorClass = diffDays < 0 
          ? "text-rose-600 dark:text-rose-400" 
          : (diffDays <= 30 
              ? "text-amber-600 dark:text-amber-400" 
              : "text-slate-900 dark:text-white");
        return (
          <div className={`text-sm sm:text-base font-black tracking-tight truncate ${colorClass}`}>
            {formatDateRo(expiryDate)}
          </div>
        );
      }
      return <div className="text-sm sm:text-base font-black text-slate-400 dark:text-slate-500 tracking-tight">—</div>;
    } else {
      if (expiredCount > 0) {
        return (
          <div className="text-sm sm:text-base font-black text-rose-600 dark:text-rose-400 tracking-tight truncate">
            {expiredCount} {t.expired || "expirate"}
          </div>
        );
      } else {
        return (
          <div className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight truncate">
            {totalCount} {t.allValid || "Valide"}
          </div>
        );
      }
    }
  };

  // Helper to render status icon in fine round circle border matching '+' button size in Curse Weekend
  const renderDocumentStatusIcon = (expiryDate, expiredCount) => {
    if (selectedVehicle) {
      if (expiryDate) {
        const diffDays = getDaysRemaining(expiryDate);
        if (diffDays < 0) {
          return (
            <span 
              className="w-[26px] h-[26px] sm:w-7 sm:h-7 rounded-full border border-rose-400/50 bg-rose-500/10 dark:border-rose-500/40 dark:bg-rose-500/15 shadow-xs flex items-center justify-center shrink-0 mb-0.5"
              title="Expirat"
            >
              <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-600 dark:text-rose-400 stroke-[2.6]" />
            </span>
          );
        }
        return (
          <span 
            className="w-[26px] h-[26px] sm:w-7 sm:h-7 rounded-full border border-emerald-400/50 bg-emerald-500/10 dark:border-emerald-500/40 dark:bg-emerald-500/15 shadow-xs flex items-center justify-center shrink-0 mb-0.5"
            title="Valid"
          >
            <ArchedCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 dark:text-emerald-400 stroke-[2.6]" />
          </span>
        );
      }
      return null;
    } else {
      if (expiredCount > 0) {
        return (
          <span 
            className="w-[26px] h-[26px] sm:w-7 sm:h-7 rounded-full border border-rose-400/50 bg-rose-500/10 dark:border-rose-500/40 dark:bg-rose-500/15 shadow-xs flex items-center justify-center shrink-0 mb-0.5"
            title="Atenție: expirate"
          >
            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-600 dark:text-rose-400 stroke-[2.6]" />
          </span>
        );
      }
      return (
        <span 
          className="w-[26px] h-[26px] sm:w-7 sm:h-7 rounded-full border border-emerald-400/50 bg-emerald-500/10 dark:border-emerald-500/40 dark:bg-emerald-500/15 shadow-xs flex items-center justify-center shrink-0 mb-0.5"
          title="Toate valide"
        >
          <ArchedCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 dark:text-emerald-400 stroke-[2.6]" />
        </span>
      );
    }
  };

  // Helper for document card subtext
  const getDocumentSubText = (expiryDate, expiredCount, totalCount, activeLabel, overdueLabel) => {
    if (selectedVehicle) {
      if (expiryDate) {
        const diffDays = getDaysRemaining(expiryDate);
        if (diffDays < 0) {
          return `${t.expiredBy || "Expirat de"} ${Math.abs(diffDays)} ${t.days || "zile"}`;
        } else if (diffDays <= 30) {
          return `${diffDays} ${t.daysLeft || "zile rămase"}`;
        } else {
          return `${diffDays} ${t.daysLeft || "zile rămase"}`;
        }
      }
      return t.notSet || "Nespecificat";
    } else {
      if (expiredCount > 0) {
        return overdueLabel;
      } else {
        return `${totalCount} ${activeLabel}`;
      }
    }
  };

  const rcaExpiredCount = vehicles.filter(v => v && v.rcaExpiry && (getDaysRemaining(v.rcaExpiry) < 0)).length;
  const itpExpiredCount = vehicles.filter(v => v && v.itpExpiry && (getDaysRemaining(v.itpExpiry) < 0)).length;
  const rovExpiredCount = (vehicles || []).filter(v => v && v.rovinietaExpiry && (getDaysRemaining(v.rovinietaExpiry) < 0)).length;

  return (
    <div className="space-y-2 sm:space-y-3 mb-3">
      
      {/* GRILA PRINCIPALA: 10 Carduri (2 coloane pe mobil, 5 coloane pe ecran mare) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-2.5">
        
        {/* 1. Total Cheltuieli - Pale Emerald (Col 1, Rând 1) */}
        <div 
          onClick={() => onNavigateTab && onNavigateTab('rankings')}
          className="bg-emerald-50/35 dark:bg-emerald-950/20 border border-slate-300/80 dark:border-slate-700/80 rounded-2xl flex flex-col justify-between min-h-[104px] sm:min-h-[109px] p-2.5 sm:p-3 relative overflow-hidden group hover:border-slate-400/80 dark:hover:border-slate-600 transition-all shadow-xs cursor-pointer active:scale-[0.98]"
          title="Apasă pentru detalii costuri"
        >
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 truncate">
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
          <div>
            <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
              {totalExpenses.toLocaleString('ro-RO')} <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">RON</span>
            </div>
            <div className="mt-0.5 flex items-center text-[10px] text-slate-500 dark:text-slate-400 truncate">
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
        </div>

        {/* 2. Cost / Km - Pale Purple (Col 2, Rând 1) */}
        <div 
          onClick={() => onNavigateTab && onNavigateTab('costPerKm')}
          className="bg-purple-50/40 dark:bg-purple-950/20 border border-slate-300/80 dark:border-slate-700/80 rounded-2xl flex flex-col justify-between min-h-[104px] sm:min-h-[109px] p-2.5 sm:p-3 relative overflow-hidden group hover:border-slate-400/80 dark:hover:border-slate-600 transition-all shadow-xs cursor-pointer active:scale-[0.98]"
          title={t.costPerKmTitle || "Apasă pentru analiză detaliată Cost / Km"}
        >
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 truncate">
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
          <div>
            <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
              {costPerKm ? (
                <>
                  {costPerKm} <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400">RON/km</span>
                </>
              ) : (
                <span className="text-sm font-bold text-slate-400 dark:text-slate-500">—</span>
              )}
            </div>
            <div className="mt-0.5 flex items-center text-[10px] text-slate-500 dark:text-slate-400 truncate">
              <span className="truncate">
                {selectedVehicle 
                  ? `${(selectedVehicle.currentKm || 0).toLocaleString()} km` 
                  : `${totalKm.toLocaleString()} km`}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Reparații - Pale Red (Col 1, Rând 2) */}
        <div 
          onClick={() => onNavigateTab && onNavigateTab('repairs')}
          className="bg-red-50/40 dark:bg-red-950/20 border border-slate-300/80 dark:border-slate-700/80 rounded-2xl flex flex-col justify-between min-h-[104px] sm:min-h-[109px] p-2.5 sm:p-3 relative overflow-hidden group hover:border-slate-400/80 dark:hover:border-slate-600 transition-all shadow-xs cursor-pointer active:scale-[0.98]"
          title="Apasă pentru detalii reparații"
        >
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 truncate">
              {t.repairsAndParts || "Reparații & Piese"}
            </span>
            <div className="p-1 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 group-hover:bg-red-500/20 transition-colors shrink-0">
              <Wrench className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
              {repairTotal.toLocaleString('ro-RO')} <span className="text-[10px] font-bold text-red-600 dark:text-red-400">RON</span>
            </div>
            <div className="mt-0.5 flex items-center text-[10px] text-slate-500 dark:text-slate-400 truncate">
              <span className="truncate">
                {repairRecords.length} {t.interventions || "intervenții"}
              </span>
            </div>
          </div>
        </div>

        {/* 4. Revizii & Service - Pale Teal (Col 2, Rând 2) */}
        <div 
          onClick={() => onNavigateTab && onNavigateTab('service')}
          className="bg-teal-50/35 dark:bg-teal-950/20 border border-slate-300/80 dark:border-slate-700/80 rounded-2xl flex flex-col justify-between min-h-[104px] sm:min-h-[109px] p-2.5 sm:p-3 relative overflow-hidden group hover:border-slate-400/80 dark:hover:border-slate-600 transition-all shadow-xs cursor-pointer active:scale-[0.98]"
          title="Apasă pentru detalii revizii"
        >
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 truncate">
              {t.servicesAndOil || "Revizii & Service"}
            </span>
            <div className="p-1 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 group-hover:bg-teal-500/20 transition-colors shrink-0">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
              {serviceTotal.toLocaleString('ro-RO')} <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400">RON</span>
            </div>
            <div className="mt-0.5 flex items-center text-[10px] text-slate-500 dark:text-slate-400 truncate">
              <span className="truncate">
                {selectedVehicle?.nextServiceKm 
                  ? `${t.nextService || 'Următoarea'}: ${selectedVehicle.nextServiceKm.toLocaleString()} km`
                  : `${serviceRecords.length} ${t.services || 'revizii'}`}
              </span>
            </div>
          </div>
        </div>

        {/* 5. Inspecție ITP - Pale Indigo (Col 1, Rând 3) */}
        <div 
          onClick={() => onNavigateTab && onNavigateTab('itp')}
          className="bg-indigo-50/40 dark:bg-indigo-950/20 border border-slate-300/80 dark:border-slate-700/80 rounded-2xl flex flex-col justify-between min-h-[104px] sm:min-h-[109px] p-2.5 sm:p-3 relative overflow-hidden group hover:border-slate-400/80 dark:hover:border-slate-600 transition-all shadow-xs cursor-pointer active:scale-[0.98]"
          title="Apasă pentru detalii ITP"
        >
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 truncate">
              {t.itpInspection || "Inspecție ITP"}
            </span>
            <div className="p-1 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-500/20 transition-colors shrink-0">
              <CheckSquare className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-end justify-between gap-1.5 mt-auto">
            <div className="min-w-0 flex-1">
              {renderDocumentMainValue(selectedVehicle?.itpExpiry, itpExpiredCount, vehicles.length)}
              <div className="mt-0.5 flex items-center text-[10px] text-slate-500 dark:text-slate-400 truncate">
                <span className="truncate">
                  {getDocumentSubText(
                    selectedVehicle?.itpExpiry, 
                    itpExpiredCount, 
                    vehicles.length, 
                    t.activeInspections || "inspecții la zi", 
                    t.inspectionOverdue || "Inspecție depășită"
                  )}
                </span>
              </div>
            </div>
            {renderDocumentStatusIcon(selectedVehicle?.itpExpiry, itpExpiredCount)}
          </div>
        </div>

        {/* 6. Consum Mediu - Deeper Blue (Un ton în plus) (Col 2, Rând 3) */}
        <div 
          onClick={() => onNavigateTab && onNavigateTab('fuel')}
          className="bg-blue-200/75 dark:bg-blue-900/60 border border-slate-300/80 dark:border-slate-700/80 rounded-2xl flex flex-col justify-between min-h-[104px] sm:min-h-[109px] p-2.5 sm:p-3 relative overflow-hidden group hover:border-slate-400/80 dark:hover:border-slate-600 transition-all shadow-xs cursor-pointer active:scale-[0.98]"
          title={t.fuelConsumptionTitle || "Apasă pentru date despre carburant & consum"}
        >
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 truncate">
              {selectedVehicle 
                ? `${t.consumption || 'Consum'} ${selectedVehicle.plate}` 
                : isMultiSelection 
                  ? `${t.consumption || 'Consum'} (${selectedCount})`
                  : t.avgFleetConsumption}
            </span>
            <div className="p-1 rounded-xl bg-blue-500/15 text-blue-700 dark:text-blue-300 group-hover:bg-blue-500/25 transition-colors shrink-0">
              <Fuel className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
              {avgConsumption ? (
                <>
                  {avgConsumption} <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300">L/100</span>
                </>
              ) : (
                <span className="text-sm font-bold text-slate-400 dark:text-slate-500">—</span>
              )}
            </div>
            <div className="mt-0.5 flex items-center text-[10px] text-slate-500 dark:text-slate-400 truncate">
              <span className="truncate text-blue-700 dark:text-blue-300 font-semibold">
                {t.viewLogs || 'Vezi alimentări →'}
              </span>
            </div>
          </div>
        </div>

        {/* 7. Asigurare RCA - Pale Orange (Col 1, Rând 4) */}
        <div 
          onClick={() => onNavigateTab && onNavigateTab('insurance')}
          className="bg-orange-50/35 dark:bg-orange-950/20 border border-slate-300/80 dark:border-slate-700/80 rounded-2xl flex flex-col justify-between min-h-[104px] sm:min-h-[109px] p-2.5 sm:p-3 relative overflow-hidden group hover:border-slate-400/80 dark:hover:border-slate-600 transition-all shadow-xs cursor-pointer active:scale-[0.98]"
          title="Apasă pentru detalii asigurare RCA"
        >
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 truncate">
              {t.mandatoryInsurance || "Asigurare RCA"}
            </span>
            <div className="p-1 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 group-hover:bg-orange-500/20 transition-colors shrink-0">
              <FileText className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-end justify-between gap-1.5 mt-auto">
            <div className="min-w-0 flex-1">
              {renderDocumentMainValue(selectedVehicle?.rcaExpiry, rcaExpiredCount, vehicles.length)}
              <div className="mt-0.5 flex items-center text-[10px] text-slate-500 dark:text-slate-400 truncate">
                <span className="truncate">
                  {getDocumentSubText(
                    selectedVehicle?.rcaExpiry, 
                    rcaExpiredCount, 
                    vehicles.length, 
                    t.activePolicies || "polițe active", 
                    t.requiresRenewal || "Necesită reînnoire"
                  )}
                </span>
              </div>
            </div>
            {renderDocumentStatusIcon(selectedVehicle?.rcaExpiry, rcaExpiredCount)}
          </div>
        </div>

        {/* 8. Curse Weekend & Personal - Rose (Un ton în plus) (Col 2, Rând 4) */}
        <div 
          onClick={() => onNavigateTab && onNavigateTab('personal')}
          className="bg-rose-100/75 dark:bg-rose-900/40 border border-slate-300/80 dark:border-slate-700/80 rounded-2xl flex flex-col justify-between min-h-[104px] sm:min-h-[109px] p-2.5 sm:p-3 relative overflow-hidden group hover:border-slate-400/80 dark:hover:border-slate-600 transition-all shadow-xs cursor-pointer active:scale-[0.98]"
          title={t.personalTripsTitle || "Apasă pentru evidență consum & decontare curse personale"}
        >
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 truncate">
              {t.weekendTrips || t.personalTrips || "Curse Weekend"}
            </span>
            <div className="p-1 rounded-xl bg-rose-500/15 text-rose-700 dark:text-rose-300 group-hover:bg-rose-500/25 transition-colors shrink-0">
              <Navigation className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-end justify-between gap-1.5 mt-auto">
            <div className="min-w-0 flex-1">
              <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                {unpaidPersonalCost.toLocaleString('ro-RO')} <span className="text-[10px] font-bold text-rose-700 dark:text-rose-300">RON</span>
              </div>
              <div className="mt-0.5 flex items-center text-[10px] text-slate-500 dark:text-slate-400 truncate">
                <span className="truncate text-rose-700 dark:text-rose-300 font-semibold">
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
                className="w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-full bg-rose-200/90 hover:bg-rose-300 text-rose-800 dark:bg-rose-900/80 dark:hover:bg-rose-800 dark:text-rose-200 border border-slate-300/80 dark:border-slate-700 shadow-xs hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center shrink-0 mb-0.5"
                title={t.addPersonalTrip || "Adaugă rapid cursă personală"}
              >
                <Plus className="w-4 h-4 stroke-[2.6]" />
              </button>
            )}
          </div>
        </div>

        {/* 9. Rovinietă & Taxe - Pale Lime (Col 1, Rând 5) */}
        <div 
          onClick={() => onNavigateTab && onNavigateTab('rovinieta')}
          className="bg-lime-50/25 dark:bg-lime-950/15 border border-slate-300/80 dark:border-slate-700/80 rounded-2xl flex flex-col justify-between min-h-[104px] sm:min-h-[109px] p-2.5 sm:p-3 relative overflow-hidden group hover:border-slate-400/80 dark:hover:border-slate-600 transition-all shadow-xs cursor-pointer active:scale-[0.98]"
          title="Apasă pentru detalii Rovinietă"
        >
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 truncate">
              {t.vignetteAndTaxes || "Rovinietă & Taxe"}
            </span>
            <div className="p-1 rounded-xl bg-lime-500/10 text-lime-700 dark:text-lime-400 group-hover:bg-lime-500/20 transition-colors shrink-0">
              <MapPin className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-end justify-between gap-1.5 mt-auto">
            <div className="min-w-0 flex-1">
              {renderDocumentMainValue(selectedVehicle?.rovinietaExpiry, rovExpiredCount, (vehicles || []).length)}
              <div className="mt-0.5 flex items-center text-[10px] text-slate-500 dark:text-slate-400 truncate">
                <span className="truncate">
                  {getDocumentSubText(
                    selectedVehicle?.rovinietaExpiry, 
                    rovExpiredCount, 
                    (vehicles || []).length, 
                    t.activeVignettes || "roviniete active", 
                    t.requiresPurchase || "Necesită achiziție"
                  )}
                </span>
              </div>
            </div>
            {renderDocumentStatusIcon(selectedVehicle?.rovinietaExpiry, rovExpiredCount)}
          </div>
        </div>

        {/* 10. Anvelope & Roți - Pale Slate / Silver (Col 2, Rând 5) */}
        <div 
          onClick={() => onNavigateTab && onNavigateTab('tires')}
          className="bg-slate-100/40 dark:bg-slate-800/20 border border-slate-300/80 dark:border-slate-700/80 rounded-2xl flex flex-col justify-between min-h-[104px] sm:min-h-[109px] p-2.5 sm:p-3 relative overflow-hidden group hover:border-slate-400/80 dark:hover:border-slate-600 transition-all shadow-xs cursor-pointer active:scale-[0.98]"
          title="Apasă pentru detalii anvelope"
        >
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 truncate">
              {t.tiresAndWheels || "Anvelope & Roți"}
            </span>
            <div className="p-1 rounded-xl bg-slate-500/10 text-slate-600 dark:text-slate-300 group-hover:bg-slate-500/20 transition-colors shrink-0">
              <Disc className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight truncate">
              {tiresTotal > 0 ? (
                <>
                  {tiresTotal.toLocaleString('ro-RO')} <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">RON</span>
                </>
              ) : (
                <span className="truncate text-sm sm:text-base font-black">
                  {selectedVehicle?.tires?.size || t.configured || "Configurate"}
                </span>
              )}
            </div>
            <div className="mt-0.5 flex items-center text-[10px] text-slate-500 dark:text-slate-400 truncate">
              <span className="truncate">
                {tiresRecords.length > 0 
                  ? `${tiresRecords.length} ${t.tireRecords || 'achiziții / schimburi'}`
                  : (selectedVehicle?.tires ? `${selectedVehicle.tires.brand} (${selectedVehicle.tires.type})` : (t.tireManagement || 'Gestiune anvelope'))}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* RÂNDUL 3: Atenționări Urgente (Card orizontal complet) */}
      <div 
        onClick={() => onNavigateTab && onNavigateTab('alerts')}
        className={`mt-6 sm:mt-7 border rounded-2xl p-2.5 sm:p-3 relative overflow-hidden group transition-all shadow-xs cursor-pointer active:scale-[0.99] flex items-center justify-between gap-3 ${
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
