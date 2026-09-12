import React from 'react';
import { 
  Car, 
  Plus, 
  Globe, 
  FileSpreadsheet, 
  ShieldAlert,
  BarChart3,
  History,
  Sun,
  Moon
} from 'lucide-react';
import { translations } from '../i18n';
import { APP_VERSION } from '../version';

export const Navbar = ({ 
  lang, 
  setLang, 
  theme,
  setTheme,
  activeTab, 
  setActiveTab, 
  onOpenQuickAdd, 
  onOpenAddVehicle, 
  onOpenExport,
  urgentAlertsCount,
  totalAlertsCount = 0,
  pulseAlerts = true,
  vehiclesCount
}) => {
  const t = translations[lang];

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 px-3 sm:px-6 py-2.5 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
        
        {/* Row 1 on Mobile / Left side on Desktop: Brand + Fleet Badge */}
        <div className="flex items-center justify-between gap-2">
          {/* Logo + Name */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-md shadow-emerald-500/20 text-slate-950 font-black text-base sm:text-lg shrink-0">
              🚗
            </div>
            <h1 className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight shrink-0 flex items-center gap-1.5">
              <span>{t.appName}</span>
              <span className="text-[9.5px] font-mono font-black text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-700/60">
                v{APP_VERSION}
              </span>
            </h1>
          </div>

          {/* Centered Fleet count card */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-center shadow-2xs shrink-0">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              FLOTĂ
            </span>
            <span className="text-xs font-black text-emerald-600 dark:text-emerald-300 font-mono">
              {vehiclesCount}
            </span>
          </div>
        </div>

        {/* Center Nav Tabs (Desktop / Tablet) */}
        <nav className="hidden md:flex items-center bg-slate-100 dark:bg-slate-800/60 p-1 rounded-xl border border-slate-200 dark:border-slate-700/50">
          <button
            onClick={() => {
              setActiveTab('dashboard');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'dashboard' 
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-bold' 
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/50'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            {t.fleetOverview}
          </button>
          <button
            onClick={() => {
              setActiveTab('rankings');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'rankings' 
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-bold' 
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/50'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            {t.analytics}
          </button>
          <button
            onClick={() => {
              setActiveTab('records');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'records' 
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-bold' 
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/50'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            {t.records}
          </button>
          <button
            onClick={() => {
              setActiveTab('alerts');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'alerts' 
                ? (urgentAlertsCount > 0 ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20 font-bold' : (totalAlertsCount > 0 ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20 font-bold' : 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20 font-bold'))
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/50'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            {t.alerts}
            {totalAlertsCount > 0 && (
              <span className="relative flex items-center justify-center ml-0.5">
                {pulseAlerts && (
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    urgentAlertsCount > 0 ? 'bg-rose-500' : 'bg-amber-500'
                  }`} />
                )}
                <span className={`relative inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-black text-white shadow-xs leading-none ${
                  pulseAlerts ? 'animate-pulse' : ''
                } ${
                  urgentAlertsCount > 0 ? 'bg-rose-600' : 'bg-amber-500'
                }`}>
                  {totalAlertsCount > 99 ? '99+' : totalAlertsCount}
                </span>
              </span>
            )}
          </button>
        </nav>

        {/* Row 2 on Mobile / Right Actions on Desktop: Separated cards */}
        <div className="flex items-center gap-2 justify-between sm:justify-end">
          
          {/* Theme Toggle (Light / Dark) */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex-1 sm:flex-initial h-8 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors shadow-2xs flex items-center justify-center gap-1.5"
            title={theme === 'dark' ? "Comută la Modul Luminos (Light)" : "Comută la Modul Întunecat (Dark)"}
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs font-bold">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-500" />
                <span className="text-xs font-bold">Dark</span>
              </>
            )}
          </button>

          {/* Language Switcher */}
          <button
            onClick={() => setLang(lang === 'ro' ? 'en' : 'ro')}
            className="flex-1 sm:flex-initial h-8 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors shadow-2xs flex items-center justify-center gap-1.5"
            title="Schimbă limba / Switch language"
          >
            <span className="text-xs font-black">{lang === 'ro' ? '🇷🇴 RO' : '🇬🇧 EN'}</span>
          </button>

          {/* Vehicul Nou / New Vehicle Button */}
          <button
            onClick={onOpenAddVehicle}
            className="flex-1 sm:flex-initial h-8 flex items-center justify-center px-3 sm:px-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-md shadow-emerald-500/25 transition-all transform active:scale-95 shrink-0"
            title={t.addVehicle}
          >
            <span className="text-[11px] sm:text-xs font-black tracking-tight whitespace-nowrap">
              {t.newVehicle || (lang === 'en' ? 'New Vehicle' : 'Vehicul Nou')}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
