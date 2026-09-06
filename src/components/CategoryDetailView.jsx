import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  Wrench, 
  Sparkles, 
  Disc, 
  FileText, 
  CheckSquare, 
  MapPin, 
  Calendar, 
  Gauge, 
  Trash2, 
  Pencil,
  Car,
  Check,
  X,
  Save
} from 'lucide-react';
import { translations } from '../i18n';
import { getDaysRemaining } from '../utils/calculations';

export const CategoryDetailView = ({
  category = 'repair',
  vehicles = [],
  records = [],
  allVehicles = [],
  onNavigateBack,
  onOpenAddRecord,
  onEditRecord,
  onDeleteRecord,
  onUpdateVehicle,
  lang = 'ro'
}) => {
  const t = translations[lang] || translations.ro;
  const today = new Date();

  // State for editing vehicle technical data
  const [editingVehicleId, setEditingVehicleId] = useState(null);
  const [vehEditData, setVehEditData] = useState({});

  // Category Configuration
  const categoryConfig = {
    repair: {
      titleRo: "Reparații & Piese",
      titleEn: "Repairs & Parts",
      icon: Wrench,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/30",
      recordCategory: "repair"
    },
    service: {
      titleRo: "Revizii & Schimb Ulei",
      titleEn: "Service & Oil Change",
      icon: Sparkles,
      color: "text-teal-500",
      bgColor: "bg-teal-500/10",
      borderColor: "border-teal-500/30",
      recordCategory: "service"
    },
    tires: {
      titleRo: "Anvelope & Roți",
      titleEn: "Tires & Wheels",
      icon: Disc,
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10",
      borderColor: "border-cyan-500/30",
      recordCategory: "tires"
    },
    insurance: {
      titleRo: "Asigurări (RCA & CASCO)",
      titleEn: "Insurance (RCA & CASCO)",
      icon: FileText,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/30",
      recordCategory: "insurance"
    },
    itp: {
      titleRo: "Inspecție Tehnică Periodică (ITP)",
      titleEn: "Technical Inspection (ITP)",
      icon: CheckSquare,
      color: "text-indigo-500",
      bgColor: "bg-indigo-500/10",
      borderColor: "border-indigo-500/30",
      recordCategory: "itp"
    },
    rovinieta: {
      titleRo: "Rovinietă & Taxe de Drum",
      titleEn: "Vignette & Road Tolls",
      icon: MapPin,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/30",
      recordCategory: "fine"
    }
  };

  const config = categoryConfig[category] || categoryConfig.repair;
  const CategoryIcon = config.icon;
  const categoryTitle = lang === 'en' ? config.titleEn : config.titleRo;

  // Selected vehicle IDs
  const activeVehicleIds = vehicles.map(v => v.id);

  // Filter records belonging to selected vehicles and this category
  const categoryRecords = records.filter(r => {
    const matchVeh = activeVehicleIds.includes(r.vehicleId);
    if (!matchVeh) return false;

    if (category === 'rovinieta') {
      return r.category === 'fine' || r.category === 'itp' || r.title?.toLowerCase().includes('roviniet');
    }
    return r.category === config.recordCategory;
  }).sort((a, b) => new Date(b.date) - new Date(a.date));

  const totalAmount = categoryRecords.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

  // Helper for expiry dates
  const getExpiryStatus = (dateStr) => {
    if (!dateStr) return { text: "Nespecificat", color: "text-slate-400", isExpired: false, days: null };
    const diffDays = getDaysRemaining(dateStr);
    if (diffDays === null) return { text: "Nespecificat", color: "text-slate-400", isExpired: false, days: null };
    if (diffDays < 0) {
      return { 
        text: `Expirat de ${Math.abs(diffDays)} zile (${dateStr})`, 
        color: "text-rose-600 dark:text-rose-400 font-bold", 
        isExpired: true,
        days: diffDays
      };
    } else if (diffDays <= 30) {
      return { 
        text: `Expiră în ${diffDays} zile (${dateStr})`, 
        color: "text-amber-600 dark:text-amber-400 font-bold", 
        isExpired: false,
        days: diffDays
      };
    } else {
      return { 
        text: `Valid până la ${dateStr} (${diffDays} zile rămase)`, 
        color: "text-emerald-600 dark:text-emerald-400 font-bold", 
        isExpired: false,
        days: diffDays
      };
    }
  };

  const handleStartEdit = (veh) => {
    setEditingVehicleId(veh.id);
    setVehEditData({
      currentKm: veh.currentKm !== undefined && veh.currentKm !== null ? veh.currentKm.toString() : '',
      // Tires
      tireType: veh.tires?.type || 'allseason',
      tireSize: veh.tires?.size || '',
      tireBrand: veh.tires?.brand || '',
      tireDot: veh.tires?.dot || '',
      // Service
      lastServiceKm: veh.lastServiceKm ? veh.lastServiceKm.toString() : '',
      nextServiceKm: veh.nextServiceKm ? veh.nextServiceKm.toString() : '',
      nextServiceDate: veh.nextServiceDate || '',
      oilType: veh.oilType || '',
      oilBrand: veh.oilBrand || '',
      // Insurance
      rcaExpiry: veh.rcaExpiry || '',
      cascoExpiry: veh.cascoExpiry || '',
      // ITP
      itpExpiry: veh.itpExpiry || '',
      // Rovinieta
      rovinietaExpiry: veh.rovinietaExpiry || ''
    });
  };

  const handleSaveEdit = (veh) => {
    const updatedVeh = {
      ...veh,
      currentKm: vehEditData.currentKm !== '' ? parseInt(vehEditData.currentKm) : veh.currentKm,
      tires: {
        type: vehEditData.tireType || 'allseason',
        size: vehEditData.tireSize || '',
        brand: vehEditData.tireBrand || '',
        dot: vehEditData.tireDot || ''
      },
      lastServiceKm: vehEditData.lastServiceKm !== '' ? parseInt(vehEditData.lastServiceKm) : veh.lastServiceKm,
      nextServiceKm: vehEditData.nextServiceKm !== '' ? parseInt(vehEditData.nextServiceKm) : veh.nextServiceKm,
      nextServiceDate: vehEditData.nextServiceDate || veh.nextServiceDate,
      oilType: vehEditData.oilType || veh.oilType,
      oilBrand: vehEditData.oilBrand || veh.oilBrand,
      rcaExpiry: vehEditData.rcaExpiry || veh.rcaExpiry,
      cascoExpiry: vehEditData.cascoExpiry || veh.cascoExpiry,
      itpExpiry: vehEditData.itpExpiry || veh.itpExpiry,
      rovinietaExpiry: vehEditData.rovinietaExpiry || veh.rovinietaExpiry
    };

    if (onUpdateVehicle) {
      onUpdateVehicle(updatedVeh);
    }
    setEditingVehicleId(null);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between gap-2 px-1">
        <button
          onClick={onNavigateBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl shadow-2xs transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t.dashboard || (lang === 'en' ? "Main Dashboard" : "Panou Principal")}</span>
        </button>

        {onOpenAddRecord && (
          <button
            onClick={() => onOpenAddRecord(config.recordCategory)}
            className="inline-flex items-center gap-1.5 text-xs font-black text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 px-3.5 py-1.5 rounded-xl shadow-md shadow-emerald-500/20 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>{lang === 'en' ? `+ Add ${categoryTitle}` : `+ Adaugă Înregistrare`}</span>
          </button>
        )}
      </div>

      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl ${config.bgColor} ${config.color} shrink-0`}>
              <CategoryIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                {categoryTitle}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {vehicles.length === 1 
                  ? `Date și istoric pentru ${vehicles[0].plate} (${vehicles[0].makeModel})` 
                  : `Date pentru ${vehicles.length} mașini selectate din flotă`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto bg-slate-50 dark:bg-slate-950 px-3.5 py-2 rounded-2xl border border-slate-200/80 dark:border-slate-800">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Total Cheltuieli:</span>
            <span className="font-mono font-black text-sm sm:text-base text-emerald-600 dark:text-emerald-400">
              {totalAmount.toLocaleString('ro-RO')} RON
            </span>
          </div>
        </div>
      </div>

      {/* 1. VEHICLE TECHNICAL STATUS CARDS (For each selected car) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-2">
            <Car className="w-4 h-4 text-slate-400" />
            <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white uppercase tracking-wider">
              {lang === 'en' ? "Vehicle Technical Status" : "Stare Tehnică Vehicule Selectate"} ({vehicles.length})
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 italic">
            {lang === 'en' ? "Tap Edit to modify specs" : "Apasă Editează pentru a modifica datele"}
          </span>
        </div>

        {vehicles.map((veh) => {
          const isEditing = editingVehicleId === veh.id;

          return (
            <div 
              key={veh.id}
              className={`bg-white dark:bg-slate-900 border ${isEditing ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200 dark:border-slate-800'} rounded-2xl p-3.5 sm:p-4 shadow-xs transition-all`}
            >
              {/* Vehicle Title & Plate & Edit Button */}
              <div className="flex items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="whitespace-nowrap shrink-0 inline-flex items-center bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-0.5 font-mono text-xs font-black text-slate-900 dark:text-slate-100 shadow-2xs">
                    <span className="text-[8px] text-blue-500 font-bold mr-1">RO</span>
                    {veh.plate}
                  </span>
                  <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200 truncate">
                    {veh.makeModel}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-mono font-semibold text-xs text-slate-600 dark:text-slate-400 hidden sm:inline">
                    {veh.currentKm ? `${veh.currentKm.toLocaleString('ro-RO')} km` : '—'}
                  </span>
                  <button
                    onClick={() => isEditing ? setEditingVehicleId(null) : handleStartEdit(veh)}
                    className={`inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                      isEditing 
                        ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20' 
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {isEditing ? <X className="w-3 h-3" /> : <Pencil className="w-3 h-3" />}
                    <span>{isEditing ? (lang === 'en' ? 'Cancel' : 'Anulează') : (lang === 'en' ? 'Edit' : 'Editează')}</span>
                  </button>
                </div>
              </div>

              {/* EDIT FORM MODE */}
              {isEditing ? (
                <div className="space-y-3 pt-1 animate-in fade-in duration-150">
                  
                  {/* Kilometraj Curent Edit */}
                  <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      Kilometraj Curent (km):
                    </label>
                    <input
                      type="number"
                      value={vehEditData.currentKm}
                      onChange={(e) => setVehEditData({ ...vehEditData, currentKm: e.target.value })}
                      placeholder="ex: 135000"
                      className="w-36 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs text-right font-mono font-bold text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* SPECIFIC CATEGORY FORM FIELDS */}
                  {category === 'tires' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Tip Anvelope (Sezon)
                        </label>
                        <select
                          value={vehEditData.tireType}
                          onChange={(e) => setVehEditData({ ...vehEditData, tireType: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-cyan-500"
                        >
                          <option value="summer">☀️ Vară (Summer)</option>
                          <option value="winter">❄️ Iarnă (Winter)</option>
                          <option value="allseason">🍂 All-Season (Toate sezoanele)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Dimensiune Anvelope
                        </label>
                        <input
                          type="text"
                          value={vehEditData.tireSize}
                          onChange={(e) => setVehEditData({ ...vehEditData, tireSize: e.target.value })}
                          placeholder="ex: 185/65 R15 sau 215/65 R16"
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 dark:text-white outline-none focus:border-cyan-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Marcă & Model
                        </label>
                        <input
                          type="text"
                          value={vehEditData.tireBrand}
                          onChange={(e) => setVehEditData({ ...vehEditData, tireBrand: e.target.value })}
                          placeholder="ex: Continental EcoContact, Michelin Primacy"
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-cyan-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          DOT (Săptămână + An)
                        </label>
                        <input
                          type="text"
                          value={vehEditData.tireDot}
                          onChange={(e) => setVehEditData({ ...vehEditData, tireDot: e.target.value })}
                          placeholder="ex: 1123 sau 2424"
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 dark:text-white outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>
                  )}

                  {category === 'service' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Ultima Revizie (km)
                        </label>
                        <input
                          type="number"
                          value={vehEditData.lastServiceKm}
                          onChange={(e) => setVehEditData({ ...vehEditData, lastServiceKm: e.target.value })}
                          placeholder="ex: 120000"
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 dark:text-white outline-none focus:border-teal-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Următoarea Revizie (km)
                        </label>
                        <input
                          type="number"
                          value={vehEditData.nextServiceKm}
                          onChange={(e) => setVehEditData({ ...vehEditData, nextServiceKm: e.target.value })}
                          placeholder="ex: 135000"
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 dark:text-white outline-none focus:border-teal-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Dată Programată Următoarea Revizie
                        </label>
                        <input
                          type="date"
                          value={vehEditData.nextServiceDate}
                          onChange={(e) => setVehEditData({ ...vehEditData, nextServiceDate: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-teal-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Tip Ulei Recomandat
                        </label>
                        <input
                          type="text"
                          value={vehEditData.oilType}
                          onChange={(e) => setVehEditData({ ...vehEditData, oilType: e.target.value })}
                          placeholder="ex: 5W-30 RN0720 sau 5W-40"
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 dark:text-white outline-none focus:border-teal-500"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Marcă Ulei Recomandat
                        </label>
                        <input
                          type="text"
                          value={vehEditData.oilBrand}
                          onChange={(e) => setVehEditData({ ...vehEditData, oilBrand: e.target.value })}
                          placeholder="ex: Elf Full-Tech FE 5W30, Castrol, Mobil 1"
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-teal-500"
                        />
                      </div>
                    </div>
                  )}

                  {category === 'insurance' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Dată Expirare Poliță RCA
                        </label>
                        <input
                          type="date"
                          value={vehEditData.rcaExpiry}
                          onChange={(e) => setVehEditData({ ...vehEditData, rcaExpiry: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Dată Expirare Poliță CASCO
                        </label>
                        <input
                          type="date"
                          value={vehEditData.cascoExpiry}
                          onChange={(e) => setVehEditData({ ...vehEditData, cascoExpiry: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  )}

                  {category === 'itp' && (
                    <div className="text-xs">
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Dată Expirare Inspecție ITP
                      </label>
                      <input
                        type="date"
                        value={vehEditData.itpExpiry}
                        onChange={(e) => setVehEditData({ ...vehEditData, itpExpiry: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                      />
                    </div>
                  )}

                  {category === 'rovinieta' && (
                    <div className="text-xs">
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Dată Expirare Rovinietă
                      </label>
                      <input
                        type="date"
                        value={vehEditData.rovinietaExpiry}
                        onChange={(e) => setVehEditData({ ...vehEditData, rovinietaExpiry: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                      />
                    </div>
                  )}

                  {/* Save & Cancel Action Buttons */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200/80 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setEditingVehicleId(null)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      {lang === 'en' ? "Cancel" : "Anulează"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(veh)}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 shadow-md shadow-emerald-500/20 transition-all active:scale-95 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{lang === 'en' ? "Save Changes" : "Salvează Modificările"}</span>
                    </button>
                  </div>

                </div>
              ) : (
                /* READ-ONLY DISPLAY MODE */
                <div>
                  {/* SPECIFIC CATEGORY DETAILS */}
                  {/* A. TIRES */}
                  {category === 'tires' && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60">
                        <span className="text-[10px] text-slate-400 font-semibold block mb-0.5">Tip Anvelope</span>
                        <span className="font-bold text-slate-900 dark:text-white capitalize">
                          {veh.tires?.type === 'summer' ? '☀️ Vară' : veh.tires?.type === 'winter' ? '❄️ Iarnă' : '🍂 All-Season'}
                        </span>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60">
                        <span className="text-[10px] text-slate-400 font-semibold block mb-0.5">Dimensiune</span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">
                          {veh.tires?.size || 'Nespecificat'}
                        </span>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60">
                        <span className="text-[10px] text-slate-400 font-semibold block mb-0.5">Marcă & Model</span>
                        <span className="font-bold text-slate-900 dark:text-white truncate block">
                          {veh.tires?.brand || 'Nespecificat'}
                        </span>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60">
                        <span className="text-[10px] text-slate-400 font-semibold block mb-0.5">DOT (An fabricație)</span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">
                          {veh.tires?.dot ? `DOT ${veh.tires.dot}` : '—'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* B. SERVICE / REVIZII */}
                  {category === 'service' && (
                    <div className="space-y-2 text-xs">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60">
                          <span className="text-[10px] text-slate-400 font-semibold block mb-0.5">Ultima Revizie</span>
                          <span className="font-mono font-bold text-slate-900 dark:text-white">
                            {veh.lastServiceKm ? `${veh.lastServiceKm.toLocaleString('ro-RO')} km` : '—'}
                          </span>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60">
                          <span className="text-[10px] text-slate-400 font-semibold block mb-0.5">Următoarea Revizie</span>
                          <span className="font-mono font-bold text-slate-900 dark:text-white">
                            {veh.nextServiceKm ? `${veh.nextServiceKm.toLocaleString('ro-RO')} km` : '—'}
                          </span>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60">
                          <span className="text-[10px] text-slate-400 font-semibold block mb-0.5">Km Rămași</span>
                          {veh.nextServiceKm && veh.currentKm ? (
                            <span className={`font-mono font-bold ${
                              veh.nextServiceKm - veh.currentKm < 0 
                                ? 'text-rose-600 dark:text-rose-400' 
                                : 'text-emerald-600 dark:text-emerald-400'
                            }`}>
                              {veh.nextServiceKm - veh.currentKm < 0 
                                ? `Depășit cu ${Math.abs(veh.nextServiceKm - veh.currentKm).toLocaleString('ro-RO')} km` 
                                : `${(veh.nextServiceKm - veh.currentKm).toLocaleString('ro-RO')} km`}
                            </span>
                          ) : '—'}
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60">
                          <span className="text-[10px] text-slate-400 font-semibold block mb-0.5">Dată Programată</span>
                          <span className="font-bold text-slate-900 dark:text-white">
                            {veh.nextServiceDate || 'Nespecificată'}
                          </span>
                        </div>
                      </div>

                      {(veh.oilType || veh.oilBrand) && (
                        <div className="bg-teal-500/10 border border-teal-500/20 p-2.5 rounded-xl flex items-center justify-between text-xs">
                          <span className="font-semibold text-teal-800 dark:text-teal-300">Ulei Recomandat:</span>
                          <span className="font-mono font-bold text-teal-900 dark:text-teal-200">
                            {veh.oilType} {veh.oilBrand ? `(${veh.oilBrand})` : ''}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* C. INSURANCE (RCA & CASCO) */}
                  {category === 'insurance' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800/60">
                        <span className="text-[10px] text-slate-400 font-semibold block mb-1">Poliță RCA</span>
                        <p className={`text-xs ${getExpiryStatus(veh.rcaExpiry).color}`}>
                          {getExpiryStatus(veh.rcaExpiry).text}
                        </p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800/60">
                        <span className="text-[10px] text-slate-400 font-semibold block mb-1">Poliță CASCO</span>
                        <p className={`text-xs ${getExpiryStatus(veh.cascoExpiry).color}`}>
                          {getExpiryStatus(veh.cascoExpiry).text}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* D. ITP */}
                  {category === 'itp' && (
                    <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800/60 text-xs">
                      <span className="text-[10px] text-slate-400 font-semibold block mb-1">Inspecție Tehnică Periodică (ITP)</span>
                      <p className={`text-xs ${getExpiryStatus(veh.itpExpiry).color}`}>
                        {getExpiryStatus(veh.itpExpiry).text}
                      </p>
                    </div>
                  )}

                  {/* E. ROVINIETA */}
                  {category === 'rovinieta' && (
                    <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800/60 text-xs">
                      <span className="text-[10px] text-slate-400 font-semibold block mb-1">Valabilitate Rovinietă</span>
                      <p className={`text-xs ${getExpiryStatus(veh.rovinietaExpiry).color}`}>
                        {getExpiryStatus(veh.rovinietaExpiry).text}
                      </p>
                    </div>
                  )}

                  {/* F. REPAIRS */}
                  {category === 'repair' && (
                    <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 text-xs flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Total reparații înregistrate:</span>
                      <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                        {categoryRecords.filter(r => r.vehicleId === veh.id).reduce((sum, r) => sum + (Number(r.amount) || 0), 0).toLocaleString('ro-RO')} RON
                      </span>
                    </div>
                  )}
                </div>
              )}

            </div>
          );
        })}
      </div>

      {/* 2. RECORDED INVOICES & HISTORY LIST */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <CategoryIcon className={`w-4 h-4 ${config.color}`} />
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
              {lang === 'en' ? "Recorded Invoices & History" : "Istoric Facturi & Intervenții"}
            </h3>
            <span className="text-xs font-bold text-slate-400">({categoryRecords.length})</span>
          </div>
        </div>

        {categoryRecords.length === 0 ? (
          <div className="py-8 text-center">
            <div className={`w-12 h-12 rounded-2xl ${config.bgColor} ${config.color} flex items-center justify-center mx-auto mb-3`}>
              <CategoryIcon className="w-6 h-6" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto mb-3">
              {lang === 'en' 
                ? `No ${categoryTitle.toLowerCase()} records found for the selected vehicles.` 
                : `Nu există facturi sau intervenții de ${categoryTitle.toLowerCase()} înregistrate pentru mașinile selectate.`}
            </p>
            {onOpenAddRecord && (
              <button
                onClick={() => onOpenAddRecord(config.recordCategory)}
                className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{lang === 'en' ? `Add Record` : `Adaugă Înregistrare`}</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2.5">
            {categoryRecords.map((rec) => {
              const veh = allVehicles.find(v => v.id === rec.vehicleId);

              return (
                <div
                  key={rec.id}
                  className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-3 hover:border-emerald-400/50 transition-colors"
                >
                  {/* Rândul 1: Număr mașină + Titlu | Sumă + Edit/Delete */}
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      {veh && (
                        <span className="whitespace-nowrap shrink-0 inline-flex items-center bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md px-1.5 py-0.5 text-[11px] font-mono font-black text-slate-800 dark:text-slate-100">
                          {veh.plate}
                        </span>
                      )}
                      <span className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                        {rec.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <span className="font-mono font-black text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                        {Number(rec.amount).toLocaleString('ro-RO')} RON
                      </span>
                      <div className="flex items-center gap-0.5 ml-1">
                        {onEditRecord && (
                          <button
                            onClick={() => onEditRecord(rec)}
                            className="p-1 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Editează"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {onDeleteRecord && (
                          <button
                            onClick={() => {
                              if (window.confirm(lang === 'en' ? "Delete this record?" : "Ștergi această înregistrare?")) {
                                onDeleteRecord(rec.id);
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Șterge"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Rândul 2: Dată & Kilometraj & Detalii atelier */}
                  <div className="flex items-center justify-between gap-2 text-xs pt-1.5 border-t border-slate-200/60 dark:border-slate-800/60 whitespace-nowrap overflow-x-auto no-scrollbar text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-2 font-mono text-[11px] shrink-0">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {rec.date}
                      </span>
                      {rec.currentKm && (
                        <span className="flex items-center gap-1">
                          <Gauge className="w-3 h-3 text-slate-400" />
                          {Number(rec.currentKm).toLocaleString('ro-RO')} km
                        </span>
                      )}
                    </div>

                    {rec.details?.workshop && (
                      <span className="text-[11px] text-slate-500 truncate max-w-[150px]">
                        📍 {rec.details.workshop}
                      </span>
                    )}
                  </div>

                  {/* Observații dacă există */}
                  {rec.notes && (
                    <p className="mt-1.5 text-[10.5px] text-slate-500 dark:text-slate-400 italic bg-white dark:bg-slate-900 p-1.5 rounded-lg border border-slate-100 dark:border-slate-800 truncate">
                      „{rec.notes}”
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
