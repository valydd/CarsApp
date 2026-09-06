import React, { useState, useEffect } from 'react';
import { X, Navigation, Calendar, Gauge, Fuel, DollarSign, Check, AlertCircle } from 'lucide-react';
import { translations } from '../i18n';
import { calculateVehicleConsumption } from '../utils/calculations';

export const AddPersonalTripModal = ({
  isOpen,
  onClose,
  onSaveTrip,
  tripToEdit = null,
  vehicles = [],
  records = [],
  defaultVehicleId = '',
  lang = 'ro'
}) => {
  const t = translations[lang] || translations.ro;

  const [vehicleId, setVehicleId] = useState('');
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startKm, setStartKm] = useState('');
  const [endKm, setEndKm] = useState('');
  const [customAvgL100, setCustomAvgL100] = useState('');
  const [customFuelPrice, setCustomFuelPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [isPaid, setIsPaid] = useState(false);

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

  // Initialize or reset form
  useEffect(() => {
    if (tripToEdit) {
      setVehicleId(tripToEdit.vehicleId || '');
      setTitle(tripToEdit.title || '');
      setStartDate(tripToEdit.startDate || '');
      setEndDate(tripToEdit.endDate || '');
      setStartKm(tripToEdit.startKm ? String(tripToEdit.startKm) : '');
      setEndKm(tripToEdit.endKm ? String(tripToEdit.endKm) : '');
      setCustomAvgL100(tripToEdit.avgL100 ? String(tripToEdit.avgL100) : '');
      setCustomFuelPrice(tripToEdit.fuelPrice ? String(tripToEdit.fuelPrice) : '');
      setNotes(tripToEdit.notes || '');
      setIsPaid(Boolean(tripToEdit.isPaid));
    } else {
      const vId = defaultVehicleId || (vehicles[0]?.id || '');
      const veh = vehicles.find(v => v.id === vId);
      setVehicleId(vId);
      const todayStr = new Date().toISOString().slice(0, 10);
      setTitle(lang === 'en' ? `Weekend Trip (${todayStr})` : `Cursă Weekend (${todayStr})`);
      setStartDate(todayStr);
      setEndDate(todayStr);
      setStartKm(veh?.currentKm ? String(veh.currentKm) : '');
      setEndKm('');
      setCustomAvgL100('');
      setCustomFuelPrice('');
      setNotes('');
      setIsPaid(false);
    }
  }, [isOpen, tripToEdit, defaultVehicleId, vehicles]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!vehicleId) {
      alert("Selectează vehiculul!");
      return;
    }
    if (sKm <= 0) {
      alert("Introdu kilometrajul de început!");
      return;
    }
    if (eKm !== null && eKm <= sKm) {
      alert("Kilometrajul de final trebuie să fie mai mare decât cel de început!");
      return;
    }

    const tripData = {
      id: tripToEdit ? tripToEdit.id : `trip_${Date.now()}`,
      vehicleId,
      title: title.trim() || (lang === 'en' ? "Personal Trip" : "Cursă Personală"),
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
      updatedAt: new Date().toISOString()
    };

    onSaveTrip(tripData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Navigation className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                {tripToEdit 
                  ? (lang === 'en' ? "Edit Personal Trip" : "Editează Cursă Personală")
                  : (lang === 'en' ? "Add Personal / Weekend Trip" : "Cursă Nouă Personală / Weekend")}
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {lang === 'en' ? "Calculates personal fuel consumption & costs" : "Calculează consumul și costul carburantului"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          
          {/* 1. Select Vehicle */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {t.selectVehicle || (lang === 'en' ? "Vehicle" : "Vehicul")}
            </label>
            <select
              value={vehicleId}
              onChange={(e) => {
                const newId = e.target.value;
                setVehicleId(newId);
                const v = vehicles.find(veh => veh.id === newId);
                if (v?.currentKm && !startKm) {
                  setStartKm(String(v.currentKm));
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

          {/* 2. Trip Title / Period */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {lang === 'en' ? "Period Description / Title" : "Descriere Perioadă (ex: Weekend, Concediu)"}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={lang === 'en' ? "e.g. Weekend 29-30 Aug" : "ex: Weekend 29-30 Aug, Deplasare munte"}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/30 outline-hidden"
              required
            />
          </div>

          {/* 3. Dates (Start & End) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-purple-500" />
                <span>{lang === 'en' ? "Start Date" : "Data Început"}</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/30 outline-hidden"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-purple-500" />
                <span>{lang === 'en' ? "End Date" : "Data Sfârșit"}</span>
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/30 outline-hidden"
                required
              />
            </div>
          </div>

          {/* 4. Odometer: Start Km & End Km */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                <Gauge className="w-3 h-3 text-purple-500" />
                <span>{lang === 'en' ? "Start Odometer (km)" : "Km Început"}</span>
              </label>
              <input
                type="number"
                value={startKm}
                onChange={(e) => setStartKm(e.target.value)}
                placeholder="ex: 136200"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/30 outline-hidden"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Gauge className="w-3 h-3 text-purple-500" />
                  <span>{lang === 'en' ? "End Odometer (km)" : "Km Sfârșit"}</span>
                </span>
                <span className="text-[10px] font-normal text-purple-600 dark:text-purple-400">
                  (Opțional acum)
                </span>
              </label>
              <input
                type="number"
                value={endKm}
                onChange={(e) => setEndKm(e.target.value)}
                placeholder="ex: 136450 (sau lasă liber)"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/30 outline-hidden"
              />
            </div>
          </div>

          {/* LIVE COMPUTED RESULT CARD */}
          {isOngoing ? (
            <div className="bg-amber-500/10 dark:bg-amber-950/30 border border-amber-500/30 rounded-2xl p-3.5 space-y-1.5 animate-in fade-in">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-black text-xs">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                <span>Cursă În Desfășurare (Activă)</span>
              </div>
              <p className="text-[11px] text-amber-700/90 dark:text-amber-300/90">
                Ai completat kilometrajul de început ({sKm.toLocaleString('ro-RO')} km). Poți salva cursa acum, iar când o termini vei introduce kilometrajul de final pentru a calcula distanța și costul.
              </p>
            </div>
          ) : (
            <div className="bg-purple-500/10 dark:bg-purple-950/30 border border-purple-500/30 rounded-2xl p-3.5 space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-purple-900 dark:text-purple-300">
                  {lang === 'en' ? "Distance Driven:" : "Distanță Parcursă:"}
                </span>
                <span className="font-mono font-black text-sm text-purple-700 dark:text-purple-300">
                  +{kmDriven.toLocaleString('ro-RO')} km
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400">
                  {lang === 'en' ? "Estimated Fuel Used:" : "Consum Estimat:"}
                </span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {calculatedLiters} L <span className="text-[10px] text-slate-400">({effectiveAvgL100} L/100)</span>
                </span>
              </div>

              <div className="pt-2 border-t border-purple-500/20 flex items-center justify-between text-xs">
                <span className="font-black text-slate-900 dark:text-white">
                  {lang === 'en' ? "Calculated Personal Cost:" : "Cost Total Personal:"}
                </span>
                <span className="font-mono font-black text-base text-purple-600 dark:text-purple-400">
                  {calculatedCost.toLocaleString('ro-RO')} RON
                </span>
              </div>

              <div className="text-[10.5px] text-slate-500 dark:text-slate-400 pt-1">
                {lang === 'en' 
                  ? `Calculated using car's fuel rate (${effectiveAvgL100} L/100km • ${effectiveFuelPrice} RON/L)`
                  : `Calculat pe baza consumului mașinii (${effectiveAvgL100} L/100km • ${effectiveFuelPrice} RON/L)`}
              </div>
            </div>
          )}

          {/* Status Achitat / Decontat */}
          {!isOngoing && (
            <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  {lang === 'en' ? "Settled / Paid Trip" : "Cursă Achitată / Decontată"}
                </span>
                <span className="text-[10.5px] text-slate-500 dark:text-slate-400 block">
                  {lang === 'en' ? "Mark as paid to deduct from remaining balance" : "Bifează dacă această cursă a fost deja plătită / decontată"}
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPaid}
                  onChange={(e) => setIsPaid(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-500"></div>
              </label>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t.notes || (lang === 'en' ? "Notes" : "Observații")}
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={lang === 'en' ? "Optional details..." : "Mențiuni opționale..."}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/30 outline-hidden"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className={`w-full py-3 text-white font-black text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer ${
                isOngoing
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-amber-500/25'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-purple-500/25'
              }`}
            >
              {isOngoing
                ? (lang === 'en' ? "Save Trip (In Progress)" : "Salvează Cursa (În Desfășurare)")
                : (tripToEdit 
                    ? (lang === 'en' ? "Update Personal Trip" : "Actualizează Cursa")
                    : (lang === 'en' ? "Save & Calculate Trip" : "Salvează & Finalizează Cursa"))}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
