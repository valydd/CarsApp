import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Navigation, 
  Calendar, 
  Gauge, 
  Fuel, 
  DollarSign, 
  Check, 
  AlertCircle, 
  ScanLine, 
  Camera, 
  Clock, 
  Flag, 
  ChevronDown, 
  ChevronUp,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { translations } from '../i18n';
import { calculateVehicleConsumption } from '../utils/calculations';
import { ReceiptScanModal } from './ReceiptScanModal';

export const AddPersonalTripModal = ({
  isOpen,
  onClose,
  onSaveTrip,
  tripToEdit = null,
  vehicles = [],
  records = [],
  personalTrips = [],
  defaultVehicleId = '',
  lang = 'ro'
}) => {
  const t = translations[lang] || translations.ro;

  const getCurrentTimeStr = () => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  };

  const endKmInputRef = useRef(null);
  const startKmInputRef = useRef(null);

  const [vehicleId, setVehicleId] = useState('');
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [tripTime, setTripTime] = useState(getCurrentTimeStr());
  const [startKm, setStartKm] = useState('');
  const [endKm, setEndKm] = useState('');
  const [customAvgL100, setCustomAvgL100] = useState('');
  const [customFuelPrice, setCustomFuelPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [isPaid, setIsPaid] = useState(false);
  const [isReceiptScanOpen, setIsReceiptScanOpen] = useState(false);
  const [scannedReceipt, setScannedReceipt] = useState(null);
  const [showAdvancedDetails, setShowAdvancedDetails] = useState(false);
  const [isMultiDay, setIsMultiDay] = useState(false);

  // Helper to find latest odometer for vehicle
  const getLatestVehicleKm = (vId) => {
    if (!vId) return '';
    const veh = vehicles.find(v => v.id === vId);
    let maxKm = Number(veh?.currentKm) || 0;

    (records || []).forEach(r => {
      if (r && r.vehicleId === vId && r.odometer) {
        const odo = Number(r.odometer) || 0;
        if (odo > maxKm) maxKm = odo;
      }
    });

    (personalTrips || []).forEach(t => {
      if (t && t.vehicleId === vId) {
        const e = Number(t.endKm) || 0;
        const s = Number(t.startKm) || 0;
        if (e > maxKm) maxKm = e;
        else if (s > maxKm) maxKm = s;
      }
    });

    return maxKm > 0 ? String(maxKm) : '';
  };

  const formatDateToDisplay = (dStr) => {
    if (!dStr) return '';
    const parts = dStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}.${parts[1]}.${parts[0]}`;
    }
    return dStr;
  };

  const handleStartDateChange = (val) => {
    setStartDate(val);
    if (!endDate || endDate < val || !isMultiDay) {
      setEndDate(val);
    }
    const disp = formatDateToDisplay(val);
    setTitle((prev) => {
      const prefix = t.weekendTrip || t.weekendTrips || "Cursă Weekend";
      if (!prev) {
        return `${prefix} (${disp})`;
      }
      if (prev.includes('(') && prev.includes(')')) {
        return prev.replace(/\(.*?\)/, `(${disp})`);
      }
      return `${prev} (${disp})`;
    });
  };

  const triggerPicker = (e) => {
    try {
      if (e.target && typeof e.target.showPicker === 'function') {
        e.target.showPicker();
      }
    } catch (_) {}
  };

  const handleApplyReceiptData = (data) => {
    if (!data) return;
    setScannedReceipt(data);
    if (data.date) {
      handleStartDateChange(data.date);
    }
    if (data.time) {
      setTripTime(data.time);
    }
    if (data.pricePerLiter) {
      setCustomFuelPrice(data.pricePerLiter.toString());
    } else if (data.amount && data.liters && Number(data.liters) > 0) {
      setCustomFuelPrice((Number(data.amount) / Number(data.liters)).toFixed(2));
    }
    const fuelName = data.fuelType === 'diesel' ? 'Motorină' : data.fuelType === 'gpl' ? 'GPL' : 'Benzină';
    const stationText = data.station ? `Bon ${data.station}` : 'Bon Carburant';
    const detailsText = `${stationText}: ${data.amount ? data.amount + ' RON' : ''} ${data.liters ? `(${data.liters} L ${fuelName})` : ''}`.trim();
    setNotes(prev => prev ? `${prev} | ${detailsText}` : detailsText);
  };

  // Selected vehicle object
  const currentVeh = vehicles.find(v => v.id === vehicleId) || vehicles[0];

  // Calculate fleet / vehicle fuel stats
  const vehicleFuelRecords = records.filter(r => r.vehicleId === (currentVeh?.id || '') && r.category === 'fuel');
  const fuelStats = calculateVehicleConsumption(vehicleFuelRecords);
  const detectedAvgL100 = fuelStats.avgLitersPer100Km || 6.5;

  const totalFuelCost = vehicleFuelRecords.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
  const totalFuelLiters = vehicleFuelRecords.reduce((sum, r) => sum + (Number(r.details?.liters) || 0), 0);
  const detectedFuelPrice = totalFuelLiters > 0 ? Number((totalFuelCost / totalFuelLiters).toFixed(2)) : 7.50;

  // Active calculation variables
  const effectiveAvgL100 = customAvgL100 !== '' ? Number(customAvgL100) : detectedAvgL100;
  const effectiveFuelPrice = customFuelPrice !== '' ? Number(customFuelPrice) : detectedFuelPrice;

  const sKm = Number(startKm) || 0;
  const eKm = endKm !== '' ? Number(endKm) : null;
  const isOngoing = eKm === null;
  const kmDriven = !isOngoing && eKm > sKm ? eKm - sKm : 0;
  const calculatedLiters = isOngoing ? 0 : Number(((kmDriven / 100) * effectiveAvgL100).toFixed(2));
  const calculatedCost = isOngoing ? 0 : ((fuelStats.costPerKm && customAvgL100 === '' && customFuelPrice === '')
    ? Number((kmDriven * fuelStats.costPerKm).toFixed(2))
    : Number((calculatedLiters * effectiveFuelPrice).toFixed(2)));

  const isFinishingOngoing = Boolean(tripToEdit && (!tripToEdit.endKm || tripToEdit.isOngoing));

  // Initialize or reset form
  useEffect(() => {
    if (tripToEdit) {
      setVehicleId(tripToEdit.vehicleId || '');
      setTitle(tripToEdit.title || '');
      setStartDate(tripToEdit.startDate || '');
      const isMulti = Boolean(tripToEdit.endDate && tripToEdit.endDate !== tripToEdit.startDate);
      setIsMultiDay(isMulti);
      setEndDate(tripToEdit.endDate || tripToEdit.startDate || '');
      setTripTime(tripToEdit.time || (tripToEdit.createdAt ? new Date(tripToEdit.createdAt).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' }) : getCurrentTimeStr()));
      setStartKm(tripToEdit.startKm !== undefined && tripToEdit.startKm !== null ? String(tripToEdit.startKm) : '');
      setEndKm(tripToEdit.endKm !== undefined && tripToEdit.endKm !== null ? String(tripToEdit.endKm) : '');
      setCustomAvgL100(tripToEdit.avgL100 ? String(tripToEdit.avgL100) : '');
      setCustomFuelPrice(tripToEdit.fuelPrice ? String(tripToEdit.fuelPrice) : '');
      setNotes(tripToEdit.notes || '');
      setIsPaid(Boolean(tripToEdit.isPaid));
      setShowAdvancedDetails(false);

      // Auto-focus the endKm input if finishing an ongoing trip
      if (!tripToEdit.endKm || tripToEdit.isOngoing) {
        setTimeout(() => {
          endKmInputRef.current?.focus();
        }, 150);
      }
    } else {
      const vId = defaultVehicleId || (vehicles[0]?.id || '');
      setVehicleId(vId);
      const todayStr = new Date().toISOString().slice(0, 10);
      const formattedToday = formatDateToDisplay(todayStr);
      const prefix = t.weekendTrip || t.weekendTrips || "Cursă Weekend";
      setTitle(`${prefix} (${formattedToday})`);
      setStartDate(todayStr);
      setEndDate(todayStr);
      setIsMultiDay(false);
      setTripTime(getCurrentTimeStr());
      
      // Auto-suggest starting km from vehicle's latest odometer
      const suggestedKm = getLatestVehicleKm(vId);
      setStartKm(suggestedKm);
      setEndKm('');
      setCustomAvgL100('');
      setCustomFuelPrice('');
      setNotes('');
      setIsPaid(false);
      setShowAdvancedDetails(false);

      // When starting a new trip, ALWAYS focus startKm so the user can immediately edit or confirm it!
      setTimeout(() => {
        startKmInputRef.current?.focus();
      }, 150);
    }
  }, [isOpen, tripToEdit, defaultVehicleId, vehicles]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!vehicleId) {
      alert(t.selectVehicle || "Selectează vehiculul!");
      return;
    }
    if (sKm <= 0) {
      alert(t.startKm || "Introdu kilometrajul de început!");
      return;
    }
    if (eKm !== null && eKm <= sKm) {
      alert("Kilometrajul de final trebuie să fie mai mare decât cel de început!");
      return;
    }

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const tripData = {
      id: tripToEdit ? tripToEdit.id : `trip_${Date.now()}`,
      vehicleId,
      title: title.trim() || (t.personalTrips || "Cursă Personală"),
      startDate,
      endDate: endDate || startDate,
      startKm: sKm,
      endKm: eKm,
      isOngoing,
      kmDriven,
      avgL100: effectiveAvgL100,
      fuelPrice: effectiveFuelPrice,
      litersUsed: calculatedLiters,
      tripCost: calculatedCost,
      isPaid: Boolean(isPaid),
      notes: notes.trim(),
      time: tripTime || timeStr,
      createdAt: tripToEdit?.createdAt || now.toISOString(),
      updatedAt: now.toISOString()
    };

    onSaveTrip(tripData);
    onClose();
  };

  const latestSuggested = getLatestVehicleKm(vehicleId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[94vh]">
        
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-xs ${
              isFinishingOngoing 
                ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400' 
                : 'bg-purple-500/20 text-purple-600 dark:text-purple-400'
            }`}>
              {isFinishingOngoing ? <Flag className="w-5 h-5" /> : <Navigation className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                {isFinishingOngoing 
                  ? "🏁 Finalizează Cursa Weekend" 
                  : tripToEdit 
                  ? (t.editPersonalTrip || "Editează Cursă Weekend")
                  : (t.addPersonalTripModalTitle || "Cursă Nouă Weekend")}
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isFinishingOngoing
                  ? "Introdu kilometrajul de final pentru a calcula decontul"
                  : (t.addPersonalTripSubtitle || "Kilometraj, dată, oră și calcul consum")}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          
          {/* SECȚIUNEA 1: VEHICUL */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t.selectVehicle || "Vehicul"}
            </label>
            <select
              value={vehicleId}
              onChange={(e) => {
                const nextId = e.target.value;
                setVehicleId(nextId);
                if (!tripToEdit) {
                  const sug = getLatestVehicleKm(nextId);
                  if (sug) setStartKm(sug);
                }
              }}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/30 outline-hidden"
              required
            >
              {vehicles.map((veh) => (
                <option key={veh.id} value={veh.id}>
                  {veh.plate} - {veh.makeModel}
                </option>
              ))}
            </select>
          </div>

          {/* SECȚIUNEA 2: KILOMETRAJ (START & SFÂRȘIT) - POZIȚIE PRIORITARĂ LA ÎNCEPUTUL PAGINII */}
          {isFinishingOngoing ? (
            /* SPECIAL FOCUSED CARD CÂND SE FINALIZEAZĂ O CURSĂ ÎN DESFĂȘURARE */
            <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border-2 border-amber-400/80 dark:border-amber-600/70 shadow-sm space-y-3">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                  <Flag className="w-4 h-4 text-amber-500" />
                  <span>Kilometraj Cursă</span>
                </span>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-200/80 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 font-extrabold">
                  În Desfășurare
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 items-center">
                <div className="bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-xl border border-amber-300/60 dark:border-amber-800/60">
                  <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-0.5 truncate">
                    KM PLECARE (START)
                  </span>
                  <input
                    type="number"
                    value={startKm}
                    onChange={(e) => setStartKm(e.target.value)}
                    className="w-full font-mono font-black text-sm sm:text-base text-slate-800 dark:text-slate-200 bg-transparent outline-none"
                    required
                  />
                </div>

                <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border-2 border-purple-500 shadow-md ring-2 ring-purple-500/20">
                  <label className="text-[10px] sm:text-[11px] font-black text-purple-700 dark:text-purple-300 block mb-0.5 truncate">
                    👉 KM SOSIRE *
                  </label>
                  <input
                    ref={endKmInputRef}
                    autoFocus
                    type="number"
                    value={endKm}
                    onChange={(e) => setEndKm(e.target.value)}
                    placeholder="Km final"
                    className="w-full font-mono font-black text-sm sm:text-base text-purple-700 dark:text-purple-300 bg-transparent outline-none placeholder:text-slate-300 dark:placeholder:text-slate-600 placeholder:text-xs placeholder:font-medium"
                    required
                  />
                </div>
              </div>

              {/* Butoane rapide de adăugare km */}
              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                <span className="text-[10.5px] font-semibold text-slate-500 dark:text-slate-400 mr-1">
                  Adaugă rapid la plecare:
                </span>
                {[10, 25, 50, 100].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => {
                      if (sKm > 0) setEndKm(String(sKm + val));
                    }}
                    className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-900 border border-amber-300/80 dark:border-amber-700 text-slate-700 dark:text-slate-300 font-bold text-[11px] hover:border-purple-400 transition-colors cursor-pointer"
                  >
                    +{val} km
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* CARD PENTRU CURSĂ NOUĂ - KM ÎNCEPUT EVIDENȚIAT */
            <div className="p-3.5 sm:p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/80 dark:border-purple-900/60 shadow-xs space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-1.5 text-purple-900 dark:text-purple-300">
                  <Gauge className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span>Kilometraj Cursă (Plecare & Sosire)</span>
                </span>
                {latestSuggested && (
                  <button
                    type="button"
                    onClick={() => setStartKm(latestSuggested)}
                    className="text-[10.5px] px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-700 dark:text-purple-300 font-bold hover:bg-purple-500/25 transition-colors cursor-pointer"
                  >
                    📍 Sugerat: {Number(latestSuggested).toLocaleString('ro-RO')} km
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2.5 items-start">
                {/* KM ÎNCEPUT - EVIDENȚIAT LA PORNIREA CURSEI NOI */}
                <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border-2 border-purple-500 shadow-md ring-2 ring-purple-500/20">
                  <label className="text-[10px] sm:text-[11px] font-black text-purple-700 dark:text-purple-300 block mb-0.5 truncate">
                    👉 KM ÎNCEPUT *
                  </label>
                  <input
                    ref={startKmInputRef}
                    autoFocus
                    type="number"
                    value={startKm}
                    onChange={(e) => setStartKm(e.target.value)}
                    placeholder="Km plecare"
                    className="w-full font-mono font-black text-sm sm:text-base text-purple-700 dark:text-purple-300 bg-transparent outline-none placeholder:text-slate-300 dark:placeholder:text-slate-600 placeholder:text-xs placeholder:font-medium"
                    required
                  />
                  {latestSuggested && startKm !== latestSuggested && (
                    <button
                      type="button"
                      onClick={() => setStartKm(latestSuggested)}
                      className="text-[9.5px] font-bold text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 mt-1 block truncate transition-colors cursor-pointer"
                    >
                      Copiază ({Number(latestSuggested).toLocaleString('ro-RO')})
                    </button>
                  )}
                </div>

                {/* KM SFÂRȘIT - OPȚIONAL */}
                <div className="bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                  <label className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-0.5 truncate">
                    🏁 KM SFÂRȘIT
                  </label>
                  <input
                    ref={endKmInputRef}
                    type="number"
                    value={endKm}
                    onChange={(e) => setEndKm(e.target.value)}
                    placeholder="Opțional"
                    className="w-full font-mono font-bold text-sm sm:text-base text-slate-800 dark:text-slate-200 bg-transparent outline-none placeholder:text-slate-300 dark:placeholder:text-slate-600 placeholder:text-xs placeholder:font-medium"
                  />
                  <span className="text-[9.5px] font-semibold text-purple-600 dark:text-purple-400 mt-1 block truncate">
                    {t.optionalNow || "(Opțional acum)"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* SECȚIUNEA 3: DATA ȘI ORA (COMPLET EDITABILE, TOUCH-FRIENDLY, RAPID DE ACCESAT) */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-purple-500" />
                <span>Dată & Oră (Apasă pentru modificare)</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleStartDateChange(new Date().toISOString().slice(0, 10))}
                  className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-700 dark:text-purple-300 hover:bg-purple-500/20 text-[10.5px] font-black transition-colors cursor-pointer"
                >
                  📅 Azi
                </button>
                <button
                  type="button"
                  onClick={() => setTripTime(getCurrentTimeStr())}
                  className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-700 dark:text-purple-300 hover:bg-purple-500/20 text-[10.5px] font-black transition-colors cursor-pointer"
                >
                  ⏰ Acum
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  {t.startDate || "Data Cursă"} *
                </label>
                <input
                  type="date"
                  value={startDate}
                  onClick={triggerPicker}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/40 outline-hidden cursor-pointer"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  {t.time || "Ora Cursă"}
                </label>
                <input
                  type="time"
                  value={tripTime}
                  onClick={triggerPicker}
                  onChange={(e) => setTripTime(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/40 outline-hidden cursor-pointer"
                />
              </div>
            </div>

            {/* Opțiune Cursă pe mai multe zile (ex: Weekend întreg) */}
            <div className="pt-1 border-t border-slate-200/60 dark:border-slate-800/60">
              {!isMultiDay ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsMultiDay(true);
                    if (!endDate || endDate < startDate) setEndDate(startDate);
                  }}
                  className="text-[11px] text-purple-600 dark:text-purple-400 font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>+ Setează dată sfârșit diferită (weekend prelungit)</span>
                </button>
              ) : (
                <div className="space-y-1.5 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                      {t.endDate || "Data Sfârșit (Sosire)"}
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsMultiDay(false);
                        setEndDate(startDate);
                      }}
                      className="text-[10px] text-slate-400 hover:text-rose-500 cursor-pointer"
                    >
                      Anulează dată sfârșit separată
                    </button>
                  </div>
                  <input
                    type="date"
                    value={endDate}
                    onClick={triggerPicker}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/40 outline-hidden cursor-pointer"
                    required
                  />
                </div>
              )}
            </div>
          </div>

          {/* SECȚIUNEA 4: CALCUL LIVE (DISTANȚĂ, CONSUM, COST) */}
          {sKm > 0 && (
            isOngoing ? (
              <div className="bg-amber-500/10 dark:bg-amber-950/30 border border-amber-500/40 rounded-2xl p-3 space-y-1.5 animate-in fade-in">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-black text-xs">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                  <span>{t.ongoingTripTitle || "Cursă În Desfășurare (Activă)"}</span>
                </div>
                <p className="text-[11px] text-amber-700/90 dark:text-amber-300/90">
                  {t.ongoingTripSubtitle || "Cursă activă fără kilometraj de final"} ({sKm.toLocaleString('ro-RO')} km). O poți finaliza oricând la sosire.
                </p>
              </div>
            ) : (
              <div className="bg-purple-500/10 dark:bg-purple-950/30 border border-purple-500/30 rounded-2xl p-3.5 space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-purple-900 dark:text-purple-300">
                    {t.distanceDriven || "Distanță Parcursă:"}
                  </span>
                  <span className="font-mono font-black text-sm text-purple-700 dark:text-purple-300">
                    +{kmDriven.toLocaleString('ro-RO')} km
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 dark:text-slate-400">
                    {t.estimatedFuelUsed || "Consum Estimat:"}
                  </span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {calculatedLiters} L <span className="text-[10px] text-slate-400">({effectiveAvgL100} L/100)</span>
                  </span>
                </div>

                <div className="pt-2 border-t border-purple-500/20 flex items-center justify-between text-xs">
                  <span className="font-black text-slate-900 dark:text-white">
                    {t.calculatedPersonalCost || "Cost Total Personal:"}
                  </span>
                  <span className="font-mono font-black text-base text-purple-600 dark:text-purple-400">
                    {calculatedCost.toLocaleString('ro-RO')} RON
                  </span>
                </div>

                <div className="text-[10.5px] text-slate-500 dark:text-slate-400 pt-0.5">
                  {`(${effectiveAvgL100} L/100km • ${effectiveFuelPrice} RON/L)`}
                </div>
              </div>
            )
          )}

          {/* SECȚIUNEA 5: DETALII OPȚIONALE (TITLU, BON, CONSUM, OBSERVAȚII) */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowAdvancedDetails(!showAdvancedDetails)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950/60 hover:bg-slate-100 dark:hover:bg-slate-800/60 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between transition-colors cursor-pointer"
            >
              <span>{showAdvancedDetails ? "Ascunde detalii opționale" : "+ Detalii opționale (Titlu, Bon, Preț, Note)"}</span>
              {showAdvancedDetails ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>

            {showAdvancedDetails && (
              <div className="p-3.5 space-y-3.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 animate-in fade-in">
                {/* Titlu / Descriere Cursă */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t.periodDesc || "Titlu / Destinație Cursă"}
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="ex: Cursă Weekend - Pitești, Cumpărături..."
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-hidden focus:ring-2 focus:ring-purple-500/30"
                  />
                </div>

                {/* Scanare Bon Carburant */}
                <div className="p-2.5 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-500/20 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <ScanLine className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      Scanare Bon Carburant (Opțional)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsReceiptScanOpen(true)}
                    className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs cursor-pointer shrink-0"
                  >
                    <Camera className="w-3 h-3" />
                    <span>Scanează</span>
                  </button>
                </div>

                {/* Preț per litru & Consum mediu */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block text-[10.5px] font-bold text-slate-600 dark:text-slate-400 mb-0.5">
                      Preț carburant (RON/L)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={customFuelPrice}
                      onChange={(e) => setCustomFuelPrice(e.target.value)}
                      placeholder={detectedFuelPrice.toString()}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 font-bold text-xs text-slate-900 dark:text-white outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10.5px] font-bold text-slate-600 dark:text-slate-400 mb-0.5">
                      Consum mediu (L/100km)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={customAvgL100}
                      onChange={(e) => setCustomAvgL100(e.target.value)}
                      placeholder={detectedAvgL100.toString()}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 font-bold text-xs text-slate-900 dark:text-white outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                {/* Observații */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t.notes || "Observații"}
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Mențiuni opționale..."
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-hidden focus:ring-2 focus:ring-purple-500/30"
                  />
                </div>

                {/* Status Achitat */}
                {!isOngoing && (
                  <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                        {t.settledTrip || "Cursă Deja Achitată / Decontată"}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                        Bifează dacă banii au fost deja achitați
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isPaid}
                        onChange={(e) => setIsPaid(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5.5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* SECȚIUNEA 6: BUTON SALVARE / FINALIZEAZĂ (MARE, ACCESIBIL) */}
          <div className="pt-2">
            <button
              type="submit"
              className={`w-full py-3.5 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 ${
                isOngoing
                  ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 shadow-amber-500/25'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-purple-500/25'
              }`}
            >
              {isOngoing ? (
                <>
                  <span>⏳</span>
                  <span>{t.saveTripInProgress || "Salvează Cursa (În Desfășurare)"}</span>
                </>
              ) : isFinishingOngoing ? (
                <>
                  <span>🏁</span>
                  <span>Finalizează & Salvează Cursa</span>
                </>
              ) : tripToEdit ? (
                <>
                  <span>✓</span>
                  <span>{t.updateTrip || "Actualizează Cursa"}</span>
                </>
              ) : (
                <>
                  <span>✓</span>
                  <span>{t.finishAndSave || "Salvează & Calculează Cursa"}</span>
                </>
              )}
            </button>
          </div>

        </form>

        <ReceiptScanModal
          isOpen={isReceiptScanOpen}
          onClose={() => setIsReceiptScanOpen(false)}
          onApplyData={handleApplyReceiptData}
          initialFuelType={currentVeh?.fuelType || 'petrol'}
          lang={lang}
        />

      </div>
    </div>
  );
};
