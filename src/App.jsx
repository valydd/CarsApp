import React, { useState, useEffect } from 'react';
import { App as CapApp } from '@capacitor/app';
import { Navbar } from './components/Navbar';
import { VehicleCarousel } from './components/VehicleCarousel';
import { AlertsBanner } from './components/AlertsBanner';
import { DashboardStats } from './components/DashboardStats';
import { CostRankings } from './components/CostRankings';
import { RecordsList } from './components/RecordsList';
import { QuickAddModal } from './components/QuickAddModal';
import { AddVehicleModal } from './components/AddVehicleModal';
import { VehicleDetailsModal } from './components/VehicleDetailsModal';
import { ExportModal } from './components/ExportModal';
import { FuelConsumptionView } from './components/FuelConsumptionView';
import { PersonalTripsView } from './components/PersonalTripsView';
import { AddPersonalTripModal } from './components/AddPersonalTripModal';
import { CategoryDetailView } from './components/CategoryDetailView';
import { CostPerKmView } from './components/CostPerKmView';
import { ConnectModal } from './components/ConnectModal';

import { 
  getStoredVehicles, 
  saveStoredVehicles, 
  getStoredRecords, 
  saveStoredRecords, 
  getStoredPersonalTrips,
  saveStoredPersonalTrips,
  getStoredSelectedVehicleIds,
  saveStoredSelectedVehicleIds,
  getStoredLanguage, 
  setStoredLanguage,
  getStoredTheme,
  setStoredTheme,
  getStoredPulseAlerts,
  setStoredPulseAlerts,
  getStoredImmersiveMode,
  setStoredImmersiveMode,
  initNativeDatabase
} from './storage';
import { calculateVehicleConsumption, calculateFleetConsumption, getVehicleAlerts, calculateCostRankings } from './utils/calculations';
import { translations } from './i18n';

import { 
  Car, 
  BarChart3, 
  History, 
  Shield,
  ShieldAlert, 
  Plus, 
  PlusCircle, 
  Wrench, 
  Fuel, 
  Sparkles,
  ChevronRight,
  ArrowLeft,
  AlertTriangle,
  Bell,
  BellOff
} from 'lucide-react';

