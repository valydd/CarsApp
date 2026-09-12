import React, { useState } from 'react';
import { 
  Search, 
  Fuel, 
  Wrench, 
  Droplet, 
  ShieldCheck, 
  FileCheck2, 
  Disc, 
  AlertOctagon, 
  Trash2, 
  Pencil,
  Filter,
  Calendar,
  Gauge,
  Clock
} from 'lucide-react';
import { translations } from '../i18n';

export const RecordsList = ({ 
  records, 
  vehicles, 
  onDeleteRecord, 
  onEditRecord,
  selectedVehicleId, 
  lang 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const t = translations[lang];

  const vehMap = {};
  vehicles.forEach(v => { vehMap[v.id] = v; });

  const filtered = records
    .filter(r => {
      if (selectedVehicleId && r.vehicleId !== selectedVehicleId) return false;
      if (categoryFilter !== 'all' && r.category !== categoryFilter) return false;
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const v = vehMap[r.vehicleId];
        const matchPlate = v?.plate.toLowerCase().includes(query);
        const matchTitle = r.title?.toLowerCase().includes(query);
        const matchNotes = r.notes?.toLowerCase().includes(query);
        const matchWorkshop = r.details?.workshop?.toLowerCase().includes(query);
        return matchPlate || matchTitle || matchNotes || matchWorkshop;
      }
      return true;
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const getCategoryMeta = (cat) => {
    switch (cat) {
      case 'fuel':
        return { icon: Fuel, color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20', label: t.categories.fuel };
      case 'repair':
        return { icon: Wrench, color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20', label: t.categories.repair };
      case 'service':
        return { icon: Droplet, color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20', label: t.categories.service };
      case 'insurance':
        return { icon: ShieldCheck, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20', label: t.categories.insurance };
      case 'itp':
        return { icon: FileCheck2, color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/20', label: t.categories.itp };
      case 'tires':
        return { icon: Disc, color: 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-500/10 border-cyan-200 dark:border-cyan-500/20', label: t.categories.tires };
      case 'fine':
        return { icon: AlertOctagon, color: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/20', label: t.categories.fine };
      default:
        return { icon: Wrench, color: 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-500/10 border-slate-200 dark:border-slate-500/20', label: cat };
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
      {/* Search & Category Filter Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 mb-4">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t.search}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* Category Pill Filters */}
        <div 
          data-no-swipe="true"
          style={{ overscrollBehaviorX: 'contain' }}
          className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 no-scrollbar text-xs overscroll-x-contain"
        >
          {[
            { id: 'all', label: t.categories.all },
            { id: 'repair', label: '🔧 Reparații' },
            { id: 'fuel', label: '⛽ Alimentări' },
            { id: 'service', label: '🛢️ Revizii' },
            { id: 'insurance', label: '🛡️ Asigurări' },
            { id: 'itp', label: '📄 ITP' }
          ].map(c => (
            <button
              key={c.id}
              onClick={() => setCategoryFilter(c.id)}
              className={`px-2.5 py-1 rounded-lg font-bold flex-shrink-0 transition-all ${
                categoryFilter === c.id
                  ? 'bg-slate-800 text-white dark:bg-slate-700 dark:text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Records Timeline List */}
      <div className="space-y-2.5">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            Nicio înregistrare găsită conform filtrelor aplicate.
          </div>
        ) : (
          filtered.map(rec => {
            const veh = vehMap[rec.vehicleId];
            const meta = getCategoryMeta(rec.category);
            const Icon = meta.icon;

            const recTime = rec.time || rec.details?.time || (rec.id && rec.id.startsWith('rec-') && !isNaN(Number(rec.id.replace('rec-', ''))) ? new Date(Number(rec.id.replace('rec-', ''))).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' }) : null);

            return (
              <div
                key={rec.id}
                className="p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col gap-2 group"
              >
                {/* Top Section: Category Icon + Full Title spanning over the amount */}
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className={`p-2 rounded-xl border shrink-0 mt-0.5 ${meta.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    {/* Full Title without truncation */}
                    <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-slate-100 leading-snug break-words">
                      {rec.title}
                    </h4>

                    {/* Sub-row under Title: Plate on Left, Evidentiated Amount on Right */}
                    <div className="flex items-center justify-between gap-2 mt-1.5">
                      <span className="whitespace-nowrap shrink-0 inline-flex items-center font-mono text-[10.5px] font-black text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-950 px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-700 shadow-2xs">
                        <span className="text-[8px] text-blue-500 font-bold mr-1 leading-none">RO</span>
                        <span className="leading-none">{veh?.plate || '—'}</span>
                      </span>

                      {/* Highlighted Amount Badge */}
                      <div className="text-right whitespace-nowrap shrink-0 inline-flex items-baseline gap-1 bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-xl shadow-2xs">
                        <span className="font-mono font-black text-base sm:text-lg text-emerald-700 dark:text-emerald-300 tracking-tight">
                          {rec.amount?.toLocaleString('ro-RO')}
                        </span>
                        <span className="text-[10px] sm:text-xs font-black text-emerald-600 dark:text-emerald-400">RON</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Middle Row: Date, Time (without 'ora'), and KM on same line */}
                <div className="flex items-center gap-2 flex-wrap pl-11">
                  <div className="inline-flex items-center gap-2 bg-slate-100/90 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded-lg text-[11px] font-mono text-slate-600 dark:text-slate-400 shadow-2xs">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{rec.date}</span>
                    </span>
                    {recTime && (
                      <>
                        <span className="text-slate-300 dark:text-slate-700">•</span>
                        <span className="inline-flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                          <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{recTime}</span>
                        </span>
                      </>
                    )}
                  </div>

                  {rec.km > 0 && (
                    <span className="inline-flex items-center gap-1 font-mono font-semibold bg-slate-100/90 dark:bg-slate-950/80 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 shadow-2xs">
                      <Gauge className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{rec.km.toLocaleString()} km</span>
                    </span>
                  )}
                </div>

                {/* Bottom Row: Metadata details chips on Left, Edit & Delete buttons on Right */}
                <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-slate-100 dark:border-slate-800/60 mt-0.5">
                  <div className="flex flex-wrap items-center gap-1.5 min-w-0 flex-1 text-[11px] text-slate-500 dark:text-slate-400">
                    {rec.category === 'fuel' && rec.details?.liters && (
                      <span className="text-blue-600 dark:text-blue-300 font-semibold bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded-lg border border-blue-200 dark:border-blue-500/20">
                        ⛽ {rec.details.liters} L {rec.details.fullTank ? '(Plin)' : ''}
                      </span>
                    )}
                    {rec.category === 'service' && rec.details?.oilType && (
                      <span className="text-amber-700 dark:text-amber-300 font-mono font-semibold bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-200 dark:border-amber-500/20">
                        🛢️ {rec.details.oilType}
                      </span>
                    )}
                    {rec.details?.workshop && (
                      <span className="text-slate-600 dark:text-slate-300 truncate">
                        📍 {rec.details.workshop}
                      </span>
                    )}
                    {rec.notes && (
                      <span className="text-slate-500 dark:text-slate-400 italic truncate max-w-xs">
                        "{rec.notes}"
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0 ml-auto">
                    {onEditRecord && (
                      <button
                        onClick={() => onEditRecord(rec)}
                        className="p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800/40"
                        title={t.edit || "Editează"}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (window.confirm(t.confirmDelete)) {
                          onDeleteRecord(rec.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors border border-transparent hover:border-rose-200 dark:hover:border-rose-800/40"
                      title={t.delete || "Șterge"}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
