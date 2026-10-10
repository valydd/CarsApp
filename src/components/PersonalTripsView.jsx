import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Navigation, 
  Plus, 
  Calendar, 
  Gauge, 
  Fuel, 
  DollarSign, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Sparkles,
  CheckCheck,
  Wallet,
  X,
  FileText,
  Download,
  MessageCircle,
  Loader2
} from 'lucide-react';
import { translations } from '../i18n';
import { exportWeekendTripsPDF } from '../utils/pdfExport';

export const PersonalTripsView = ({
  personalTrips = [],
  vehicles = [],
  records = [],
  selectedVehicle = null,
  onNavigateBack,
  onOpenAddTrip,
  onEditTrip,
  onDeleteTrip,
  onToggleTripPaid,
  tripsAdvance = 0,
  onUpdateTripsAdvance,
  lang = 'ro'
}) => {
  const t = translations[lang] || translations.ro;
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'unpaid' | 'paid'
  const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);
  const [tempAdvanceInput, setTempAdvanceInput] = useState('');
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [pdfFilterStatus, setPdfFilterStatus] = useState('all');
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccessMsg, setExportSuccessMsg] = useState('');

  const handleExportPDF = async (target = 'whatsapp') => {
    try {
      setIsExporting(true);
      setExportSuccessMsg('');
      await exportWeekendTripsPDF({
        personalTrips,
        vehicles,
        selectedVehicle,
        tripsAdvance,
        filterStatus: pdfFilterStatus,
        target
      });
      setExportSuccessMsg(
        target === 'whatsapp'
          ? 'Se deschide opțiunea de trimitere pe WhatsApp / Partajare...'
          : 'Raportul PDF a fost salvat cu succes!'
      );
      setTimeout(() => {
        setExportSuccessMsg('');
        setIsPdfModalOpen(false);
      }, 2000);
    } catch (err) {
      console.error('Export error:', err);
      alert('Eroare la generarea raportului PDF.');
    } finally {
      setIsExporting(false);
    }
  };

  const advanceNum = Number(tripsAdvance) || 0;

  // Filter trips if a specific vehicle is selected
  const vehicleFilteredTrips = selectedVehicle
    ? personalTrips.filter(trip => trip.vehicleId === selectedVehicle.id)
    : personalTrips;

  // Compute stats for ALL trips (Istoric Total)
  const totalPersonalKm = vehicleFilteredTrips.reduce((sum, trip) => sum + (Number(trip.kmDriven) || 0), 0);
  const totalPersonalLiters = Number(vehicleFilteredTrips.reduce((sum, trip) => sum + (Number(trip.litersUsed) || 0), 0).toFixed(2));
  const totalPersonalCost = Number(vehicleFilteredTrips.reduce((sum, trip) => sum + (Number(trip.tripCost) || 0), 0).toFixed(2));

  // Compute stats for UNPAID trips (Rămas de Achitat)
  const unpaidTrips = vehicleFilteredTrips.filter(trip => !trip.isPaid);
  const unpaidKm = unpaidTrips.reduce((sum, trip) => sum + (Number(trip.kmDriven) || 0), 0);
  const unpaidLiters = Number(unpaidTrips.reduce((sum, trip) => sum + (Number(trip.litersUsed) || 0), 0).toFixed(2));
  const unpaidCost = Number(unpaidTrips.reduce((sum, trip) => sum + (Number(trip.tripCost) || 0), 0).toFixed(2));
  const netUnpaidCost = Number((unpaidCost - advanceNum).toFixed(2));

  // Compute stats for PAID trips (Deja Achitat)
  const paidTrips = vehicleFilteredTrips.filter(trip => trip.isPaid);
  const paidKm = paidTrips.reduce((sum, trip) => sum + (Number(trip.kmDriven) || 0), 0);
  const paidLiters = Number(paidTrips.reduce((sum, trip) => sum + (Number(trip.litersUsed) || 0), 0).toFixed(2));
  const paidCost = Number(paidTrips.reduce((sum, trip) => sum + (Number(trip.tripCost) || 0), 0).toFixed(2));

  // Active list based on status filter
  const displayedTrips = vehicleFilteredTrips.filter(trip => {
    if (statusFilter === 'unpaid') return !trip.isPaid;
    if (statusFilter === 'paid') return trip.isPaid;
    return true;
  });

  // Helper for date range
  const formatTripDateRange = (startDate, endDate) => {
    if (!startDate) return '';
    if (!endDate || startDate === endDate) {
      const parts = startDate.split('-');
      return parts.length === 3 ? `${parts[2]}.${parts[1]}.${parts[0]}` : startDate;
    }
    const [sY, sM, sD] = startDate.split('-');
    const [eY, eM, eD] = endDate.split('-');
    if (sY === eY && sM === eM) {
      return `${sD}–${eD}.${sM}.${sY}`;
    }
    return `${sD}.${sM}–${eD}.${eM}.${eY}`;
  };

  // Helper for automatic time extraction
  const getTripTime = (trip) => {
    if (trip.time) return trip.time;
    if (trip.createdAt) {
      try {
        const d = new Date(trip.createdAt);
        if (!isNaN(d.getTime())) {
          return d.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' });
        }
      } catch (e) {}
    }
    if (trip.updatedAt) {
      try {
        const d = new Date(trip.updatedAt);
        if (!isNaN(d.getTime())) {
          return d.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' });
        }
      } catch (e) {}
    }
    if (trip.id && String(trip.id).startsWith('trip_')) {
      const rawTs = String(trip.id).replace('trip_', '');
      const ts = parseInt(rawTs, 10);
      if (!isNaN(ts) && ts > 1000000000000) {
        const d = new Date(ts);
        return d.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' });
      }
    }
    return '';
  };

  // Helper for dynamic translation of trip title
  const getLocalizedTripTitle = (trip) => {
    if (!trip || !trip.title) return '';
    const weekendPattern = /^(Cursă Weekend|Curse Weekend|Weekend Trip|Weekend Trips|Trajet Week-end|Trajets Week-end|Wochenendfahrt|Wochenendfahrten|Viaggio Weekend|Viaggi Weekend|Viaje Fin de Semana|Viajes Fin de Semana|Viagem de Fim de Semana|Viagens de Fim de Semana|Weekendrit|Weekendritten|Przejazd Weekendowy|Przejazdy Weekendowe|Hafta Sonu Sürüşü|Hafta Sonu Sürüşleri|Hétvégi Utazás|Hétvégi Utazások|Víkendová Jízda|Víkendové Jízdy|주말 운행|週末走行|周末用车)/i;
    const personalPattern = /^(Cursă Personală|Curse Personale|Personal Trip|Personal Trips|Trajet Personnel|Trajets Personnels|Privatfahrt|Privatfahrten|Viaggio Personale|Viaggi Personali|Viaje Personal|Viajes Personales|Viagem Pessoal|Viagens Pessoais|Privérit|Privéritten|Przejazd Prywatny|Przejazdy Prywatne|Kişisel Sürüş|Kişisel Sürüşler|Személyes Utazás|Személyes Utazások|Osobní Jízda|Osobní Jízdy|개인 운행|個人走行|个人用车)/i;
    
    if (weekendPattern.test(trip.title)) {
      const remainder = trip.title.replace(weekendPattern, '').trim();
      const prefix = t.weekendTrip || t.weekendTrips || "Weekend Trip";
      return remainder ? `${prefix} ${remainder}` : prefix;
    }
    if (personalPattern.test(trip.title)) {
      const remainder = trip.title.replace(personalPattern, '').trim();
      const prefix = t.personalTrip || t.personalTrips || "Personal Trip";
      return remainder ? `${prefix} ${remainder}` : prefix;
    }
    return trip.title;
  };

  // Confirmation warning before switching a PAID trip back to UNPAID
  const handleToggleTripPaidClick = (trip) => {
    if (trip.isPaid) {
      const warningMessage = t.warningPaidTrip || "Atenție: Această cursă este marcată ca ACHITATĂ.\n\nSigur dorești să o treci din nou în starea NEACHITATĂ?";
      if (!window.confirm(warningMessage)) {
        return;
      }
    } else {
      // Marking an UNPAID trip as PAID: automatically deduct from advance
      if (advanceNum > 0 && onUpdateTripsAdvance) {
        const cost = Number(trip.tripCost) || 0;
        const consumed = Math.min(advanceNum, cost);
        const nextAdvance = Math.max(0, Number((advanceNum - consumed).toFixed(2)));
        onUpdateTripsAdvance(nextAdvance);
      }
    }
    if (onToggleTripPaid) {
      onToggleTripPaid(trip.id);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      
      {/* Top Action Bar */}
      <div className="flex items-end justify-between gap-2 px-1">
        {/* Partea stângă: Buton PDF deasupra butonului Înapoi */}
        <div className="flex flex-col items-start gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => {
              setPdfFilterStatus(statusFilter);
              setIsPdfModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/80 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-all cursor-pointer shadow-2xs active:scale-95"
            title="Exportă raport PDF (WhatsApp / Salvare)"
          >
            <FileText className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            <span>PDF</span>
          </button>

          <button
            onClick={onNavigateBack}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-purple-600 dark:hover:text-purple-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl shadow-2xs transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t.back || "Înapoi"}</span>
          </button>
        </div>

        {/* Partea dreaptă: Sold și Cursă Nouă Weekend */}
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {/* Button: Sold / Plată în Plus */}
          <button
            type="button"
            onClick={() => {
              setTempAdvanceInput(advanceNum > 0 ? String(advanceNum) : '');
              setIsAdvanceModalOpen(true);
            }}
            className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer shadow-2xs active:scale-95 ${
              advanceNum > 0
                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/25'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-purple-300'
            }`}
            title="Ajustează suma plătită suplimentar (avans/sold)"
          >
            <Wallet className="w-3.5 h-3.5 text-emerald-500" />
            <span>{advanceNum > 0 ? `Sold: +${advanceNum} lei` : "Sold / Plată în plus"}</span>
          </button>

          {onOpenAddTrip && (
            <button
              onClick={onOpenAddTrip}
              className="inline-flex items-center gap-1.5 text-xs font-black text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 px-3.5 py-1.5 rounded-xl shadow-md shadow-purple-500/25 transition-all active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>{t.addPersonalTripModalTitle || "Cursă Nouă Weekend"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary Header Banner */}
      <div className="bg-gradient-to-br from-purple-700 via-indigo-700 to-slate-900 rounded-3xl p-4 sm:p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-3 -bottom-4 opacity-10 pointer-events-none">
          <Navigation className="w-36 h-36" />
        </div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md px-2.5 py-1 rounded-xl text-xs font-bold mb-2">
            <Navigation className="w-3.5 h-3.5" />
            <span>
              {selectedVehicle 
                ? `${selectedVehicle.plate} • ${selectedVehicle.makeModel}` 
                : (t.allCars || "Toate Mașinile")}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            {t.weekendTrips || "Consum Personal & Decontare Curse"}
          </h2>
          <p className="text-xs text-purple-200 mt-1 max-w-md">
            {t.personalTripsDesc || "Evidența curselor personale, calculul sumelor de achitat și separarea curselor deja decontate."}
          </p>

          {/* DUAL KPI STRIP: RĂMAS DE ACHITAT + TOTAL CĂLĂTORII */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-4 border-t border-white/15">
            
            {/* 1. RĂMAS DE ACHITAT (Principal) */}
            <div className={`p-3.5 rounded-2xl border backdrop-blur-md relative overflow-hidden transition-all ${
              netUnpaidCost < 0
                ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-100'
                : 'bg-amber-500/20 border-amber-400/40 text-amber-100'
            }`}>
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${
                  netUnpaidCost < 0 ? 'text-emerald-300' : 'text-amber-300'
                }`}>
                  <Clock className="w-3.5 h-3.5" />
                  <span>{netUnpaidCost < 0 ? "Bani în Avans (Credit)" : (t.unpaidTrips || "Rămas de Achitat")}</span>
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                  netUnpaidCost < 0 ? 'bg-emerald-400 text-slate-950 font-black' : 'bg-amber-400 text-slate-950'
                }`}>
                  {netUnpaidCost < 0 
                    ? `Sold: +${advanceNum.toLocaleString('ro-RO')} lei`
                    : `${unpaidTrips.length} ${unpaidTrips.length === 1 ? (t.trip || "cursă") : (t.trips || "curse")}`}
                </span>
              </div>

              <div className={`text-2xl sm:text-3xl font-black font-mono tracking-tight my-1 ${
                netUnpaidCost < 0 ? 'text-emerald-300' : 'text-amber-300'
              }`}>
                {netUnpaidCost.toLocaleString('ro-RO')} <span className="text-sm font-bold text-white">RON</span>
              </div>

              {advanceNum > 0 && unpaidCost > 0 && (
                <div className="text-[11px] font-medium text-amber-200/90 pt-0.5 pb-1">
                  Calcul: {unpaidCost.toLocaleString('ro-RO')} RON curse - {advanceNum.toLocaleString('ro-RO')} RON avans
                </div>
              )}

              {netUnpaidCost < 0 && (
                <div className="text-[11px] font-medium text-emerald-200/90 pt-0.5 pb-1">
                  Bani achitați în plus, vor fi scăzuți automat din cursele viitoare
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-purple-100 font-semibold pt-1 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <span>🛣️ <strong>{unpaidKm.toLocaleString('ro-RO')} km</strong></span>
                  <span>• ⛽ <strong>{unpaidLiters} L</strong></span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setTempAdvanceInput(advanceNum > 0 ? String(advanceNum) : '');
                    setIsAdvanceModalOpen(true);
                  }}
                  className="text-[10.5px] font-bold text-white/90 hover:text-white underline underline-offset-2 cursor-pointer"
                >
                  {advanceNum > 0 ? "Modifică sold" : "+ Adaugă sold avans"}
                </button>
              </div>
            </div>

            {/* 2. TOTAL ISTORIC CĂLĂTORII */}
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-purple-200">
                    {t.totalFleet || "Total Istoric Călătorii:"}
                  </span>
                  <span className="text-[10.5px] font-mono font-bold text-purple-300">
                    {vehicleFilteredTrips.length} {vehicleFilteredTrips.length === 1 ? (t.trip || "cursă") : (t.trips || "curse")}
                  </span>
                </div>

                <div className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight my-1">
                  {totalPersonalCost.toLocaleString('ro-RO')} <span className="text-xs font-bold text-purple-200">RON</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-purple-200 font-medium pt-1 border-t border-white/10">
                <span>🛣️ Total: <strong>{totalPersonalKm.toLocaleString('ro-RO')} km</strong></span>
                <span className="text-emerald-300">✓ {t.paidBadge || "Achitat"}: <strong>{paidCost.toLocaleString('ro-RO')} RON</strong></span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Filter Tabs & Trips List Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xs space-y-3">
        
        {/* Header & Status Filter Pills */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
              {t.weekendTrips || "Jurnal Curse Personale"}
            </h3>
            <span className="text-xs font-bold text-slate-400">({displayedTrips.length})</span>
          </div>

          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs self-start sm:self-auto">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                statusFilter === 'all'
                  ? 'bg-purple-600 text-white shadow-xs font-black'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t.allVehiclesFilter || "Toate"} ({vehicleFilteredTrips.length})
            </button>
            <button
              onClick={() => setStatusFilter('unpaid')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                statusFilter === 'unpaid'
                  ? 'bg-amber-500 text-slate-950 shadow-xs font-black'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              ⏳ {t.unpaidBadge || "De Achitat"} ({unpaidTrips.length})
            </button>
            <button
              onClick={() => setStatusFilter('paid')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                statusFilter === 'paid'
                  ? 'bg-emerald-600 text-white shadow-xs font-black'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              ✓ {t.paidBadge || "Achitat"} ({paidTrips.length})
            </button>
          </div>
        </div>

        {displayedTrips.length === 0 ? (
          <div className="py-10 text-center">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto mb-3">
              <Navigation className="w-6 h-6" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto mb-3">
              {statusFilter === 'unpaid' 
                ? (t.allSettled || "Toate cursele personale sunt achitate! 🎉")
                : (t.noTrips || "Nicio cursă personală înregistrată încă.")}
            </p>
            {onOpenAddTrip && statusFilter === 'all' && (
              <button
                onClick={onOpenAddTrip}
                className="inline-flex items-center gap-1 text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t.addPersonalTripModalTitle || "Adaugă Cursă"}</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {displayedTrips.map((trip) => {
              const veh = vehicles.find(v => v.id === trip.vehicleId);
              const isPaid = Boolean(trip.isPaid);
              const isOngoing = !trip.endKm || trip.isOngoing;
              const tripTime = getTripTime(trip);

              return (
                <div
                  key={trip.id}
                  className={`border rounded-2xl p-3 sm:p-3.5 transition-all shadow-xs space-y-2 ${
                    isOngoing
                      ? 'bg-amber-50/90 dark:bg-amber-950/30 border-amber-400 dark:border-amber-600/60 ring-1 ring-amber-400/20 shadow-md shadow-amber-500/5'
                      : isPaid
                      ? 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800'
                      : 'bg-amber-50/70 dark:bg-amber-950/25 border-amber-300/80 dark:border-amber-900/50'
                  }`}
                >
                  {/* RÂNDUL 1: Plăcuță + Titlu în stânga | Edit + Delete în dreapta */}
                  <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-black/5 dark:border-white/5">
                    <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                      {veh && (
                        <span className="whitespace-nowrap shrink-0 inline-flex items-center bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md px-1.5 py-0.5 text-[11px] font-mono font-black text-slate-800 dark:text-slate-100 shadow-2xs">
                          <span className="text-[9px] text-blue-500 font-bold mr-1">RO</span>
                          {veh.plate}
                        </span>
                      )}
                      {trip.title && (
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                          {getLocalizedTripTitle(trip)}
                        </span>
                      )}
                      {isOngoing && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-slate-950 shadow-2xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping" />
                          <span>{t.ongoingTripTitle || "În Desfășurare"}</span>
                        </span>
                      )}
                    </div>

                    {/* Dreapta: Edit + Delete */}
                    <div className="flex items-center gap-1 shrink-0">
                      {onEditTrip && (
                        <button
                          onClick={() => onEditTrip(trip)}
                          className="p-1 text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title={t.edit || "Editează"}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {onDeleteTrip && (
                        <button
                          onClick={() => {
                            if (window.confirm(t.deleteTripConfirm || "Ștergi această cursă personală?")) {
                              onDeleteTrip(trip.id);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title={t.delete || "Șterge"}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {isOngoing ? (
                    /* SPECIAL CARD BODY FOR ONGOING TRIP */
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between gap-2 flex-wrap bg-white/70 dark:bg-slate-900/70 p-2.5 rounded-xl border border-amber-300/50 dark:border-amber-800/50">
                        <div className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <Gauge className="w-4 h-4 text-amber-500 shrink-0" />
                          <span>{t.startOdometer || "Km Început"}: <strong className="font-mono font-black text-slate-900 dark:text-white">{Number(trip.startKm).toLocaleString('ro-RO')} km</strong></span>
                        </div>
                        <button
                          onClick={() => onEditTrip && onEditTrip(trip)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-md shadow-purple-500/20 transition-all active:scale-95 cursor-pointer"
                        >
                          <span>🏁 {t.finishTripNow || "Finalizează Cursa"}</span>
                        </button>
                      </div>

                      <div className="flex flex-col gap-0.5">
                        <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{t.startDate || "Data Început"}: <strong>{formatTripDateRange(trip.startDate, trip.startDate)}</strong></span>
                        </div>
                        {tripTime && (
                          <div className="text-[10px] font-medium text-slate-400 dark:text-slate-500 flex items-center gap-1 pl-4.5">
                            <Clock className="w-2.5 h-2.5 text-amber-500 shrink-0" />
                            <span>{tripTime}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* NORMAL COMPLETED TRIP CARD */
                    <>
                      {/* RÂNDUL 2: +38 km pe stânga ÎN LINIE CU 18,53 RON pe dreapta */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="whitespace-nowrap font-black text-xs sm:text-sm bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-lg shadow-2xs inline-flex items-center gap-1">
                          <span>🛣️</span>
                          <span>+{Number(trip.kmDriven).toLocaleString('ro-RO')} km</span>
                        </div>

                        <div className="whitespace-nowrap font-mono font-black text-sm sm:text-base text-purple-700 dark:text-purple-300 bg-white dark:bg-slate-900 px-2.5 py-0.5 rounded-xl border border-purple-200 dark:border-purple-900/50 shadow-2xs">
                          {Number(trip.tripCost).toLocaleString('ro-RO')} RON
                        </div>
                      </div>

                      {/* RÂNDUL 3: Interval kilometraj (135.957 → 135.995 km) */}
                      <div className="text-[11px] font-mono text-slate-600 dark:text-slate-400 flex items-center gap-1">
                        <Gauge className="w-3 h-3 text-purple-500 shrink-0" />
                        <span className="whitespace-nowrap font-medium">
                          {Number(trip.startKm).toLocaleString('ro-RO')} km → {Number(trip.endKm).toLocaleString('ro-RO')} km
                        </span>
                      </div>

                      {/* RÂNDUL 4: Consum Litri */}
                      <div className="text-[11px] text-slate-600 dark:text-slate-300 flex items-center gap-1 pt-1.5 border-t border-slate-200/50 dark:border-slate-800/50">
                        <Fuel className="w-3 h-3 text-blue-500 shrink-0" />
                        <span className="font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                          {Number(trip.litersUsed).toFixed(2)} L
                        </span>
                        <span className="text-slate-400 text-[10px] whitespace-nowrap">
                          ({trip.avgL100} L/100 • {trip.fuelPrice} RON/L)
                        </span>
                      </div>

                      {/* RÂNDUL 5: Data și Ora sub dată pe stânga ÎN LINIE CU Butonul De Achitat / Achitat pe dreapta */}
                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/40 dark:border-slate-800/40">
                        <div className="flex flex-col">
                          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="whitespace-nowrap font-semibold">{formatTripDateRange(trip.startDate, trip.endDate)}</span>
                          </div>
                          {tripTime && (
                            <div className="text-[10px] font-medium text-slate-400 dark:text-slate-500 flex items-center gap-1 pl-4.5 mt-0.5">
                              <Clock className="w-3 h-3 text-purple-400 shrink-0" />
                              <span>{tripTime}</span>
                            </div>
                          )}
                        </div>

                        {/* Buton De Achitat / Achitat aliniat cu data */}
                        <button
                          onClick={() => handleToggleTripPaidClick(trip)}
                          className={`whitespace-nowrap inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black border transition-all cursor-pointer shadow-2xs active:scale-95 shrink-0 ${
                            isPaid
                              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25'
                              : 'bg-amber-500 text-slate-950 border-amber-500 hover:bg-amber-400 font-black shadow-amber-500/20'
                          }`}
                          title={isPaid ? (t.unpaidBadge || "De Achitat") : (t.paidBadge || "Achitat")}
                        >
                          {isPaid ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                              <span>✓ {t.paidBadge || "Achitat"}</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3.5 h-3.5" />
                              <span>⏳ {t.unpaidBadge || "De Achitat"}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </>
                  )}

                  {/* Observații opționale dacă există */}
                  {trip.notes && (
                    <p className="mt-1 text-[10.5px] text-slate-500 dark:text-slate-400 italic bg-white dark:bg-slate-900 p-1.5 rounded-lg border border-slate-200/60 dark:border-slate-800/60 truncate">
                      „{trip.notes}”
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Ajustare Sold / Plată în Plus (Avans) */}
      {isAdvanceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-900/60 rounded-3xl p-5 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-2xl bg-purple-500/15 text-purple-600 dark:text-purple-400">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    Sold / Plată în Plus la Curse
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Bani plătiți suplimentar, scăzuți automat din cursele viitoare
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAdvanceModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Suma plătită în plus față de total (RON)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={tempAdvanceInput}
                  onChange={(e) => setTempAdvanceInput(e.target.value)}
                  placeholder="ex: 5.00"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-lg font-mono font-black text-slate-900 dark:text-white outline-none focus:border-purple-500 transition-colors"
                  autoFocus
                />
                <span className="absolute right-4 top-3.5 font-bold text-xs text-slate-400">
                  RON
                </span>
              </div>

              {/* Butoane rapide de adăugare / preset */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[11px] text-slate-400 font-semibold mr-1">Preset:</span>
                {[5, 10, 20, 50].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => {
                      const cur = parseFloat(tempAdvanceInput) || 0;
                      setTempAdvanceInput(String(cur + val));
                    }}
                    className="px-2.5 py-1 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-300 text-xs font-bold border border-purple-500/20 transition-colors cursor-pointer"
                  >
                    +{val} lei
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setTempAdvanceInput('0')}
                  className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 text-xs font-bold ml-auto transition-colors cursor-pointer"
                >
                  Reset la 0
                </button>
              </div>

              <div className="bg-purple-50/70 dark:bg-purple-950/30 p-3 rounded-2xl border border-purple-200/60 dark:border-purple-900/40 text-xs text-purple-900 dark:text-purple-200 space-y-1">
                <p className="font-semibold">💡 Cum funcționează:</p>
                <p className="text-[11.5px] text-purple-800 dark:text-purple-300/90 leading-relaxed">
                  Când toate cursele sunt achitate, această sumă apare ca <strong>-{tempAdvanceInput || 0} RON</strong> la curse neachitate. La următoarea cursă închisă, banii din sold se vor scădea automat din totalul calculat, iar soldul va reveni la 0 lei!
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsAdvanceModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Anulează
              </button>
              <button
                type="button"
                onClick={() => {
                  const val = Math.max(0, parseFloat(tempAdvanceInput) || 0);
                  if (onUpdateTripsAdvance) {
                    onUpdateTripsAdvance(val);
                  }
                  setIsAdvanceModalOpen(false);
                }}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-black shadow-md shadow-purple-500/20 cursor-pointer"
              >
                Salvează Sold
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Export PDF & WhatsApp */}
      {isPdfModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 max-w-md w-full shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                    Export Raport PDF
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Curse Weekend, Fond & Bani în Avans
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPdfModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Selector Filtru */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Curse incluse în raport:
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setPdfFilterStatus('all')}
                  className={`py-1.5 px-2 rounded-lg font-bold text-center transition-all ${
                    pdfFilterStatus === 'all'
                      ? 'bg-purple-600 text-white shadow-xs font-black'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Toate ({vehicleFilteredTrips.length})
                </button>
                <button
                  type="button"
                  onClick={() => setPdfFilterStatus('unpaid')}
                  className={`py-1.5 px-2 rounded-lg font-bold text-center transition-all ${
                    pdfFilterStatus === 'unpaid'
                      ? 'bg-amber-500 text-slate-950 shadow-xs font-black'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Neachitate ({unpaidTrips.length})
                </button>
                <button
                  type="button"
                  onClick={() => setPdfFilterStatus('paid')}
                  className={`py-1.5 px-2 rounded-lg font-bold text-center transition-all ${
                    pdfFilterStatus === 'paid'
                      ? 'bg-emerald-600 text-white shadow-xs font-black'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Achitate ({paidTrips.length})
                </button>
              </div>
            </div>

            {/* Preview Card */}
            <div className="bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                <span>Vehicul:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {selectedVehicle ? selectedVehicle.plate : "Toate vehiculele"}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                <span>Total cost curse selectate:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {(pdfFilterStatus === 'unpaid' ? unpaidCost : pdfFilterStatus === 'paid' ? paidCost : totalPersonalCost).toFixed(2)} lei
                </span>
              </div>
              <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400 font-bold border-t border-slate-200/60 dark:border-slate-800/60 pt-1.5">
                <span>Sold / Bani în avans (plată în plus):</span>
                <span>+{advanceNum.toFixed(2)} lei</span>
              </div>
              <div className="flex justify-between items-center font-extrabold text-slate-900 dark:text-white pt-1">
                <span>Net rămas de achitat:</span>
                <span className={netUnpaidCost < 0 ? 'text-emerald-500' : 'text-amber-500'}>
                  {netUnpaidCost < 0 ? `${netUnpaidCost.toFixed(2)} lei (Credit avans)` : `${netUnpaidCost.toFixed(2)} lei`}
                </span>
              </div>
            </div>

            {exportSuccessMsg && (
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs text-center font-bold animate-in fade-in">
                {exportSuccessMsg}
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              {/* WhatsApp / Distribuie */}
              <button
                type="button"
                disabled={isExporting}
                onClick={() => handleExportPDF('whatsapp')}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white text-xs font-black shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
              >
                {isExporting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <MessageCircle className="w-4 h-4" />
                )}
                <span>Trimite PDF pe WhatsApp / Partajează</span>
              </button>

              {/* Descarcă PDF */}
              <button
                type="button"
                disabled={isExporting}
                onClick={() => handleExportPDF('download')}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
              >
                <Download className="w-4 h-4 text-rose-500" />
                <span>Descarcă fișier PDF</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