export function App() {
  const [lang, setLangState] = useState(getStoredLanguage());
  const [theme, setThemeState] = useState(getStoredTheme());
  const [vehicles, setVehicles] = useState(getStoredVehicles());
  const [records, setRecords] = useState(getStoredRecords());
  const [selectedVehicleIds, setSelectedVehicleIds] = useState(() => getStoredSelectedVehicleIds(getStoredVehicles()));
  const [activeTab, setActiveTab] = useState('dashboard');
  const [pulseAlerts, setPulseAlerts] = useState(getStoredPulseAlerts);
  const [isImmersive, setIsImmersive] = useState(getStoredImmersiveMode);

  const handleTogglePulseAlerts = () => {
    setPulseAlerts(prev => {
      const next = !prev;
      setStoredPulseAlerts(next);
      return next;
    });
  };

  const handleToggleImmersive = () => {
    setIsImmersive(prev => {
      const next = !prev;
      setStoredImmersiveMode(next);
      return next;
    });
  };

  // Modals
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddCategory, setQuickAddCategory] = useState('fuel');
  const [recordToEdit, setRecordToEdit] = useState(null);
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [selectedVehicleForDetails, setSelectedVehicleForDetails] = useState(null);
  const [isVehicleDetailsInEdit, setIsVehicleDetailsInEdit] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isConnectOpen, setIsConnectOpen] = useState(false);
  const [isVehiclesModalOpen, setIsVehiclesModalOpen] = useState(false);

  // Personal Trips State
  const [personalTrips, setPersonalTrips] = useState(getStoredPersonalTrips);
  const [isPersonalModalOpen, setIsPersonalModalOpen] = useState(false);
  const [tripToEdit, setTripToEdit] = useState(null);
  const [ongoingTripAlert, setOngoingTripAlert] = useState(null);
  const [hasCheckedOngoingTrip, setHasCheckedOngoingTrip] = useState(false);

  // Check on app launch if there is an uncompleted personal trip
  useEffect(() => {
    if (!hasCheckedOngoingTrip && personalTrips.length > 0) {
      const ongoing = personalTrips.find(t => !t.endKm || t.isOngoing);
      if (ongoing) {
        setOngoingTripAlert(ongoing);
      }
      setHasCheckedOngoingTrip(true);
    }
  }, [personalTrips, hasCheckedOngoingTrip]);

  const t = translations[lang];

  const setLang = (newLang) => {
    setLangState(newLang);
    setStoredLanguage(newLang);
  };

  const setTheme = (newTheme) => {
    setThemeState(newTheme);
    setStoredTheme(newTheme);
  };

  // Sync theme with HTML document element
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Recover from native persistent database on Android if available
  useEffect(() => {
    const recoverFromDisk = async () => {
      const recovered = await initNativeDatabase();
      if (recovered && recovered.vehicles && recovered.vehicles.length > 0) {
        setVehicles(recovered.vehicles);
        if (recovered.records) setRecords(recovered.records);
        if (recovered.personalTrips) setPersonalTrips(recovered.personalTrips);
        
        // Retain saved vehicle selection (DO NOT reset to all vehicles!)
        const savedIds = recovered.selectedVehicleIds || getStoredSelectedVehicleIds(recovered.vehicles);
        if (Array.isArray(savedIds) && savedIds.length > 0) {
          const valid = savedIds.filter(id => recovered.vehicles.some(v => v.id === id));
          if (valid.length > 0) {
            setSelectedVehicleIds(valid);
          }
        }
      }
    };
    recoverFromDisk();
  }, []);

  // Sync state to LocalStorage
  useEffect(() => {
    saveStoredVehicles(vehicles);
  }, [vehicles]);

  useEffect(() => {
    saveStoredRecords(records);
  }, [records]);

  useEffect(() => {
    saveStoredSelectedVehicleIds(selectedVehicleIds);
  }, [selectedVehicleIds]);

  // Handle adding or updating record from QuickAdd
  const handleSaveRecord = (savedRecord, vehicleUpdates = {}) => {
    if (recordToEdit) {
      setRecords(prev => prev.map(r => r.id === savedRecord.id ? savedRecord : r));
      setRecordToEdit(null);
    } else {
      setRecords(prev => [savedRecord, ...prev]);
    }

    setVehicles(prevVehicles => prevVehicles.map(veh => {
      if (veh.id === savedRecord.vehicleId) {
        return {
          ...veh,
          currentKm: vehicleUpdates.updatedKm && vehicleUpdates.updatedKm > (veh.currentKm || 0)
            ? vehicleUpdates.updatedKm
            : veh.currentKm,
          nextServiceKm: vehicleUpdates.nextServiceKm || veh.nextServiceKm,
          nextServiceDate: vehicleUpdates.nextServiceDate || veh.nextServiceDate,
          oilType: vehicleUpdates.oilType || veh.oilType,
          oilBrand: vehicleUpdates.oilBrand || veh.oilBrand,
          itpExpiry: vehicleUpdates.itpExpiry || veh.itpExpiry,
          rcaExpiry: vehicleUpdates.rcaExpiry || veh.rcaExpiry,
          rovinietaExpiry: vehicleUpdates.rovinietaExpiry || veh.rovinietaExpiry,
          tires: vehicleUpdates.tires || veh.tires
        };
      }
      return veh;
    }));
  };

  const handleEditRecord = (rec) => {
    setRecordToEdit(rec);
    setIsQuickAddOpen(true);
  };

  const handleDeleteRecord = (recordId) => {
    setRecords(prev => prev.filter(r => r.id !== recordId));
  };

  const handleToggleVehicle = (vehId) => {
    setSelectedVehicleIds(prev => {
      if (prev.includes(vehId)) {
        return prev.filter(id => id !== vehId);
      } else {
        return [...prev, vehId];
      }
    });
  };

  const handleSelectAllVehicles = (selectAll = true) => {
    if (selectAll) {
      setSelectedVehicleIds(vehicles.map(v => v.id));
    } else {
      setSelectedVehicleIds([]);
    }
  };

  const handleAddVehicle = (newVeh) => {
    setVehicles(prev => [...prev, newVeh]);
    setSelectedVehicleIds(prev => [...prev, newVeh.id]);
  };

  const handleUpdateVehicle = (updatedVeh) => {
    setVehicles(prev => prev.map(v => v.id === updatedVeh.id ? updatedVeh : v));
  };

  const handleDeleteVehicle = (vehId) => {
    setVehicles(prev => prev.filter(v => v.id !== vehId));
    setRecords(prev => prev.filter(r => r.vehicleId !== vehId));
    setSelectedVehicleIds(prev => prev.filter(id => id !== vehId));
  };

  const handleDataRestored = (restoredVehicles, restoredRecords, restoredTrips = null) => {
    const v = Array.isArray(restoredVehicles) ? restoredVehicles : [];
    const r = Array.isArray(restoredRecords) ? restoredRecords : [];
    const pt = Array.isArray(restoredTrips) ? restoredTrips : [];

    setVehicles(v);
    saveStoredVehicles(v);
    setRecords(r);
    saveStoredRecords(r);
    setPersonalTrips(pt);
    saveStoredPersonalTrips(pt);
    const selIds = v.map(item => item.id);
    setSelectedVehicleIds(selIds);
    saveStoredSelectedVehicleIds(selIds);
  };

  const handleSavePersonalTrip = (tripData) => {
    let updated;
    if (tripToEdit) {
      updated = personalTrips.map(t => t.id === tripData.id ? tripData : t);
    } else {
      updated = [tripData, ...personalTrips];
    }
    setPersonalTrips(updated);
    saveStoredPersonalTrips(updated);
    setTripToEdit(null);
  };

  const handleDeletePersonalTrip = (tripId) => {
    const updated = personalTrips.filter(t => t.id !== tripId);
    setPersonalTrips(updated);
    saveStoredPersonalTrips(updated);
  };

  const handleEditPersonalTrip = (trip) => {
    setTripToEdit(trip);
    setIsPersonalModalOpen(true);
  };

  const handleToggleTripPaid = (tripId) => {
    const updated = personalTrips.map(t => t.id === tripId ? { ...t, isPaid: !t.isPaid } : t);
    setPersonalTrips(updated);
    saveStoredPersonalTrips(updated);
  };

  // Centralized Go-Back Function (for swipe, back button, etc.)
  const goBack = () => {
    if (isPersonalModalOpen) {
      setIsPersonalModalOpen(false);
      setTripToEdit(null);
      return;
    }
    if (isQuickAddOpen) {
      setIsQuickAddOpen(false);
      setRecordToEdit(null);
      return;
    }
    if (isAddVehicleOpen) {
      setIsAddVehicleOpen(false);
      return;
    }
    if (selectedVehicleForDetails) {
      setSelectedVehicleForDetails(null);
      return;
    }
    if (isExportOpen) {
      setIsExportOpen(false);
      return;
    }
    if (isConnectOpen) {
      setIsConnectOpen(false);
      return;
    }

    if (activeTab !== 'dashboard') {
      setActiveTab('dashboard');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Touch Swipe Right gesture detection
  const [touchStartPos, setTouchStartPos] = useState(null);

  const handleTouchStart = (e) => {
    if (!e.touches || e.touches.length !== 1) {
      setTouchStartPos(null);
      return;
    }

    const target = e.target;
    if (target && target.closest) {
      // Ignore horizontal scrolling containers or explicit no-swipe elements
      const noSwipeEl = target.closest('.overflow-x-auto, .overflow-x-scroll, [data-no-swipe]');
      if (noSwipeEl) {
        setTouchStartPos(null);
        return;
      }

      // Check if any ancestor container has horizontal scroll
      let el = target;
      while (el && el !== document.body && el !== document.documentElement) {
        if (el.scrollWidth > el.clientWidth) {
          try {
            const style = window.getComputedStyle(el);
            if (style.overflowX === 'auto' || style.overflowX === 'scroll') {
              setTouchStartPos(null);
              return;
            }
          } catch (_) {}
        }
        el = el.parentElement;
      }
    }

    // Edge swipe only: swipe-to-back must start near the left edge of the screen (<= 30px)
    if (e.touches[0].clientX > 30) {
      setTouchStartPos(null);
      return;
    }

    setTouchStartPos({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now()
    });
  };

  const handleTouchEnd = (e) => {
    if (!touchStartPos || !e.changedTouches || e.changedTouches.length === 0) {
      setTouchStartPos(null);
      return;
    }
    const diffX = e.changedTouches[0].clientX - touchStartPos.x;
    const diffY = e.changedTouches[0].clientY - touchStartPos.y;
    const elapsed = Date.now() - touchStartPos.time;

    // Swipe Right: moved at least 65px right, mostly horizontal (|diffY| < 65px), within 500ms
    if (diffX > 65 && Math.abs(diffY) < 65 && elapsed < 500) {
      goBack();
    }
    setTouchStartPos(null);
  };

  const handleTouchCancel = () => {
    setTouchStartPos(null);
  };

  // Android Back Button handler
  useEffect(() => {
    let backListener = null;
    try {
      CapApp.addListener('backButton', () => {
        if (activeTab !== 'dashboard' || isQuickAddOpen || isPersonalModalOpen || isAddVehicleOpen || selectedVehicleForDetails || isExportOpen || isConnectOpen) {
          goBack();
        } else {
          CapApp.exitApp();
        }
      }).then(l => {
        backListener = l;
      });
    } catch (e) {
      // Browser environment fallback
    }

    return () => {
      if (backListener && backListener.remove) {
        backListener.remove();
      }
    };
  }, [activeTab, isQuickAddOpen, isPersonalModalOpen, isAddVehicleOpen, selectedVehicleForDetails, isExportOpen, isConnectOpen]);

  const isAllSelected = selectedVehicleIds.length === vehicles.length;
  const activeVehicles = vehicles.filter(v => selectedVehicleIds.includes(v.id));
  const activeVehicle = activeVehicles.length === 1 ? activeVehicles[0] : null;
  const filteredRecords = isAllSelected 
    ? records 
    : records.filter(r => selectedVehicleIds.includes(r.vehicleId));

  const totalExpenses = filteredRecords.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
  const consumptionData = activeVehicles.length === 1 
    ? calculateVehicleConsumption(filteredRecords)
    : calculateFleetConsumption(activeVehicles, filteredRecords);

  const targetAlertVehicles = (activeVehicles && activeVehicles.length > 0) ? activeVehicles : vehicles;
  const allAlerts = [];
  (targetAlertVehicles || []).forEach(v => {
    if (!v) return;
    const alerts = getVehicleAlerts(v);
    (alerts || []).forEach(a => allAlerts.push(a));
  });
  const urgentAlertsCount = allAlerts.filter(a => a && a.severity === 'critical').length;
  const warningAlertsCount = allAlerts.filter(a => a && a.severity === 'warning').length;
  const totalAlertsCount = allAlerts.length;
  const totalKmSum = (activeVehicles || []).reduce((sum, v) => sum + (v?.currentKm || 0), 0);

  return (
    <div 
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      className={`min-h-screen bg-slate-100 dark:bg-[#090d16] text-slate-800 dark:text-slate-100 ${
        isImmersive ? 'pb-4 md:pb-6' : 'pb-20 md:pb-12'
      } selection:bg-emerald-500 selection:text-slate-950 font-sans transition-colors duration-200 overflow-x-clip w-full max-w-full`}
    >
      
      {/* Top Navbar */}
      <Navbar
        lang={lang}
        setLang={setLang}
        theme={theme}
        setTheme={setTheme}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenQuickAdd={() => setIsQuickAddOpen(true)}
        onOpenAddVehicle={() => setIsAddVehicleOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenConnect={() => setIsConnectOpen(true)}
        onOpenVehicles={() => setIsVehiclesModalOpen(true)}
        urgentAlertsCount={urgentAlertsCount}
        totalAlertsCount={totalAlertsCount}
        pulseAlerts={pulseAlerts}
        vehiclesCount={vehicles.length}
        isImmersive={isImmersive}
        onToggleImmersive={handleToggleImmersive}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-3 py-2.5 sm:px-6 sm:py-4">
        
        {/* Unified Top Row: License plate on left, Alerts banner inline on right + Full Vehicles Modal */}
        <VehicleCarousel
          vehicles={vehicles}
          selectedVehicleIds={selectedVehicleIds}
          onToggleVehicle={handleToggleVehicle}
          onSelectAllVehicles={handleSelectAllVehicles}
          onOpenAddVehicle={() => setIsAddVehicleOpen(true)}
          onOpenVehicleDetails={(veh, startInEdit = false) => {
            setSelectedVehicleForDetails(veh);
            setIsVehicleDetailsInEdit(startInEdit);
          }}
          onDeleteVehicle={handleDeleteVehicle}
          isOpen={isVehiclesModalOpen}
          setIsOpen={setIsVehiclesModalOpen}
          onOpenAlertsTab={() => {
            setActiveTab('alerts');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          activeVehicles={activeVehicles}
          lang={lang}
        />

        {/* Tab Content */}
        {activeTab === 'dashboard' && (
          <div className="space-y-4 sm:space-y-6">

            {/* KPI Dashboard Cards (Clickable) */}
            {/* 8 Compact Organized Cards (Clickable) */}
            <DashboardStats
              totalExpenses={totalExpenses}
              avgConsumption={consumptionData.avgLitersPer100Km}
              costPerKm={consumptionData.costPerKm}
              totalKm={activeVehicle ? (activeVehicle.currentKm || 0) : totalKmSum}
              activeAlertsCount={allAlerts.length}
              selectedVehicle={activeVehicle}
              selectedCount={activeVehicles.length}
              totalVehiclesCount={vehicles.length}
              onNavigateTab={(tab) => {
                setActiveTab(tab);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenAddPersonalTrip={() => {
                setTripToEdit(null);
                setIsPersonalModalOpen(true);
              }}
              records={filteredRecords}
              vehicles={vehicles}
              personalTrips={personalTrips}
              lang={lang}
            />

          </div>
        )}

        {/* TAB 2: Clasament & Analiză Costuri pe tot ecranul */}
        {activeTab === 'rankings' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <button
                onClick={() => {
                  setActiveTab('dashboard');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl shadow-2xs transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{t.dashboard || (lang === 'en' ? "Main Dashboard" : "Panou Principal")}</span>
              </button>
              {!isAllSelected && (
                <button
                  onClick={() => handleSelectAllVehicles(true)}
                  className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  {lang === 'en' ? "All vehicles" : "Toate mașinile"}
                </button>
              )}
            </div>
            <CostRankings
              vehicles={activeVehicles.length > 0 ? activeVehicles : vehicles}
              records={filteredRecords}
              onSelectVehicle={(vId) => setSelectedVehicleIds(vId ? [vId] : vehicles.map(v => v.id))}
              selectedVehicleId={activeVehicle ? activeVehicle.id : null}
              onNavigateTab={(tab) => {
                setActiveTab(tab);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              lang={lang}
            />
          </div>
        )}

        {/* TAB 3: Jurnal Activități pe tot ecranul */}
        {activeTab === 'records' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <button
                onClick={() => {
                  setActiveTab('dashboard');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl shadow-2xs transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{t.dashboard || (lang === 'en' ? "Main Dashboard" : "Panou Principal")}</span>
              </button>
              {!isAllSelected && (
                <button
                  onClick={() => handleSelectAllVehicles(true)}
                  className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  {lang === 'en' ? "All vehicles" : "Toate mașinile"}
                </button>
              )}
            </div>
            <RecordsList
              records={filteredRecords}
              vehicles={vehicles}
              onDeleteRecord={handleDeleteRecord}
              onEditRecord={handleEditRecord}
              selectedVehicleId={activeVehicle ? activeVehicle.id : null}
              lang={lang}
            />
          </div>
        )}

        {/* TAB 4: Alerte pe tot ecranul */}
        {activeTab === 'alerts' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 px-1">
              <button
                onClick={() => {
                  setActiveTab('dashboard');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl shadow-2xs transition-colors shrink-0 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{lang === 'en' ? "Back" : "Înapoi"}</span>
              </button>
              <h2 className="text-base font-black text-slate-900 dark:text-white truncate">
                {t.alertsTitle || (lang === 'en' ? "Deadlines & Alerts" : "Atenționări la Scadență")}
              </h2>
            </div>

            {/* Opțiune Activare / Oprire Pulsare Bulină Atenționare */}
            <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-2xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`p-2 rounded-xl shrink-0 ${pulseAlerts ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                  {pulseAlerts ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>{lang === 'en' ? "Alert Button Pulsing" : "Pulsare Buton Alerte"}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${pulseAlerts ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>
                      {pulseAlerts ? (lang === 'en' ? "ACTIVE" : "ACTIV") : (lang === 'en' ? "STOPPED" : "OPRIT")}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {pulseAlerts 
                      ? (lang === 'en' ? "Button pulses with visible rectangular ripples" : "Butonul pulsează cu irizații vizibile în forma butonului") 
                      : (lang === 'en' ? "Pulsing stopped (button remains colored for active alerts)" : "Pulsarea este oprită (butonul rămâne colorat dacă există alerte)")}
                  </p>
                </div>
              </div>

              {/* Modern Toggle Switch */}
              <button
                type="button"
                onClick={handleTogglePulseAlerts}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  pulseAlerts ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                }`}
                title={pulseAlerts ? "Oprește pulsarea bulinei" : "Activează pulsarea bulinei"}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    pulseAlerts ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <AlertsBanner
              vehicles={activeVehicles.length > 0 ? activeVehicles : vehicles}
              onSelectVehicle={(vId) => setSelectedVehicleIds([vId])}
              lang={lang}
            />
          </div>
        )}

        {/* TAB 5: Carburant & Consum Dedicat */}
        {activeTab === 'fuel' && (
          <FuelConsumptionView
            vehicles={vehicles}
            records={filteredRecords}
            selectedVehicle={activeVehicle}
            onNavigateBack={() => {
              setActiveTab('dashboard');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onAddFueling={() => {
              setRecordToEdit(null);
              setIsQuickAddOpen(true);
            }}
            onEditRecord={handleEditRecord}
            onDeleteRecord={handleDeleteRecord}
            lang={lang}
          />
        )}

        {/* TAB 5.5: Cost / Kilometru Dedicat */}
        {activeTab === 'costPerKm' && (
          <CostPerKmView
            vehicles={activeVehicles.length > 0 ? activeVehicles : vehicles}
            records={filteredRecords}
            selectedVehicle={activeVehicle}
            onNavigateBack={() => {
              setActiveTab('dashboard');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onSelectVehicle={(vId) => setSelectedVehicleIds(vId ? [vId] : vehicles.map(v => v.id))}
            lang={lang}
          />
        )}

        {/* TAB 6: Reparații & Piese Dedicat */}
        {activeTab === 'repairs' && (
          <CategoryDetailView
            category="repair"
            vehicles={activeVehicles}
            allVehicles={vehicles}
            records={records}
            onNavigateBack={() => {
              setActiveTab('dashboard');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenAddRecord={(cat) => {
              setQuickAddCategory(cat);
              setRecordToEdit(null);
              setIsQuickAddOpen(true);
            }}
            onEditRecord={handleEditRecord}
            onDeleteRecord={handleDeleteRecord}
            onUpdateVehicle={handleUpdateVehicle}
            lang={lang}
          />
        )}

        {/* TAB 7: Revizii & Service Dedicat */}
        {activeTab === 'service' && (
          <CategoryDetailView
            category="service"
            vehicles={activeVehicles}
            allVehicles={vehicles}
            records={records}
            onNavigateBack={() => {
              setActiveTab('dashboard');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenAddRecord={(cat) => {
              setQuickAddCategory(cat);
              setRecordToEdit(null);
              setIsQuickAddOpen(true);
            }}
            onEditRecord={handleEditRecord}
            onDeleteRecord={handleDeleteRecord}
            onUpdateVehicle={handleUpdateVehicle}
            lang={lang}
          />
        )}

        {/* TAB 8: Asigurare RCA Dedicat */}
        {activeTab === 'insurance' && (
          <CategoryDetailView
            category="insurance"
            vehicles={activeVehicles}
            allVehicles={vehicles}
            records={records}
            onNavigateBack={() => {
              setActiveTab('dashboard');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenAddRecord={(cat) => {
              setQuickAddCategory(cat);
              setRecordToEdit(null);
              setIsQuickAddOpen(true);
            }}
            onEditRecord={handleEditRecord}
            onDeleteRecord={handleDeleteRecord}
            onUpdateVehicle={handleUpdateVehicle}
            lang={lang}
          />
        )}

        {/* TAB 9: ITP Dedicat */}
        {activeTab === 'itp' && (
          <CategoryDetailView
            category="itp"
            vehicles={activeVehicles}
            allVehicles={vehicles}
            records={records}
            onNavigateBack={() => {
              setActiveTab('dashboard');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenAddRecord={(cat) => {
              setQuickAddCategory(cat);
              setRecordToEdit(null);
              setIsQuickAddOpen(true);
            }}
            onEditRecord={handleEditRecord}
            onDeleteRecord={handleDeleteRecord}
            onUpdateVehicle={handleUpdateVehicle}
            lang={lang}
          />
        )}

        {/* TAB: Anvelope & Roți Dedicat */}
        {activeTab === 'tires' && (
          <CategoryDetailView
            category="tires"
            vehicles={activeVehicles}
            allVehicles={vehicles}
            records={records}
            onNavigateBack={() => {
              setActiveTab('dashboard');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenAddRecord={(cat) => {
              setQuickAddCategory(cat);
              setRecordToEdit(null);
              setIsQuickAddOpen(true);
            }}
            onEditRecord={handleEditRecord}
            onDeleteRecord={handleDeleteRecord}
            onUpdateVehicle={handleUpdateVehicle}
            lang={lang}
          />
        )}

        {/* TAB: Rovinietă & Taxe Dedicat */}
        {activeTab === 'rovinieta' && (
          <CategoryDetailView
            category="rovinieta"
            vehicles={activeVehicles}
            allVehicles={vehicles}
            records={records}
            onNavigateBack={() => {
              setActiveTab('dashboard');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenAddRecord={(cat) => {
              setQuickAddCategory(cat);
              setRecordToEdit(null);
              setIsQuickAddOpen(true);
            }}
            onEditRecord={handleEditRecord}
            onDeleteRecord={handleDeleteRecord}
            onUpdateVehicle={handleUpdateVehicle}
            lang={lang}
          />
        )}

        {/* TAB 10: Consum Personal & Curse Weekend Dedicat */}
        {activeTab === 'personal' && (
          <PersonalTripsView
            personalTrips={personalTrips}
            vehicles={vehicles}
            records={filteredRecords}
            selectedVehicle={activeVehicle}
            onNavigateBack={() => {
              setActiveTab('dashboard');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenAddTrip={() => {
              setTripToEdit(null);
              setIsPersonalModalOpen(true);
            }}
            onEditTrip={handleEditPersonalTrip}
            onDeleteTrip={handleDeletePersonalTrip}
            onToggleTripPaid={handleToggleTripPaid}
            lang={lang}
          />
        )}

      </main>

      {/* Floating Bottom Navigation Bar for Mobile (Hidden in Immersive Mode) */}
      {!isImmersive && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 px-3 py-2 flex items-center justify-around shadow-lg animate-in fade-in slide-in-from-bottom duration-200">
          <button
            onClick={() => {
              setActiveTab('dashboard');
              window.scrollTo({ top: 0, behavior: 'instant' });
            }}
            className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'dashboard' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <Car className="w-5 h-5" />
            <span className="text-[10px] mt-1">{t.fleet || (lang === 'en' ? "Fleet" : "Flotă")}</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('rankings');
              window.scrollTo({ top: 0, behavior: 'instant' });
            }}
            className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'rankings' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span className="text-[10px] mt-1">{t.costs || (lang === 'en' ? "Costs" : "Costuri")}</span>
          </button>

          {/* Big Central Floating Add Button */}
          <button
            onClick={() => setIsQuickAddOpen(true)}
            className="relative -top-4 w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/40 transform active:scale-95 transition-transform cursor-pointer"
          >
            <Plus className="w-6 h-6 stroke-[3]" />
          </button>

          <button
            onClick={() => {
              setActiveTab('records');
              window.scrollTo({ top: 0, behavior: 'instant' });
            }}
            className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'records' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <History className="w-5 h-5" />
            <span className="text-[10px] mt-1">{t.log || (lang === 'en' ? "Log" : "Jurnal")}</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('alerts');
              window.scrollTo({ top: 0, behavior: 'instant' });
            }}
            className={`relative flex flex-col items-center py-1 px-2.5 rounded-xl transition-all cursor-pointer select-none ${
              totalAlertsCount > 0
                ? (urgentAlertsCount > 0
                    ? `text-rose-600 dark:text-rose-400 bg-rose-500/15 dark:bg-rose-500/25 border border-rose-500/50 shadow-xs font-bold ${pulseAlerts ? 'animate-pulse' : ''}`
                    : `text-amber-600 dark:text-amber-400 bg-amber-500/15 dark:bg-amber-500/25 border border-amber-500/50 shadow-xs font-bold ${pulseAlerts ? 'animate-pulse' : ''}`)
                : (activeTab === 'alerts' 
                    ? 'text-emerald-600 dark:text-emerald-400 font-bold border border-transparent' 
                    : 'text-slate-500 dark:text-slate-400 border border-transparent')
            }`}
          >
            {/* Button-shaped Ripple Rings (exact rounded-xl outline of the button) */}
            {totalAlertsCount > 0 && pulseAlerts && (
              <div className="absolute inset-0 pointer-events-none overflow-visible">
                <span className={`absolute inset-0 rounded-xl border-2 btn-ripple-1 ${
                  urgentAlertsCount > 0 ? 'border-rose-500 text-rose-500' : 'border-amber-500 text-amber-500'
                }`} />
                <span className={`absolute inset-0 rounded-xl border-2 btn-ripple-2 ${
                  urgentAlertsCount > 0 ? 'border-rose-500 text-rose-500' : 'border-amber-500 text-amber-500'
                }`} />
              </div>
            )}

            <div className="relative w-5 h-5 flex items-center justify-center">
              {totalAlertsCount > 0 ? (
                <div className="relative w-5 h-5 flex items-center justify-center">
                  <Shield className="w-5 h-5 stroke-[2.2] fill-current/15" />
                  <span className="absolute inset-0 flex items-center justify-center text-[9px] font-black leading-none pt-0.5 text-current">
                    {totalAlertsCount > 99 ? '99+' : totalAlertsCount}
                  </span>
                </div>
              ) : (
                <ShieldAlert className="w-5 h-5" />
              )}
            </div>
            <span className="text-[10px] mt-1 leading-tight">{lang === 'en' ? "Alerts" : "Alerte"}</span>
          </button>
        </div>
      )}

      {/* MODALS */}
      {isQuickAddOpen && (
        <QuickAddModal
          isOpen={isQuickAddOpen}
          onClose={() => {
            setIsQuickAddOpen(false);
            setRecordToEdit(null);
          }}
          vehicles={vehicles}
          selectedVehicleId={activeVehicle ? activeVehicle.id : (activeVehicles[0]?.id || (vehicles[0]?.id || ''))}
          onSaveRecord={handleSaveRecord}
          recordToEdit={recordToEdit}
          defaultCategory={quickAddCategory}
          lang={lang}
        />
      )}

      {isAddVehicleOpen && (
        <AddVehicleModal
          isOpen={isAddVehicleOpen}
          onClose={() => setIsAddVehicleOpen(false)}
          onAddVehicle={handleAddVehicle}
          lang={lang}
        />
      )}

      {selectedVehicleForDetails && (
        <VehicleDetailsModal
          vehicle={selectedVehicleForDetails}
          records={records}
          onClose={() => {
            setSelectedVehicleForDetails(null);
            setIsVehicleDetailsInEdit(false);
          }}
          onUpdateVehicle={handleUpdateVehicle}
          onDeleteVehicle={handleDeleteVehicle}
          initialEditing={isVehicleDetailsInEdit}
          lang={lang}
        />
      )}

      {isExportOpen && (
        <ExportModal
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
          vehicles={vehicles}
          records={records}
          personalTrips={personalTrips}
          onDataRestored={handleDataRestored}
          onOpenConnect={() => setIsConnectOpen(true)}
          lang={lang}
        />
      )}

      {isConnectOpen && (
        <ConnectModal
          isOpen={isConnectOpen}
          onClose={() => setIsConnectOpen(false)}
          lang={lang}
        />
      )}

      {isPersonalModalOpen && (
        <AddPersonalTripModal
          isOpen={isPersonalModalOpen}
          onClose={() => {
            setIsPersonalModalOpen(false);
            setTripToEdit(null);
          }}
          onSaveTrip={handleSavePersonalTrip}
          tripToEdit={tripToEdit}
          vehicles={vehicles}
          records={records}
          defaultVehicleId={activeVehicle ? activeVehicle.id : (activeVehicles[0]?.id || (vehicles[0]?.id || ''))}
          lang={lang}
        />
      )}

      {/* POPUP ALERT PENTRU CURSĂ PERSONALĂ ÎN DESFĂȘURARE (LA DESCHIDEREA APLICAȚIEI) */}
      {ongoingTripAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-500/40 rounded-3xl p-5 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Cursă Personală În Desfășurare
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {ongoingTripAlert.title || "Cursă fără kilometraj de sfârșit"}
                </p>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-2xl p-3.5 text-xs text-slate-700 dark:text-slate-300 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-500 dark:text-slate-400">Vehicul:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {vehicles.find(v => v.id === ongoingTripAlert.vehicleId)?.plate || ongoingTripAlert.vehicleId}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-500 dark:text-slate-400">Km Început:</span>
                <span className="font-mono font-black text-amber-700 dark:text-amber-400 text-sm">
                  {Number(ongoingTripAlert.startKm).toLocaleString('ro-RO')} km
                </span>
              </div>
              <div className="pt-1.5 border-t border-amber-200/60 dark:border-amber-800/40 text-[11.5px] text-amber-900 dark:text-amber-200">
                Ai o cursă personală începută pentru care nu ai introdus încă kilometrajul de final. Dorești să o finalizezi acum și să calculezi consumul?
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={() => setOngoingTripAlert(null)}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                Mai Târziu
              </button>
              <button
                onClick={() => {
                  const targetTrip = ongoingTripAlert;
                  setOngoingTripAlert(null);
                  handleEditPersonalTrip(targetTrip);
                }}
                className="px-4 py-2.5 text-xs font-black text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-xl shadow-md shadow-purple-500/25 transition-all active:scale-95 cursor-pointer"
              >
                🏁 Finalizează Cursa Acum
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
