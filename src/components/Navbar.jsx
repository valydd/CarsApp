import React from 'react';
import { 
  Car, 
  Plus, 
  Globe, 
  FileSpreadsheet, 
  ShieldAlert,
  Shield,
  BarChart3,
  History,
  Sun,
  Moon,
  QrCode,
  CloudUpload,
  ChevronDown,
  Maximize2,
  Minimize2
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
  onOpenConnect,
  onOpenVehicles,
  urgentAlertsCount,
  totalAlertsCount = 0,
  pulseAlerts = true,
  vehiclesCount,
  isImmersive = false,
  onToggleImmersive
}) => {
  const t = translations[lang];

  return (
    <>
      {/* Floating button at top right when in Immersive / Full Screen Mode */}
      {isImmersive && (
        <button
          type="button"
          onClick={onToggleImmersive}
          className="fixed top-2.5 sm:top-4 right-3 sm:right-6 z-50 w-8 h-8 rounded-full bg-white/95 dark:bg-slate-900/95 text-emerald-600 dark:text-emerald-400 border-2 border-emerald-500/85 dark:border-emerald-400/90 shadow-md shadow-emerald-500/20 dark:shadow-black/40 backdrop-blur-md flex items-center justify-center cursor-pointer active:scale-90 hover:scale-105 transition-all animate-in fade-in slide-in-from-top-3 duration-200"
          title={lang === 'en' ? "Restore Header & Navigation" : "Afișează antetul și bara de jos"}
          aria-label="Restore Header & Navigation"
        >
          <Minimize2 className="w-4 h-4 stroke-[2.8]" />
        </button>
      )}

      {/* Main Top Header (Hidden in Immersive Mode) */}
      {!isImmersive && (
        <header className="fixed top-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 px-3 sm:px-6 py-2.5 transition-colors">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
            
            {/* Row 1 on Mobile / Left side on Desktop: Brand + Language Switcher */}
            <div className="flex items-center justify-between gap-2 transition-all duration-300">
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

              {/* Language Switcher in top right (in place of FLOTĂ) */}
              <button
                type="button"
                onClick={() => setLang(lang === 'ro' ? 'en' : 'ro')}
                className="h-8 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-[11px] font-black text-slate-700 dark:text-slate-200 transition-all shadow-2xs flex items-center justify-center shrink-0 cursor-pointer active:scale-95"
                title="Schimbă limba / Switch language"
              >
                <span>{lang === 'ro' ? '🇷🇴 RO' : '🇬🇧 EN'}</span>
              </button>
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
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-bold' 
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/50'
                }`}
              >
                <div className="relative inline-flex items-center justify-center">
                  <ShieldAlert className={`w-3.5 h-3.5 transition-colors ${
                    totalAlertsCount > 0 
                      ? (urgentAlertsCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400')
                      : ''
                  }`} />
                  {totalAlertsCount > 0 && (
                    <span className="absolute -top-1.5 -right-2.5 flex items-center justify-center pointer-events-none">
                      {pulseAlerts && (
                        <span className={`alert-wave-1 absolute inline-flex h-full w-full rounded-full opacity-60 ${
                          urgentAlertsCount > 0 ? 'bg-rose-500' : 'bg-amber-500'
                        }`} />
                      )}
                      <span className={`relative inline-flex items-center justify-center min-w-[16px] h-[16px] px-1 rounded-full text-[9px] font-black text-white shadow-xs leading-none select-none ${
                        pulseAlerts 
                          ? (urgentAlertsCount > 0 ? 'alert-pulse-rose bg-rose-600' : 'alert-pulse-amber bg-amber-500')
                          : (urgentAlertsCount > 0 ? 'bg-rose-600' : 'bg-amber-500')
                      }`}>
                        {totalAlertsCount > 99 ? '99+' : totalAlertsCount}
                      </span>
                    </span>
                  )}
                </div>
                <span>{t.alerts}</span>
              </button>
            </nav>

            {/* Row 2 on Mobile / Right Actions on Desktop: Circle icons + Lang on left, Vehicule button on right */}
            <div className="flex items-center gap-2 justify-between sm:justify-end w-full">
              {/* Left Actions Group: Theme (Circle), QR (Circle), Backup (Circle), Lang (Compact) */}
              <div className="flex items-center gap-1.5 shrink-0">
                {/* Theme Toggle: Circle only, no text */}
                <button
                  type="button"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-2xs shrink-0 cursor-pointer active:scale-90 transition-all"
                  title={theme === 'dark' ? "Comută la Modul Luminos" : "Comută la Modul Întunecat"}
                >
                  {theme === 'dark' ? (
                    <Sun className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Moon className="w-4 h-4 text-indigo-500" />
                  )}
                </button>

                {/* QR Code Button */}
                {onOpenConnect && (
                  <button
                    type="button"
                    onClick={onOpenConnect}
                    className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 transition-all flex items-center justify-center shrink-0 shadow-2xs cursor-pointer active:scale-90"
                    title="📲 Conectare Cod QR & Descarcă APK"
                  >
                    <QrCode className="w-4 h-4 stroke-[2.2]" />
                  </button>
                )}

                {/* Export & Backup Button */}
                {onOpenExport && (
                  <button
                    type="button"
                    onClick={onOpenExport}
                    className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 transition-all flex items-center justify-center shrink-0 shadow-2xs cursor-pointer active:scale-90"
                    title="Export & Import Date (Backup)"
                  >
                    <CloudUpload className="w-4 h-4 stroke-[2.2]" />
                  </button>
                )}

                {/* Fullscreen / Immersive Scroll Toggle Button (Next to Export) */}
                <button
                  type="button"
                  onClick={onToggleImmersive}
                  className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 transition-all flex items-center justify-center shrink-0 shadow-2xs cursor-pointer active:scale-90"
                  title={lang === 'en' ? "Full Screen Scroll (Hide Header & Bottom Bar)" : "Ecran complet (ascunde antetul și bara de jos)"}
                >
                  <Maximize2 className="w-4 h-4 stroke-[2.2]" />
                </button>

              </div>

              {/* Vehicule Button with vehicle count in circle */}
              <button
                type="button"
                onClick={onOpenVehicles}
                className="h-8 sm:h-8.5 flex items-center justify-center gap-2 px-3.5 sm:px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-md shadow-emerald-500/25 transition-all transform active:scale-95 shrink-0 cursor-pointer"
                title={t.vehicles || "Vehicule"}
              >
                <Car className="w-3.5 h-3.5 stroke-[2.5]" />
                <span className="text-xs font-black tracking-tight whitespace-nowrap">
                  {t.vehicles || (lang === 'en' ? 'Vehicles' : 'Vehicule')}
                </span>
                <span className="w-5 h-5 rounded-full bg-slate-950 text-emerald-300 font-mono font-black text-[10.5px] flex items-center justify-center shadow-xs ml-0.5">
                  {vehiclesCount || 0}
                </span>
                <ChevronDown className="w-3 h-3 stroke-[2.5] opacity-80" />
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Dynamic spacer behind fixed navbar so content flows right below it */}
      {!isImmersive && (
        <div 
          aria-hidden="true" 
          className="pointer-events-none transition-all duration-200 shrink-0 h-[94px] sm:h-[60px]" 
        />
      )}
    </>
  );
};
