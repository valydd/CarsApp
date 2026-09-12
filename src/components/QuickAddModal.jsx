import React, { useState, useEffect } from 'react';
import { 
  X, 
  Fuel, 
  Wrench, 
  Droplet, 
  ShieldCheck, 
  FileCheck2, 
  Disc, 
  AlertOctagon, 
  Calendar, 
  Gauge, 
  DollarSign, 
  Check, 
  Sparkles,
  Info,
  ScanLine,
  Camera,
  Clock
} from 'lucide-react';
import { translations } from '../i18n';
import confetti from 'canvas-confetti';
import { ReceiptScanModal } from './ReceiptScanModal';

export const QuickAddModal = ({
  isOpen,
  onClose,
  vehicles,
  selectedVehicleId,
  onSaveRecord,
  recordToEdit = null,
  defaultCategory = 'fuel',
  lang
}) => {
  const t = translations[lang];

  // Selected vehicle & category
  const [vehicleId, setVehicleId] = useState(selectedVehicleId || (vehicles[0]?.id || ''));
  const [category, setCategory] = useState(defaultCategory || 'fuel');
  
  // Common fields
  const getCurrentTimeStr = () => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  };
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState(getCurrentTimeStr());
  const [km, setKm] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [title, setTitle] = useState('');

  // Fuel specific
  const [liters, setLiters] = useState('');
  const [pricePerLiter, setPricePerLiter] = useState('');
  const [fullTank, setFullTank] = useState(true);
  const [fuelSubType, setFuelSubType] = useState('gpl');
  const [isReceiptScanOpen, setIsReceiptScanOpen] = useState(false);

  const handleApplyReceiptData = (scanned) => {
    if (!scanned) return;
    setCategory('fuel');
    if (scanned.amount) setAmount(scanned.amount.toString());
    if (scanned.liters) setLiters(scanned.liters.toString());
    if (scanned.pricePerLiter) setPricePerLiter(scanned.pricePerLiter.toString());
    if (scanned.date) setDate(scanned.date);
    if (scanned.time) setTime(scanned.time);
    if (scanned.fuelType) setFuelSubType(scanned.fuelType);
    if (scanned.station) {
      if (!title) {
        setTitle(`Alimentare ${scanned.station}`);
      }
      setNotes(prev => prev ? `${prev} | Bon ${scanned.station}` : `Bon ${scanned.station}`);
    }
  };

  // Repair specific
  const [repairWorkshop, setRepairWorkshop] = useState('');
  const [partsCost, setPartsCost] = useState('');
  const [laborCost, setLaborCost] = useState('');
  const [partsReplaced, setPartsReplaced] = useState('');

  // Service / Oil change specific
  const [oilType, setOilType] = useState('5W-30');
  const [oilBrand, setOilBrand] = useState('Castrol Edge');
  const [oilLiters, setOilLiters] = useState('4.5');
  const [filters, setFilters] = useState({
    oil: true,
    air: true,
    fuel: false,
    cabin: true
  });
  const [nextServiceKm, setNextServiceKm] = useState('');
  const [nextServiceDate, setNextServiceDate] = useState('');

  // Insurance / ITP specific
  const [expiryDate, setExpiryDate] = useState('');
  const [policyOrStation, setPolicyOrStation] = useState('');

  // Tire specific
  const [tireSeason, setTireSeason] = useState('summer');
  const [tireSize, setTireSize] = useState('205/55 R16');
  const [tireDot, setTireDot] = useState('');
  const [tireBrand, setTireBrand] = useState('');

  // Fine specific
  const [fineTicket, setFineTicket] = useState('');
  const [fineDeadline, setFineDeadline] = useState('');
  const [finePaid, setFinePaid] = useState(false);

  useEffect(() => {
    if (recordToEdit) {
      setVehicleId(recordToEdit.vehicleId || (vehicles[0]?.id || ''));
      setCategory(recordToEdit.category || 'fuel');
      setDate(recordToEdit.date || new Date().toISOString().slice(0, 10));
      const editTime = recordToEdit.time || (recordToEdit.details?.time) || (recordToEdit.id && recordToEdit.id.startsWith('rec-') && !isNaN(Number(recordToEdit.id.replace('rec-', ''))) ? new Date(Number(recordToEdit.id.replace('rec-', ''))).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' }) : getCurrentTimeStr());
      setTime(editTime);
      setKm(recordToEdit.km !== undefined && recordToEdit.km !== null ? recordToEdit.km.toString() : '');
      setAmount(recordToEdit.amount !== undefined && recordToEdit.amount !== null ? recordToEdit.amount.toString() : '');
      setNotes(recordToEdit.notes || '');
      setTitle(recordToEdit.title || '');

      const d = recordToEdit.details || {};
      const recVeh = vehicles.find(v => v.id === recordToEdit.vehicleId);
      if (recordToEdit.category === 'fuel') {
        setLiters(d.liters ? d.liters.toString() : '');
        setPricePerLiter(d.pricePerLiter ? d.pricePerLiter.toString() : '');
        setFullTank(d.fullTank ?? true);
        setFuelSubType(d.fuelType || (recVeh?.fuelType === 'diesel' ? 'diesel' : recVeh?.fuelType === 'gpl' ? 'gpl' : 'petrol'));
      } else if (recordToEdit.category === 'repair') {
        setRepairWorkshop(d.workshop || '');
        setPartsCost(d.partsCost ? d.partsCost.toString() : '');
        setLaborCost(d.laborCost ? d.laborCost.toString() : '');
        setPartsReplaced(Array.isArray(d.parts) ? d.parts.join(', ') : (d.parts || ''));
      } else if (recordToEdit.category === 'service') {
        setOilType(d.oilType || '5W-30');
        setOilBrand(d.oilBrand || 'Castrol Edge');
        setOilLiters(d.oilLiters ? d.oilLiters.toString() : '4.5');
        const filtersArr = d.filters || [];
        setFilters({
          oil: filtersArr.includes('oil'),
          air: filtersArr.includes('air'),
          fuel: filtersArr.includes('fuel'),
          cabin: filtersArr.includes('cabin')
        });
        setNextServiceKm(d.nextServiceKm ? d.nextServiceKm.toString() : '');
        setNextServiceDate(d.nextServiceDate || '');
      } else if (recordToEdit.category === 'insurance' || recordToEdit.category === 'itp') {
        setExpiryDate(d.expiresAt || '');
        setPolicyOrStation(d.company || d.station || '');
      } else if (recordToEdit.category === 'tires') {
        setTireSeason(d.season || 'summer');
        setTireSize(d.size || '205/55 R16');
        setTireDot(d.dot || '');
        setTireBrand(d.brand || '');
      } else if (recordToEdit.category === 'fine') {
        setFineTicket(d.ticketNumber || '');
        setFineDeadline(d.deadline50 || '');
        setFinePaid(d.isPaid ?? false);
      }
    } else if (selectedVehicleId) {
      if (defaultCategory) setCategory(defaultCategory);
      setVehicleId(selectedVehicleId);
      const curVeh = vehicles.find(v => v.id === selectedVehicleId);
      if (curVeh?.currentKm) {
        setKm(curVeh.currentKm.toString());
      }
      if (curVeh?.fuelType === 'gpl') {
        setFuelSubType('gpl');
      } else if (curVeh?.fuelType === 'diesel') {
        setFuelSubType('diesel');
      } else {
        setFuelSubType('petrol');
      }
      setDate(new Date().toISOString().slice(0, 10));
      setTime(getCurrentTimeStr());
      setAmount('');
      setNotes('');
      setTitle('');
      setLiters('');
      setPricePerLiter('');
      setPartsCost('');
      setLaborCost('');
      setPartsReplaced('');
      setRepairWorkshop('');
      setExpiryDate('');
      setPolicyOrStation('');
      setTireBrand('');
      setTireDot('');
      setPolicyOrStation('');
    } else if (vehicles[0]) {
      if (defaultCategory) setCategory(defaultCategory);
      setVehicleId(vehicles[0].id);
      if (vehicles[0].currentKm) {
        setKm(vehicles[0].currentKm.toString());
      }
      setDate(new Date().toISOString().slice(0, 10));
      setTime(getCurrentTimeStr());
      setAmount('');
      setNotes('');
      setTitle('');
      setLiters('');
      setPricePerLiter('');
      setPartsCost('');
      setLaborCost('');
      setPartsReplaced('');
      setRepairWorkshop('');
      setExpiryDate('');
      setPolicyOrStation('');
    }
  }, [isOpen, recordToEdit, selectedVehicleId, vehicles, defaultCategory]);

  const handleVehicleChange = (vId) => {
    setVehicleId(vId);
    const v = vehicles.find(item => item.id === vId);
    if (v) {
      if (v.currentKm) setKm(v.currentKm.toString());
      if (v.oilType) setOilType(v.oilType);
      if (v.oilBrand) setOilBrand(v.oilBrand);
      if (v.currentKm) setNextServiceKm((v.currentKm + 15000).toString());
      if (v.fuelType === 'gpl') {
        setFuelSubType('gpl');
      } else if (v.fuelType === 'diesel') {
        setFuelSubType('diesel');
      } else {
        setFuelSubType('petrol');
      }
    }
  };

  const handleLitersChange = (val) => {
    setLiters(val);
    if (val && pricePerLiter) {
      const tot = (parseFloat(val) * parseFloat(pricePerLiter)).toFixed(2);
      setAmount(tot);
    }
  };

  const handlePricePerLiterChange = (val) => {
    setPricePerLiter(val);
    if (val && liters) {
      const tot = (parseFloat(liters) * parseFloat(val)).toFixed(2);
      setAmount(tot);
    }
  };

  const handlePartsLaborChange = (parts, labor) => {
    setPartsCost(parts);
    setLaborCost(labor);
    const p = parseFloat(parts) || 0;
    const l = parseFloat(labor) || 0;
    if (p > 0 || l > 0) {
      setAmount((p + l).toString());
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || !vehicleId) return;

    let defaultTitle = title;
    let details = {};

    if (category === 'fuel') {
      const fuelLabel = fuelSubType === 'gpl' ? (t.fuelGPL || 'GPL') : fuelSubType === 'diesel' ? (t.fuelDiesel || 'Diesel') : (t.fuelPetrol || 'Benzină');
      defaultTitle = title || `${t.fueling || 'Alimentare'} ${fuelLabel} ${liters ? `${liters}L` : ''}`.trim();
      details = {
        liters: parseFloat(liters) || 0,
        pricePerLiter: parseFloat(pricePerLiter) || 0,
        fullTank,
        fuelType: fuelSubType
      };
    } else if (category === 'repair') {
      defaultTitle = title || `${t.categories?.repair || t.repairs || 'Reparație'}: ${partsReplaced || 'Mentenanță'}`;
      details = {
        workshop: repairWorkshop,
        partsCost: parseFloat(partsCost) || 0,
        laborCost: parseFloat(laborCost) || 0,
        parts: partsReplaced ? partsReplaced.split(',').map(s => s.trim()) : []
      };
    } else if (category === 'service') {
      defaultTitle = title || `${t.categories?.service || t.services || 'Revizie'} & ${oilType}`;
      details = {
        oilType,
        oilBrand,
        oilLiters: parseFloat(oilLiters) || 0,
        filters: Object.keys(filters).filter(k => filters[k]),
        nextServiceKm: parseInt(nextServiceKm) || null,
        nextServiceDate: nextServiceDate || null
      };
    } else if (category === 'insurance') {
      defaultTitle = title || (t.mandatoryInsurance || `Asigurare RCA / CASCO`);
      details = {
        expiresAt: expiryDate,
        company: policyOrStation
      };
    } else if (category === 'itp') {
      defaultTitle = title || (t.categories?.itp || `Inspecție Tehnică Periodică (ITP)`);
      details = {
        expiresAt: expiryDate,
        station: policyOrStation
      };
    } else if (category === 'tires') {
      defaultTitle = title || (tireBrand ? `${t.categories?.tires || 'Anvelope'} ${tireBrand} (${tireSeason})` : `${t.categories?.tires || 'Anvelope'} (${tireSeason})`);
      details = {
        season: tireSeason,
        size: tireSize,
        dot: tireDot,
        brand: tireBrand
      };
    } else if (category === 'fine') {
      defaultTitle = title || (t.fine || `Amendă / Taxă`);
      details = {
        ticketNumber: fineTicket,
        deadline50: fineDeadline,
        isPaid: finePaid
      };
    }

    const finalRecord = {
      id: recordToEdit ? recordToEdit.id : `rec-${Date.now()}`,
      vehicleId,
      category,
      date,
      time: time || getCurrentTimeStr(),
      km: parseInt(km) || 0,
      amount: parseFloat(amount),
      currency: "RON",
      title: defaultTitle,
      details: { ...details, time: time || getCurrentTimeStr() },
      notes
    };

    onSaveRecord(finalRecord, {
      updatedKm: parseInt(km) || null,
      nextServiceKm: category === 'service' && nextServiceKm ? parseInt(nextServiceKm) : null,
      nextServiceDate: category === 'service' && nextServiceDate ? nextServiceDate : null,
      oilType: category === 'service' && oilType ? oilType : null,
      oilBrand: category === 'service' && oilBrand ? oilBrand : null,
      itpExpiry: category === 'itp' && expiryDate ? expiryDate : null,
      rcaExpiry: category === 'insurance' && expiryDate ? expiryDate : null,
      tires: category === 'tires' ? {
        type: tireSeason,
        size: tireSize,
        dot: tireDot,
        brand: tireBrand || 'Noi'
      } : null
    });

    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#10b981', '#3b82f6', '#f59e0b']
      });
    } catch (e) {}

    onClose();
  };

  const categories = [
    { id: 'fuel', label: t.categories.fuel, icon: Fuel, color: 'hover:border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10' },
    { id: 'repair', label: t.categories.repair, icon: Wrench, color: 'hover:border-rose-500 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10' },
    { id: 'service', label: t.categories.service, icon: Droplet, color: 'hover:border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10' },
    { id: 'insurance', label: t.categories.insurance, icon: ShieldCheck, color: 'hover:border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10' },
    { id: 'itp', label: t.categories.itp, icon: FileCheck2, color: 'hover:border-purple-500 text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10' },
    { id: 'tires', label: t.categories.tires, icon: Disc, color: 'hover:border-cyan-500 text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-500/10' },
    { id: 'fine', label: t.categories.fine, icon: AlertOctagon, color: 'hover:border-orange-500 text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 dark:bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                {recordToEdit ? (t.editRecord || "Editare Înregistrare") : t.addRecord}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {recordToEdit 
                  ? (t.editRecordSubtitle || "Corectează kilometrajul, suma, lucrările sau piesele")
                  : (t.addRecordSubtitle || "Înregistrează rapid alimentări, revizii sau reparații")}
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

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-4">
          
          {/* 1. Select Vehicle */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              {t.selectVehicle} *
            </label>
            <select
              value={vehicleId}
              onChange={(e) => handleVehicleChange(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition-colors"
              required
            >
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>
                  {v.plate} — {v.makeModel} ({v.driver || "Fără șofer"})
                </option>
              ))}
            </select>
          </div>

          {/* 2. Category Selector Buttons */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              {t.selectCategory}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                      isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-500/15 border-emerald-500 ring-2 ring-emerald-500/20 text-slate-950 dark:text-white shadow-sm'
                        : `bg-slate-50/70 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 ${cat.color}`
                    }`}
                  >
                    <Icon className={`w-4 h-4 mb-1.5 ${isSelected ? 'text-emerald-600 dark:text-emerald-400' : ''}`} />
                    <span className="text-[11px] font-bold leading-tight line-clamp-1">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Essential Numbers (Amount, Date, Ora, Km) */}
          <div className="grid grid-cols-12 gap-2.5 bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800/80">
            {/* Amount */}
            <div className="col-span-12 sm:col-span-3">
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1 truncate">
                {t.totalAmount} (RON) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-base font-black text-emerald-600 dark:text-emerald-400 outline-none focus:border-emerald-500"
                  required
                />
                <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">RON</span>
              </div>
            </div>

            {/* Date (Echilibrat optim) */}
            <div className="col-span-7 sm:col-span-4">
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1 truncate">
                {t.date}
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full min-w-0 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-2 py-2 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                required
              />
            </div>

            {/* Time / Ora (Echilibrat optim) */}
            <div className="col-span-5 sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1 truncate flex items-center gap-1">
                <Clock className="w-3 h-3 text-blue-500 shrink-0" />
                <span>Ora</span>
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full min-w-0 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-2 py-2 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-emerald-500"
              />
            </div>

            {/* Km */}
            <div className="col-span-12 sm:col-span-3">
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1 truncate">
                {t.currentKm}
              </label>
              <input
                type="number"
                value={km}
                onChange={(e) => setKm(e.target.value)}
                placeholder="ex: 125000"
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-semibold text-slate-900 dark:text-white outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* 4. DYNAMIC SECTION */}
          {category === 'fuel' && (
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 rounded-2xl p-3.5 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="text-xs font-bold text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
                  <Fuel className="w-4 h-4" />
                  <span>{t.fuelDetails} & Calcul Automat Consum</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsReceiptScanOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <ScanLine className="w-3.5 h-3.5" />
                  <span>{t.scanReceipt || "Scanează Bon"}</span>
                </button>
              </div>

              {/* Selector Tip Carburant Alimentat */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                  Carburant Alimentat la Pompă
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFuelSubType('gpl')}
                    className={`py-2 px-2 rounded-xl border text-xs font-black flex items-center justify-center gap-1 transition-all cursor-pointer ${
                      fuelSubType === 'gpl'
                        ? 'bg-emerald-500 text-slate-950 border-emerald-500 shadow-sm shadow-emerald-500/25'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-400'
                    }`}
                  >
                    <span>🟢 GPL</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFuelSubType('petrol')}
                    className={`py-2 px-2 rounded-xl border text-xs font-black flex items-center justify-center gap-1 transition-all cursor-pointer ${
                      fuelSubType === 'petrol'
                        ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm shadow-amber-500/25'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-400'
                    }`}
                  >
                    <span>⛽ Benzină</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFuelSubType('diesel')}
                    className={`py-2 px-2 rounded-xl border text-xs font-black flex items-center justify-center gap-1 transition-all cursor-pointer ${
                      fuelSubType === 'diesel'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/25'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-400'
                    }`}
                  >
                    <span>⛽ Motorină</span>
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">{t.liters}</label>
                  <input
                    type="number"
                    step="0.01"
                    value={liters}
                    onChange={(e) => handleLitersChange(e.target.value)}
                    placeholder="ex: 50.0"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">{t.pricePerLiter}</label>
                  <input
                    type="number"
                    step="0.01"
                    value={pricePerLiter}
                    onChange={(e) => handlePricePerLiterChange(e.target.value)}
                    placeholder="ex: 7.65"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="fullTankCheckbox"
                  checked={fullTank}
                  onChange={(e) => setFullTank(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
                <label htmlFor="fullTankCheckbox" className="text-xs text-slate-700 dark:text-slate-300 select-none cursor-pointer">
                  {t.fullTank}
                </label>
              </div>
            </div>
          )}

          {category === 'repair' && (
            <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-2xl p-3.5 space-y-3">
              <div className="text-xs font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                <Wrench className="w-4 h-4" />
                <span>{t.repairDetails} (Impact în Clasament)</span>
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">{t.repairDescription}</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="ex: Înlocuire kit ambreiaj și plăcuțe frână"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white outline-none focus:border-rose-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">{t.partsCost} (lei)</label>
                  <input
                    type="number"
                    value={partsCost}
                    onChange={(e) => handlePartsLaborChange(e.target.value, laborCost)}
                    placeholder="ex: 1800"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">{t.laborCost} (lei)</label>
                  <input
                    type="number"
                    value={laborCost}
                    onChange={(e) => handlePartsLaborChange(partsCost, e.target.value)}
                    placeholder="ex: 600"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white outline-none focus:border-rose-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">{t.partsReplaced}</label>
                  <input
                    type="text"
                    value={partsReplaced}
                    onChange={(e) => setPartsReplaced(e.target.value)}
                    placeholder="ex: Ambreiaj Sachs, Rulment SKF"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">{t.serviceWorkshop}</label>
                  <input
                    type="text"
                    value={repairWorkshop}
                    onChange={(e) => setRepairWorkshop(e.target.value)}
                    placeholder="ex: Service Auto Cobălcescu"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white outline-none focus:border-rose-500"
                  />
                </div>
              </div>
            </div>
          )}

          {category === 'service' && (
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl p-3.5 space-y-3">
              <div className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                <Droplet className="w-4 h-4" />
                <span>{t.oilDetails}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">{t.oilType} *</label>
                  <input
                    type="text"
                    value={oilType}
                    onChange={(e) => setOilType(e.target.value)}
                    placeholder={t.oilTypePlaceholder}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white outline-none focus:border-amber-500 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">{t.oilBrand}</label>
                  <input
                    type="text"
                    value={oilBrand}
                    onChange={(e) => setOilBrand(e.target.value)}
                    placeholder="ex: Castrol / Motul / Mobil 1"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1.5">{t.filtersReplaced}</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { key: 'oil', label: t.filterOil },
                    { key: 'air', label: t.filterAir },
                    { key: 'fuel', label: t.filterFuel },
                    { key: 'cabin', label: t.filterCabin }
                  ].map(f => (
                    <label key={f.key} className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer bg-white dark:bg-slate-900/60 p-2 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs">
                      <input
                        type="checkbox"
                        checked={filters[f.key]}
                        onChange={(e) => setFilters({ ...filters, [f.key]: e.target.checked })}
                        className="rounded text-amber-600 focus:ring-amber-500 bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700"
                      />
                      <span>{f.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">{t.nextServiceAtKm}</label>
                  <input
                    type="number"
                    value={nextServiceKm}
                    onChange={(e) => setNextServiceKm(e.target.value)}
                    placeholder="ex: 140000"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white outline-none focus:border-amber-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">{t.nextServiceAtDate}</label>
                  <input
                    type="date"
                    value={nextServiceDate}
                    onChange={(e) => setNextServiceDate(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>
          )}

          {(category === 'itp' || category === 'insurance') && (
            <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/40 rounded-2xl p-3.5 space-y-3">
              <div className="text-xs font-bold text-purple-700 dark:text-purple-400 flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4" />
                <span>Valabilitate & Scadență Alertă</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">
                    {category === 'itp' ? t.itpExpiry : t.rcaExpiry} *
                  </label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white outline-none focus:border-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">
                    {category === 'itp' ? 'Stație ITP' : 'Companie Asigurare'}
                  </label>
                  <input
                    type="text"
                    value={policyOrStation}
                    onChange={(e) => setPolicyOrStation(e.target.value)}
                    placeholder="ex: Omniasig / Stație ITP Militari"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            </div>
          )}

          {category === 'tires' && (
            <div className="bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-900/40 rounded-2xl p-3.5 space-y-3">
              <div className="text-xs font-bold text-cyan-700 dark:text-cyan-400 flex items-center gap-1.5">
                <Disc className="w-4 h-4" />
                <span>{t.categories.tires}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-2">
                <div>
                  <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">Marcă & Model Anvelope</label>
                  <input
                    type="text"
                    value={tireBrand}
                    onChange={(e) => setTireBrand(e.target.value)}
                    placeholder="ex: Michelin Primacy 4"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white outline-none focus:border-cyan-500 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">{t.tireSeason}</label>
                  <select
                    value={tireSeason}
                    onChange={(e) => setTireSeason(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white outline-none focus:border-cyan-500 font-bold"
                  >
                    <option value="summer">{t.tireSummer}</option>
                    <option value="winter">{t.tireWinter}</option>
                    <option value="allseason">{t.tireAllSeason}</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">{t.tireSize}</label>
                  <input
                    type="text"
                    value={tireSize}
                    onChange={(e) => setTireSize(e.target.value)}
                    placeholder="ex: 205/55 R16"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">{t.tireDot} (DOT)</label>
                  <input
                    type="text"
                    value={tireDot}
                    onChange={(e) => setTireDot(e.target.value)}
                    placeholder="ex: 1824"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {category === 'fine' && (
            <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/40 rounded-2xl p-3.5 space-y-3">
              <div className="text-xs font-bold text-orange-700 dark:text-orange-400 flex items-center gap-1.5">
                <AlertOctagon className="w-4 h-4" />
                <span>{t.categories.fine}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">{t.fineReason}</label>
                  <input
                    type="text"
                    value={fineTicket}
                    onChange={(e) => setFineTicket(e.target.value)}
                    placeholder="ex: Viteză / Serie PV-8123"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">{t.fineDeadline50}</label>
                  <input
                    type="date"
                    value={fineDeadline}
                    onChange={(e) => setFineDeadline(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="finePaidCheckbox"
                  checked={finePaid}
                  onChange={(e) => setFinePaid(e.target.checked)}
                  className="rounded text-orange-600 bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700"
                />
                <label htmlFor="finePaidCheckbox" className="text-xs text-slate-700 dark:text-slate-300 select-none cursor-pointer">
                  {t.finePaid}
                </label>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
              {t.notes}
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="ex: Factură nr. 1024, service autorizat..."
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500"
            />
          </div>

          {/* Modal Footer */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 transition-colors"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black shadow-lg shadow-emerald-500/25 transition-all transform active:scale-95 flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{recordToEdit ? (t.saveChanges || "Salvează Modificările") : t.save}</span>
            </button>
          </div>
        </form>

        <ReceiptScanModal
          isOpen={isReceiptScanOpen}
          onClose={() => setIsReceiptScanOpen(false)}
          onApplyData={handleApplyReceiptData}
          initialFuelType={fuelSubType}
          lang={lang}
        />

      </div>
    </div>
  );
};
