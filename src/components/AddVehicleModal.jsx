import React, { useState } from 'react';
import { X, Car, Check, Calendar, Gauge, Shield, Fuel } from 'lucide-react';
import { translations } from '../i18n';

export const AddVehicleModal = ({ isOpen, onClose, onAddVehicle, lang }) => {
  const t = translations[lang];

  const [plate, setPlate] = useState('');
  const [makeModel, setMakeModel] = useState('');
  const [vin, setVin] = useState('');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [currentKm, setCurrentKm] = useState('');
  const [fuelType, setFuelType] = useState('diesel');
  const [driver, setDriver] = useState('');
  const [oilType, setOilType] = useState('5W-30');
  const [oilBrand, setOilBrand] = useState('');
  const [itpExpiry, setItpExpiry] = useState('');
  const [rcaExpiry, setRcaExpiry] = useState('');
  const [rovinietaExpiry, setRovinietaExpiry] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!plate || !makeModel) return;

    const newVehicle = {
      id: `veh-${Date.now()}`,
      plate: plate.toUpperCase().trim(),
      makeModel: makeModel.trim(),
      vin: vin.toUpperCase().trim(),
      year: parseInt(year) || 2022,
      currentKm: parseInt(currentKm) || 0,
      fuelType,
      driver: driver.trim(),
      oilType: oilType.trim(),
      oilBrand: oilBrand.trim(),
      itpExpiry: itpExpiry || null,
      rcaExpiry: rcaExpiry || null,
      rovinietaExpiry: rovinietaExpiry || null,
      nextServiceKm: (parseInt(currentKm) || 0) + 15000,
      nextServiceDate: null,
      color: "from-blue-600 to-indigo-800"
    };

    onAddVehicle(newVehicle);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 dark:bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                {t.addVehicle}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t.registerVehicleDesc || "Înregistrează un autovehicul în flotă"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-4">
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                {t.plateNumber} *
              </label>
              <input
                type="text"
                required
                value={plate}
                onChange={(e) => setPlate(e.target.value)}
                placeholder={t.platePlaceholder}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm font-mono font-bold text-slate-900 dark:text-white outline-none focus:border-emerald-500 uppercase"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                {t.currentKm}
              </label>
              <input
                type="number"
                value={currentKm}
                onChange={(e) => setCurrentKm(e.target.value)}
                placeholder="ex: 85000"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm font-mono text-slate-900 dark:text-white outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              {t.makeModel} *
            </label>
            <input
              type="text"
              required
              value={makeModel}
              onChange={(e) => setMakeModel(e.target.value)}
              placeholder={t.makeModelPlaceholder}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                {t.fuelType}
              </label>
              <select
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-emerald-500"
              >
                <option value="diesel">{t.diesel || "Diesel"}</option>
                <option value="petrol">{t.petrol || "Benzină"}</option>
                <option value="gpl">{t.gpl || "GPL"}</option>
                <option value="hybrid">{t.hybrid || "Hibrid"}</option>
                <option value="electric">{t.electric || "Electric"}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                {t.year}
              </label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                {t.driver}
              </label>
              <input
                type="text"
                value={driver}
                onChange={(e) => setDriver(e.target.value)}
                placeholder="ex: Ion Popescu"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                {t.oilType}
              </label>
              <input
                type="text"
                value={oilType}
                onChange={(e) => setOilType(e.target.value)}
                placeholder="ex: 5W-30 LL"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 dark:text-white outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                {t.vin}
              </label>
              <input
                type="text"
                value={vin}
                onChange={(e) => setVin(e.target.value)}
                placeholder="Serie VIN"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white outline-none focus:border-emerald-500 uppercase"
              />
            </div>
          </div>

          {/* Expiration Dates for Alerts */}
          <div className="bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">
              {t.initialAlertDeadlines || "Scadențe Inițiale pentru Alerte"}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">{t.itpExpiry}</label>
                <input
                  type="date"
                  value={itpExpiry}
                  onChange={(e) => setItpExpiry(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">{t.rcaExpiry}</label>
                <input
                  type="date"
                  value={rcaExpiry}
                  onChange={(e) => setRcaExpiry(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">{t.rovinietaExpiry}</label>
                <input
                  type="date"
                  value={rovinietaExpiry}
                  onChange={(e) => setRovinietaExpiry(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black shadow-lg shadow-emerald-500/25 flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{t.save}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
