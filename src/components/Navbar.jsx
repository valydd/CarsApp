import React, { useState, useRef, useEffect } from 'react';
import { 
  Car, 
  Plus, 
  Globe, 
  FileSpreadsheet, 
  ShieldAlert,
  Shield,
  ShieldCheck,
  AlertCircle,
  AlertTriangle,
  ChevronRight,
  X,
  BarChart3,
  History,
  Sun,
  Moon,
  QrCode,
  CloudUpload,
  ChevronDown,
  Maximize2,
  Minimize2,
  Smartphone
} from 'lucide-react';
import { translations, getLanguageConfig } from '../i18n';
import { APP_VERSION } from '../version';

export const Navbar = ({ 
  lang, 
  setLang, 
  onOpenLanguageModal,
  theme,
  setTheme,
  activeTab, 
  setActiveTab, 
  onOpenQuickAdd, 
  onOpenAddVehicle, 
  onOpenExport,
  onOpenConnect,
  onOpenVehicles,
  onOpenWidgetSettings,
  urgentAlertsCount = 0,
  totalAlertsCount = 0,
  hasUnfinishedTrip = false,
  pulseAlerts = true,
  vehiclesCount = 0,
  vehicles = [],
  selectedVehicleIds = [],
  activeVehicles = [],
  onSelectAllVehicles,
  onOpenAlertsTab,
  isImmersive = false,
  onToggleImmersive
}) => {
  const [isAppMenuOpen, setIsAppMenuOpen] = useState(false);
  const appMenuRef = useRef(null);
  const logoBtnRef = useRef(null);
  const justClosedMenuRef = useRef(false);

  // Global blocker for ghost clicks (touch tap-through) after dismissing menu
  useEffect(() => {
    const blockGhostClick = (e) => {
      if (justClosedMenuRef.current) {
        e.preventDefault();
        e.stopPropagation();
        if (e.stopImmediatePropagation) {
          e.stopImmediatePropagation();
        }
      }
    };

    window.addEventListener('click', blockGhostClick, true);
    window.addEventListener('pointerdown', blockGhostClick, true);
    window.addEventListener('pointerup', blockGhostClick, true);
    window.addEventListener('touchend', blockGhostClick, true);

    return () => {
      window.removeEventListener('click', blockGhostClick, true);
      window.removeEventListener('pointerdown', blockGhostClick, true);
      window.removeEventListener('pointerup', blockGhostClick, true);
      window.removeEventListener('touchend', blockGhostClick, true);
    };
  }, []);

  const handleDismissMenu = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    justClosedMenuRef.current = true;
    setIsAppMenuOpen(false);
    setTimeout(() => {
      justClosedMenuRef.current = false;
    }, 450);
  };

  useEffect(() => {
    if (!isAppMenuOpen) return;

    const interceptOutsideEvent = (e) => {
      // Allow clicks/touches inside the menu
      if (appMenuRef.current && appMenuRef.current.contains(e.target)) {
        return;
      }
      // Allow clicks/touches on the logo button
      if (logoBtnRef.current && logoBtnRef.current.contains(e.target)) {
        return;
      }

      handleDismissMenu(e);
    };

    document.addEventListener('pointerdown', interceptOutsideEvent, true);
    document.addEventListener('touchstart', interceptOutsideEvent, { capture: true, passive: false });
    document.addEventListener('click', interceptOutsideEvent, true);

    return () => {
      document.removeEventListener('pointerdown', interceptOutsideEvent, true);
      document.removeEventListener('touchstart', interceptOutsideEvent, { capture: true, passive: false });
      document.removeEventListener('click', interceptOutsideEvent, true);
    };
  }, [isAppMenuOpen]);

  const t = translations[lang] || translations.ro;
  const currentLangConfig = getLanguageConfig(lang);

  const isAllSelected = !selectedVehicleIds || selectedVehicleIds.length === (vehicles?.length || vehiclesCount || 0);
  const selectedVehicles = vehicles.filter(v => selectedVehicleIds?.includes(v.id));
  const singleVehicle = selectedVehicles.length === 1 ? selectedVehicles[0] : (activeVehicles?.length === 1 ? activeVehicles[0] : null);

  const renderAlertButton = (extraClass = '') => (
    <button
      type="button"
      onClick={onOpenAlertsTab}
      className={`h-8 px-2 sm:px-2.5 rounded-xl border flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95 transition-all text-[11px] font-black max-w-[155px] sm:max-w-[175px] shadow-2xs ${
        urgentAlertsCount > 0
          ? 'bg-rose-50/90 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 hover:border-rose-400'
          : (totalAlertsCount > 0
              ? 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 hover:border-amber-400'
              : 'bg-emerald-50/90 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:border-emerald-300')
      } ${extraClass}`}
      title={t.tapForAlerts || "Apasă pentru detalii scadențe"}
    >
      {urgentAlertsCount > 0 ? (
        <>
          <span className="relative flex h-2 w-2 shrink-0">
            {pulseAlerts && (
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
                hasUnfinishedTrip ? 'bg-rose-400' : 'bg-rose-400'
              } opacity-75`} />
            )}
            <span className={`relative inline-flex rounded-full h-2 w-2 ${
              hasUnfinishedTrip ? 'bg-rose-400 dark:bg-rose-500 ring-1 ring-rose-300' : 'bg-rose-600'
            }`} />
          </span>
          <AlertCircle className={`w-3.5 h-3.5 ${hasUnfinishedTrip ? 'text-rose-500 dark:text-rose-400' : 'text-rose-600 dark:text-rose-400'} shrink-0`} />
          <span className="truncate">
            {urgentAlertsCount} {urgentAlertsCount === 1 ? (t.overdueSingularShort || 'scadență') : (t.overduePluralShort || 'scadențe')}
          </span>
          <ChevronRight className="w-3 h-3 text-rose-500 opacity-80 shrink-0" />
        </>
      ) : totalAlertsCount > 0 ? (
        <>
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
          <span className="truncate">
            {totalAlertsCount} {totalAlertsCount === 1 ? (t.warningSingularShort || 'scadență') : (t.warningPluralShort || 'scadențe')}
          </span>
          <ChevronRight className="w-3 h-3 text-amber-500 opacity-80 shrink-0" />
        </>
      ) : (
        <>
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="truncate">{t.upToDate || "La zi ✓"}</span>
        </>
      )}
    </button>
  );

  return (
    <>
      {/* Floating button at top right when in Immersive / Full Screen Mode */}
      {isImmersive && (
        <button
          type="button"
          onClick={onToggleImmersive}
          className="fixed top-2.5 sm:top-4 right-3 sm:right-6 z-50 w-8 h-8 rounded-full bg-white/95 dark:bg-slate-900/95 text-emerald-600 dark:text-emerald-400 border-2 border-emerald-500/85 dark:border-emerald-400/90 shadow-md shadow-emerald-500/20 dark:shadow-black/40 backdrop-blur-md flex items-center justify-center cursor-pointer active:scale-90 hover:scale-105 transition-all animate-in fade-in slide-in-from-top-3 duration-200"
          title={t.restoreNav || "Afișează antetul și bara de jos"}
          aria-label="Restore Header & Navigation"
        >
          <Minimize2 className="w-4 h-4 stroke-[2.8]" />
        </button>
      )}

      {/* Fullscreen Backdrop when App Menu is open */}
      {isAppMenuOpen && !isImmersive && (
        <div 
          className="fixed inset-0 z-[48] bg-black/25 dark:bg-black/50 backdrop-blur-xs cursor-pointer select-none animate-in fade-in duration-150" 
          onPointerDown={handleDismissMenu}
          onTouchStart={handleDismissMenu}
          onClick={handleDismissMenu}
        />
      )}

      {/* Main Top Header (Hidden in Immersive Mode) */}
      {!isImmersive && (
        <header className={`fixed top-0 left-0 right-0 ${isAppMenuOpen ? 'z-50' : 'z-40'} bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 px-3 sm:px-6 py-2.5 transition-colors`}>
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
            
            {/* Row 1 on Mobile / Left side on Desktop: Brand (with App Menu) + Alert Button */}
            <div className="flex items-center justify-between sm:justify-start gap-2.5 transition-all duration-300">
              {/* Logo + Name + Version (Logo opens dropdown menu with Theme, QR, Backup, Fullscreen, Language) */}
              <div className="relative flex items-center gap-2">
                <button
                  ref={logoBtnRef}
                  type="button"
                  onClick={() => setIsAppMenuOpen(prev => !prev)}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-md shadow-emerald-500/20 text-slate-950 font-black text-base sm:text-lg shrink-0 cursor-pointer active:scale-90 hover:scale-105 transition-all"
                  title="Meniu aplicație (Limbă, Temă, Backup, QR)"
                  aria-expanded={isAppMenuOpen}
                >
                  🚗
                </button>
                <h1 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight shrink-0 flex items-center gap-1.5">
                  <span>{t.appName}</span>
                  <span className="text-[8px] font-mono font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-1 py-0.2 rounded border border-slate-200 dark:border-slate-700/60 leading-tight">
                    v{APP_VERSION}
                  </span>
                </h1>

                {/* Dropdown Menu when clicking 🚗 icon */}
                {isAppMenuOpen && (
                  <div 
                    ref={appMenuRef}
                    className="absolute top-full left-0 mt-2 z-50 w-64 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-1.5 flex flex-col gap-0.5 animate-in fade-in slide-in-from-top-2 duration-150"
                  >
                    
                    {/* 1. Language Selector */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsAppMenuOpen(false);
                        onOpenLanguageModal && onOpenLanguageModal();
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-base leading-none">{currentLangConfig.flag}</span>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                          {t.selectLanguage || "Schimbă limba"}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono font-black text-slate-500 uppercase bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700/80">
                        {currentLangConfig.code}
                      </span>
                    </button>

                    <div className="h-px bg-slate-200/80 dark:bg-slate-800/80 my-0.5 mx-1" />

                    {/* 2. Theme Toggle */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsAppMenuOpen(false);
                        setTheme(theme === 'dark' ? 'light' : 'dark');
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors cursor-pointer"
                    >
                        <div className="flex items-center gap-2.5">
                          <div className="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-500 flex items-center justify-center">
                            {theme === 'dark' ? (
                              <Sun className="w-3.5 h-3.5 text-amber-400" />
                            ) : (
                              <Moon className="w-3.5 h-3.5 text-indigo-500" />
                            )}
                          </div>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {theme === 'dark' ? (t.lightMode || "Mod Luminos") : (t.darkMode || "Mod Întunecat")}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 capitalize">
                          {theme === 'dark' ? "Dark" : "Light"}
                        </span>
                      </button>

                      {/* 3. QR Connect & Download APK */}
                      {onOpenConnect && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsAppMenuOpen(false);
                            onOpenConnect();
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors cursor-pointer"
                        >
                          <div className="w-6 h-6 rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                            <QrCode className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {t.connectQr || "Conectare QR & APK"}
                          </span>
                        </button>
                      )}

                      {/* 4. Export & Backup */}
                      {onOpenExport && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsAppMenuOpen(false);
                            onOpenExport();
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors cursor-pointer"
                        >
                          <div className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                            <CloudUpload className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {t.backupExport || "Export & Backup"}
                          </span>
                        </button>
                      )}

                      {/* 5. Widget Ecran Pornire */}
                      {onOpenWidgetSettings && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsAppMenuOpen(false);
                            onOpenWidgetSettings();
                          }}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-6 h-6 rounded-lg bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                              <Smartphone className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                              {t.widgetSettings || "Widget Ecran (4x1, 2x1, 4x3)"}
                            </span>
                          </div>
                          <span className="text-[9px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded">
                            Nou
                          </span>
                        </button>
                      )}

                      {/* 6. Fullscreen / Immersive */}
                      <button
                        type="button"
                        onClick={() => {
                          setIsAppMenuOpen(false);
                          onToggleImmersive && onToggleImmersive();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors cursor-pointer"
                      >
                        <div className="w-6 h-6 rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                          <Maximize2 className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {t.fullScreen || "Ecran complet"}
                        </span>
                      </button>
                    </div>
                )}
              </div>

              {/* On Mobile: Compact Alert Button in place of RO button */}
              {renderAlertButton('sm:hidden')}
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
                {t.fleetOverview || 'Panou'}
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

            {/* Row 2 on Mobile / Right Actions on Desktop: Vehicle Plate Pill on left, Vehicule button on right */}
            <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
              
              {/* Left: Vehicle Plate / Filter Pill */}
              <div className="shrink-0 flex items-center min-w-0">
                {/* Exactly 1 vehicle selected: License plate tag with X */}
                {singleVehicle && (
                  <div 
                    onClick={onOpenVehicles}
                    className="h-8 inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-700 dark:border-slate-500 px-2.5 rounded-xl text-[11px] font-mono font-black text-slate-900 dark:text-slate-100 shadow-2xs whitespace-nowrap cursor-pointer transition-colors"
                    title={t.filterVehicles || "Filtrează mașinile"}
                  >
                    <span className="text-[8.5px] text-blue-500 font-bold leading-none">RO</span>
                    <span className="leading-none tracking-tight">{singleVehicle.plate}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectAllVehicles && onSelectAllVehicles(true);
                      }}
                      className="text-slate-400 hover:text-rose-500 p-0.5 rounded-md transition-colors ml-0.5 cursor-pointer"
                      title={t.selectAll || "Selectează toate vehiculele"}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {/* All vehicles selected: "Toate (N)" pill */}
                {isAllSelected && !singleVehicle && (
                  <button 
                    type="button"
                    onClick={onOpenVehicles}
                    className="h-8 inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 px-2.5 rounded-xl text-[11px] font-extrabold text-slate-800 dark:text-slate-200 shadow-2xs cursor-pointer whitespace-nowrap active:scale-95 transition-all"
                    title={t.filterVehicles || "Filtrează mașinile"}
                  >
                    <Car className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>{t.allVehiclesFilter || "Toate"} ({vehicles?.length || vehiclesCount || 0})</span>
                  </button>
                )}

                {/* Subset of vehicles selected: "N / Total x" pill */}
                {!isAllSelected && !singleVehicle && (
                  <div className="h-8 inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/40 px-2.5 rounded-xl text-[11px] font-extrabold text-emerald-700 dark:text-emerald-300 shadow-2xs whitespace-nowrap">
                    <span>
                      {selectedVehicleIds?.length || 0} / {vehicles?.length || vehiclesCount || 0}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectAllVehicles && onSelectAllVehicles(true);
                      }}
                      className="text-emerald-600 dark:text-emerald-400 hover:text-rose-500 p-0.5 rounded-md transition-colors ml-0.5 cursor-pointer"
                      title={t.selectAll || "Selectează toate"}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              {/* On Desktop: Alert Button between Plate Pill and Vehicule Button */}
              {renderAlertButton('hidden sm:flex')}

              {/* Right: Vehicule Button with vehicle count in circle */}
              <button
                type="button"
                onClick={onOpenVehicles}
                className="h-8 sm:h-8.5 flex items-center justify-center gap-2 px-3.5 sm:px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-md shadow-emerald-500/25 transition-all transform active:scale-95 shrink-0 cursor-pointer"
                title={t.vehicles || "Vehicule"}
              >
                <Car className="w-3.5 h-3.5 stroke-[2.5]" />
                <span className="text-xs font-black tracking-tight whitespace-nowrap">
                  {t.vehicles || 'Vehicule'}
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
