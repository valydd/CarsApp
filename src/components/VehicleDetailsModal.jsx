import React, { useState, useEffect } from 'react';
import { 
  X, 
  Car, 
  Trash2, 
  Check, 
  Calendar, 
  Gauge, 
  Droplet, 
  ShieldCheck, 
  Disc, 
  Fuel, 
  FileText,
  AlertTriangle,
  Pencil
} from 'lucide-react';
import { translations } from '../i18n';
import { calculateVehicleConsumption, getVehicleAlerts } from '../utils/calculations';

export const VehicleDetailsModal = ({
  vehicle,
  records,
  onClose,
  onUpdateVehicle,
  onDeleteVehicle,
  initialEditing = false,
  lang
}) => {
  const t = translations[lang] || translations.ro;

  const getAlertTitle = (alert) => {
    if (alert.type === 'serviceKm') {
      return alert.kmLeft <= 0 
        ? (t.serviceOverdue || `${t.servicesAndOil || 'Revizie'} ${t.expired || 'expirată!'}`)
        : (t.serviceDueSoon || `${t.servicesAndOil || 'Revizie'} ${t.expiresSoon || 'în curând'}`);
    }
    if (alert.category === 'rca' || alert.type === 'rcaExpiry') {
      return alert.daysLeft < 0 ? `${t.rcaBadge || 'RCA'} ${t.expiredFeminine || t.expired || 'expirată!'}` : `${t.rcaBadge || 'RCA'} ${t.expiresSoon || 'în curând'}`;
    }
    if (alert.category === 'itp' || alert.type === 'itpExpiry') {
      return alert.daysLeft < 0 ? `${t.itpBadge || 'ITP'} ${t.expired || 'expirat!'}` : `${t.itpBadge || 'ITP'} ${t.expiresSoon || 'în curând'}`;
    }
    if (alert.category === 'rovinieta' || alert.type === 'rovinietaExpiry') {
      return alert.daysLeft < 0 ? `${t.rovinietaBadge || 'Rovinietă'} ${t.expiredFeminine || t.expired || 'expirată!'}` : `${t.rovinietaBadge || 'Rovinietă'} ${t.expiresSoon || 'în curând'}`;
    }
    if (alert.category === 'casco' || alert.type === 'cascoExpiry') {
      return alert.daysLeft < 0 ? `${t.cascoBadge || 'CASCO'} ${t.expired || 'expirat!'}` : `${t.cascoBadge || 'CASCO'} ${t.expiresSoon || 'în curând'}`;
    }
    if (alert.category === 'service' || alert.type === 'nextServiceDate') {
      return alert.daysLeft < 0 
        ? `${t.servicesAndOil || 'Revizie'} ${t.expired || 'expirată!'}` 
        : `${t.servicesAndOil || 'Revizie'} ${t.expiresSoon || 'în curând'}`;
    }
    return (lang === 'ro' ? alert.titleRo : alert.titleEn) || alert.titleRo || '';
  };

  const getAlertDetail = (alert) => {
    if (alert.type === 'serviceKm') {
      if (alert.kmLeft <= 0) {
        return (t.kmOverdue || "Depășit cu {km} km (Limită: {limit} km)")
          .replace('{km}', Math.abs(alert.kmLeft).toLocaleString('ro-RO'))
          .replace('{limit}', (vehicle?.nextServiceKm || '').toLocaleString('ro-RO'));
      }
      return (t.kmRemainingUntilService || "Mai sunt doar {km} km până la revizie")
        .replace('{km}', alert.kmLeft.toLocaleString('ro-RO'));
    }
    if (alert.daysLeft !== undefined) {
      if (alert.daysLeft < 0) {
        return (t.expiredDaysAgoDetail || "Expirat de {days} zile ({date})")
          .replace('{days}', Math.abs(alert.daysLeft))
          .replace('{date}', alert.dueDate || '');
      }
      if (alert.daysLeft === 0) {
        return t.dueToday || "Expiră astăzi!";
      }
      return (t.daysRemainingDetail || "Mai sunt doar {days} zile ({date})")
        .replace('{days}', alert.daysLeft)
        .replace('{date}', alert.dueDate || '');
    }
    return (lang === 'ro' ? alert.detailRo : alert.detailEn) || alert.detailRo;
  };

  const [formData, setFormData] = useState({
    plate: vehicle?.plate || '',
    makeModel: vehicle?.makeModel || '',
    driver: vehicle?.driver || '',
    year: vehicle?.year || '',
    currentKm: vehicle?.currentKm || 0,
    fuelType: vehicle?.fuelType || 'diesel',
    vin: vehicle?.vin || '',
    oilType: vehicle?.oilType || '',
    oilBrand: vehicle?.oilBrand || '',
    nextServiceKm: vehicle?.nextServiceKm || '',
    nextServiceDate: vehicle?.nextServiceDate || '',
    itpExpiry: vehicle?.itpExpiry || '',
    rcaExpiry: vehicle?.rcaExpiry || '',
    rovinietaExpiry: vehicle?.rovinietaExpiry || '',
    cascoExpiry: vehicle?.cascoExpiry || '',
    tireType: vehicle?.tires?.type || 'allseason',
    tireSize: vehicle?.tires?.size || '',
    tireBrand: vehicle?.tires?.brand || '',
    tireDot: vehicle?.tires?.dot || ''
  });

  const [isEditing, setIsEditing] = useState(initialEditing);

  useEffect(() => {
    if (vehicle) {
      setFormData({
        plate: vehicle.plate || '',
        makeModel: vehicle.makeModel || '',
        driver: vehicle.driver || '',
        year: vehicle.year || '',
        currentKm: vehicle.currentKm || 0,
        fuelType: vehicle.fuelType || 'diesel',
        vin: vehicle.vin || '',
        oilType: vehicle.oilType || '',
        oilBrand: vehicle.oilBrand || '',
        nextServiceKm: vehicle.nextServiceKm || '',
        nextServiceDate: vehicle.nextServiceDate || '',
        itpExpiry: vehicle.itpExpiry || '',
        rcaExpiry: vehicle.rcaExpiry || '',
        rovinietaExpiry: vehicle.rovinietaExpiry || '',
        cascoExpiry: vehicle.cascoExpiry || '',
        tireType: vehicle.tires?.type || 'allseason',
        tireSize: vehicle.tires?.size || '',
        tireBrand: vehicle.tires?.brand || '',
        tireDot: vehicle.tires?.dot || ''
      });
      setIsEditing(initialEditing);
    }
  }, [vehicle, initialEditing]);

  const vehRecords = vehicle ? records.filter(r => r.vehicleId === vehicle.id) : [];
  const consumptionStats = calculateVehicleConsumption(vehRecords);
  const alerts = vehicle ? getVehicleAlerts(vehicle) : [];

  const handleSave = (e) => {
    e.preventDefault();
    onUpdateVehicle({
      ...vehicle,
      ...formData,
      plate: formData.plate.toUpperCase().trim(),
      currentKm: parseInt(formData.currentKm) || 0,
      nextServiceKm: formData.nextServiceKm ? parseInt(formData.nextServiceKm) : null,
      year: formData.year ? parseInt(formData.year) : vehicle.year,
      tires: {
        type: formData.tireType || 'allseason',
        size: formData.tireSize || '',
        brand: formData.tireBrand || '',
        dot: formData.tireDot || ''
      }
    });
    setIsEditing(false);
  };

  if (!vehicle) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 dark:bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-sm font-black tracking-wider flex items-center gap-1.5 shadow-inner whitespace-nowrap shrink-0">
              <span className="text-[10px] text-blue-500 dark:text-blue-400 font-bold">RO</span>
              <span>{vehicle.plate}</span>
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white truncate">
                {vehicle.makeModel}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {vehicle.driver ? `Șofer: ${vehicle.driver}` : "Neatribuit"} • {vehicle.year || ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors"
            >
              {isEditing ? t.cancel : t.edit}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          
          {alerts.length > 0 && (
            <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-2xl p-3.5 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400">
                <AlertTriangle className="w-4 h-4" />
                <span>{t.alert || "Atenționări Active"}</span>
              </div>
              <div className="space-y-1.5">
                {alerts.map((a, i) => (
                  <div key={i} className="text-xs text-slate-700 dark:text-slate-300 flex items-center justify-between bg-white dark:bg-slate-950/40 px-2.5 py-1 rounded-lg border border-rose-100 dark:border-transparent">
                    <span>{getAlertTitle(a)}</span>
                    <span className="font-bold text-rose-600 dark:text-rose-400">{getAlertDetail(a)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-2.5 bg-slate-50 dark:bg-slate-950/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="text-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">Kilometraj</span>
              <span className="font-mono font-black text-sm text-slate-900 dark:text-white">{(vehicle.currentKm || 0).toLocaleString()} km</span>
            </div>
            <div className="text-center border-x border-slate-200 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">Consum Mediu</span>
              <span className="font-mono font-black text-sm text-blue-600 dark:text-blue-400">
                {consumptionStats.avgLitersPer100Km ? `${consumptionStats.avgLitersPer100Km} L/100` : '—'}
              </span>
            </div>
            <div className="text-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">Cost / Km</span>
              <span className="font-mono font-black text-sm text-emerald-600 dark:text-emerald-400">
                {consumptionStats.costPerKm ? `${consumptionStats.costPerKm} lei/km` : '—'}
              </span>
            </div>
          </div>

          {/* Edit Form or View Grid */}
          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-4">
              {/* Section 1: Identificare */}
              <div className="bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  Identificare Vehicul
                </span>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">{t.plateNumber} *</label>
                    <input
                      type="text"
                      value={formData.plate}
                      onChange={(e) => setFormData({ ...formData, plate: e.target.value })}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white uppercase font-mono font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">{t.currentKm} (Corectează bord) *</label>
                    <input
                      type="number"
                      value={formData.currentKm}
                      onChange={(e) => setFormData({ ...formData, currentKm: e.target.value })}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white font-mono font-bold text-emerald-600 dark:text-emerald-400"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">{t.makeModel}</label>
                    <input
                      type="text"
                      value={formData.makeModel}
                      onChange={(e) => setFormData({ ...formData, makeModel: e.target.value })}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">{t.driver}</label>
                    <input
                      type="text"
                      value={formData.driver}
                      onChange={(e) => setFormData({ ...formData, driver: e.target.value })}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">{t.fuelType}</label>
                    <select
                      value={formData.fuelType}
                      onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2 py-1.5 text-xs text-slate-900 dark:text-white"
                    >
                      <option value="diesel">Diesel</option>
                      <option value="petrol">Benzină</option>
                      <option value="gpl">GPL</option>
                      <option value="hybrid">Hibrid</option>
                      <option value="electric">Electric</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">{t.year}</label>
                    <input
                      type="number"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                      placeholder="ex: 2022"
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2 py-1.5 text-xs text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">{t.vin}</label>
                    <input
                      type="text"
                      value={formData.vin}
                      onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
                      placeholder="VIN / Serie"
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2 py-1.5 text-xs text-slate-900 dark:text-white font-mono uppercase"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Revizie & Schimb Ulei */}
              <div className="bg-amber-50/50 dark:bg-amber-950/20 p-3.5 rounded-2xl border border-amber-200/80 dark:border-amber-900/40 space-y-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 block">
                  Revizie & Schimb Ulei
                </span>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">{t.oilType}</label>
                    <input
                      type="text"
                      value={formData.oilType}
                      onChange={(e) => setFormData({ ...formData, oilType: e.target.value })}
                      placeholder="ex: 5W-30 RN0720"
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">{t.oilBrand}</label>
                    <input
                      type="text"
                      value={formData.oilBrand}
                      onChange={(e) => setFormData({ ...formData, oilBrand: e.target.value })}
                      placeholder="ex: Castrol Edge / Elf"
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">{t.nextServiceAtKm}</label>
                    <input
                      type="number"
                      value={formData.nextServiceKm}
                      onChange={(e) => setFormData({ ...formData, nextServiceKm: e.target.value })}
                      placeholder="ex: 135000"
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">{t.nextServiceAtDate}</label>
                    <input
                      type="date"
                      value={formData.nextServiceDate}
                      onChange={(e) => setFormData({ ...formData, nextServiceDate: e.target.value })}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Valabilitate & Acte */}
              <div className="bg-purple-50/50 dark:bg-purple-950/20 p-3.5 rounded-2xl border border-purple-200/80 dark:border-purple-900/40 space-y-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 dark:text-purple-400 block">
                  Scadențe & Asigurări
                </span>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">{t.itpExpiry}</label>
                    <input
                      type="date"
                      value={formData.itpExpiry}
                      onChange={(e) => setFormData({ ...formData, itpExpiry: e.target.value })}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">{t.rcaExpiry}</label>
                    <input
                      type="date"
                      value={formData.rcaExpiry}
                      onChange={(e) => setFormData({ ...formData, rcaExpiry: e.target.value })}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">{t.rovinietaExpiry}</label>
                    <input
                      type="date"
                      value={formData.rovinietaExpiry}
                      onChange={(e) => setFormData({ ...formData, rovinietaExpiry: e.target.value })}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">{t.cascoExpiry}</label>
                    <input
                      type="date"
                      value={formData.cascoExpiry}
                      onChange={(e) => setFormData({ ...formData, cascoExpiry: e.target.value })}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Anvelope & Roți */}
              <div className="bg-cyan-50/50 dark:bg-cyan-950/20 p-3.5 rounded-2xl border border-cyan-200/80 dark:border-cyan-900/40 space-y-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-cyan-700 dark:text-cyan-400 block">
                  Anvelope & Roți
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Tip Anvelope</label>
                    <select
                      value={formData.tireType}
                      onChange={(e) => setFormData({ ...formData, tireType: e.target.value })}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white font-bold"
                    >
                      <option value="summer">☀️ Vară</option>
                      <option value="winter">❄️ Iarnă</option>
                      <option value="allseason">🍂 All-Season</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Dimensiune Anvelope</label>
                    <input
                      type="text"
                      value={formData.tireSize}
                      onChange={(e) => setFormData({ ...formData, tireSize: e.target.value })}
                      placeholder="ex: 185/65 R15 sau 215/65 R16"
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Marcă & Model</label>
                    <input
                      type="text"
                      value={formData.tireBrand}
                      onChange={(e) => setFormData({ ...formData, tireBrand: e.target.value })}
                      placeholder="ex: Continental EcoContact"
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">DOT (An fabricație)</label>
                    <input
                      type="text"
                      value={formData.tireDot}
                      onChange={(e) => setFormData({ ...formData, tireDot: e.target.value })}
                      placeholder="ex: 1123"
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20"
                >
                  {t.save}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              <div className="bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800/60">
                  <span className="text-slate-500 dark:text-slate-400">{t.vin}</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">{vehicle.vin || '—'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800/60">
                  <span className="text-slate-500 dark:text-slate-400">{t.oilType}</span>
                  <span className="font-mono font-bold text-amber-700 dark:text-amber-300">{vehicle.oilType || '5W-30'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800/60">
                  <span className="text-slate-500 dark:text-slate-400">Marcă Ulei Recomandată</span>
                  <span className="text-slate-800 dark:text-slate-200">{vehicle.oilBrand || 'Standard'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 dark:text-slate-400">{t.nextServiceAtKm}</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {vehicle.nextServiceKm ? `${vehicle.nextServiceKm.toLocaleString()} km` : '—'}
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800/60">
                  <span className="text-slate-500 dark:text-slate-400">{t.itpExpiry}</span>
                  <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{vehicle.itpExpiry || '—'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800/60">
                  <span className="text-slate-500 dark:text-slate-400">{t.rcaExpiry}</span>
                  <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{vehicle.rcaExpiry || '—'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 dark:text-slate-400">{t.rovinietaExpiry}</span>
                  <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{vehicle.rovinietaExpiry || '—'}</span>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                <span className="text-[10px] font-black uppercase tracking-wider text-cyan-600 dark:text-cyan-400 block mb-1">
                  Anvelope & Roți
                </span>
                <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800/60">
                  <span className="text-slate-500 dark:text-slate-400">Tip Anvelope</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 capitalize">
                    {vehicle.tires?.type === 'summer' ? '☀️ Vară' : vehicle.tires?.type === 'winter' ? '❄️ Iarnă' : '🍂 All-Season'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800/60">
                  <span className="text-slate-500 dark:text-slate-400">Dimensiune</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{vehicle.tires?.size || 'Nespecificat'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800/60">
                  <span className="text-slate-500 dark:text-slate-400">Marcă & Model</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{vehicle.tires?.brand || 'Nespecificat'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 dark:text-slate-400">DOT</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{vehicle.tires?.dot ? `DOT ${vehicle.tires.dot}` : '—'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Delete Action */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <button
              onClick={() => {
                if (window.confirm(t.confirmDeleteVehicle)) {
                  onDeleteVehicle(vehicle.id);
                  onClose();
                }
              }}
              className="flex items-center gap-1 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t.delete} vehicul</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300"
            >
              Închide
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
