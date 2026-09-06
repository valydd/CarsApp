import React, { useState } from 'react';
import { AlertCircle, AlertTriangle, ChevronDown, ChevronUp, Clock, Calendar, Gauge, Wrench, ShieldAlert, ChevronRight, Disc } from 'lucide-react';
import { translations } from '../i18n';
import { getVehicleAlerts } from '../utils/calculations';

export const AlertsBanner = ({ vehicles, onSelectVehicle, onOpenAlertsTab, lang }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const t = translations[lang];

  const allAlerts = [];
  vehicles.forEach(veh => {
    const vehAlerts = getVehicleAlerts(veh);
    vehAlerts.forEach(a => {
      allAlerts.push({ ...a, vehicle: veh });
    });
  });

  allAlerts.sort((a, b) => {
    if (a.severity === 'critical' && b.severity !== 'critical') return -1;
    if (a.severity !== 'critical' && b.severity === 'critical') return 1;
    return (a.daysLeft ?? 999) - (b.daysLeft ?? 999);
  });

  const criticalCount = allAlerts.filter(a => a.severity === 'critical').length;
  const warningCount = allAlerts.filter(a => a.severity === 'warning').length;

  // COMPACT SINGLE-LINE BANNER FOR MAIN DASHBOARD
  if (onOpenAlertsTab) {
    let containerClass = "bg-emerald-50/90 dark:bg-emerald-950/25 border-emerald-200 dark:border-emerald-900/40 hover:border-emerald-400";
    let iconClass = "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400";
    let textClass = "text-emerald-700 dark:text-emerald-300";
    let chevronClass = "text-emerald-600 dark:text-emerald-400";
    let IconComp = ShieldAlert;
    let message = lang === 'en' 
      ? "All inspections, services, and docs are up to date!" 
      : "Toate verificările, reviziile și actele sunt la zi!";

    if (criticalCount > 0) {
      containerClass = "bg-rose-50/90 dark:bg-rose-950/30 border-rose-300 dark:border-rose-900/50 hover:border-rose-500";
      iconClass = "bg-rose-500/20 text-rose-600 dark:text-rose-400";
      textClass = "text-rose-700 dark:text-rose-300 font-black";
      chevronClass = "text-rose-500";
      IconComp = AlertCircle;
      message = lang === 'en'
        ? `${criticalCount} overdue deadline${criticalCount === 1 ? '' : 's'}! Attention needed`
        : `${criticalCount} ${criticalCount === 1 ? 'scadență depășită' : 'scadențe depășite'}! Necesită atenție`;
    } else if (warningCount > 0) {
      containerClass = "bg-amber-50/90 dark:bg-amber-950/30 border-amber-300 dark:border-amber-900/50 hover:border-amber-500";
      iconClass = "bg-amber-500/20 text-amber-600 dark:text-amber-400";
      textClass = "text-amber-800 dark:text-amber-300 font-extrabold";
      chevronClass = "text-amber-600 dark:text-amber-400";
      IconComp = AlertTriangle;
      message = lang === 'en'
        ? `${warningCount} deadline${warningCount === 1 ? '' : 's'} upcoming soon`
        : `${warningCount} ${warningCount === 1 ? 'termen scadent' : 'termene scadente'} în curând`;
    }

    return (
      <div 
        onClick={onOpenAlertsTab}
        className={`mb-3 rounded-2xl border px-3 py-2 sm:px-3.5 sm:py-2.5 flex items-center justify-between shadow-2xs cursor-pointer transition-all active:scale-[0.99] group ${containerClass}`}
        title="Apasă pentru detalii scadențe"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`p-1.5 rounded-xl shrink-0 ${iconClass}`}>
            <IconComp className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${criticalCount > 0 ? 'animate-pulse' : ''}`} />
          </div>
          <p className={`text-[11.5px] sm:text-xs truncate ${textClass}`}>
            {message}
          </p>
        </div>
        <ChevronRight className={`w-3.5 h-3.5 shrink-0 ml-2 group-hover:translate-x-0.5 transition-transform ${chevronClass}`} />
      </div>
    );
  }

  if (allAlerts.length === 0) {
    return (
      <div className="mb-4 bg-emerald-50/70 dark:bg-slate-900/40 border border-emerald-200 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t.alertsTitle}</h3>
            <p className="text-xs text-emerald-700 dark:text-emerald-400/90 font-medium">{t.noAlerts}</p>
          </div>
        </div>
      </div>
    );
  }

  const getCategoryMeta = (alert) => {
    const cat = alert.categoryKey || (
      alert.type === 'rcaExpiry' ? 'rca' :
      alert.type === 'itpExpiry' ? 'itp' :
      alert.type === 'rovinietaExpiry' ? 'rovinieta' :
      alert.type === 'cascoExpiry' ? 'casco' :
      alert.type.includes('service') ? 'service' :
      alert.type.includes('tire') ? 'tires' : 'general'
    );

    switch (cat) {
      case 'rca':
        return {
          tag: '🛡️ RCA',
          color: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30',
          icon: ShieldAlert
        };
      case 'itp':
        return {
          tag: '🔍 ITP',
          color: 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30',
          icon: Calendar
        };
      case 'rovinieta':
        return {
          tag: '🛣️ ROVINIETĂ',
          color: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30',
          icon: Calendar
        };
      case 'casco':
        return {
          tag: '📋 CASCO',
          color: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30',
          icon: ShieldAlert
        };
      case 'service':
        return {
          tag: '🔧 REVIZIE',
          color: 'bg-orange-500/15 text-orange-800 dark:text-orange-300 border-orange-500/30',
          icon: Wrench
        };
      case 'tires':
        return {
          tag: '🛞 ANVELOPE',
          color: 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30',
          icon: Disc
        };
      default:
        return {
          tag: '⚠️ SCADENȚĂ',
          color: 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30',
          icon: AlertTriangle
        };
    }
  };

  return (
    <div className={`mb-4 rounded-2xl border transition-all shadow-xs ${
      criticalCount > 0 
        ? 'bg-rose-50/80 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40' 
        : 'bg-amber-50/80 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40'
    }`}>
      {/* Header bar */}
      <div 
        className="p-3 sm:p-4 flex items-center justify-between cursor-pointer select-none gap-2"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`p-2 rounded-xl shrink-0 ${
            criticalCount > 0 
              ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400' 
              : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
          }`}>
            {criticalCount > 0 ? (
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
            ) : (
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate">{t.alertsTitle}</h3>
              {criticalCount > 0 && (
                <span className="bg-rose-500 text-white text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-full whitespace-nowrap">
                  {criticalCount} {t.alertCritical}
                </span>
              )}
              {warningCount > 0 && (
                <span className="bg-amber-500/20 dark:bg-amber-500/30 text-amber-800 dark:text-amber-300 text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                  {warningCount} {t.alertWarning}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
              Revizii depășite, inspecții ITP și polițe RCA cu scadență apropiată
            </p>
          </div>
        </div>

        <button 
          className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg transition-colors shrink-0"
          aria-label={isExpanded ? "Restrânge" : "Extinde"}
        >
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Expanded list of alerts - Spacious, non-truncated cards */}
      {isExpanded && (
        <div className="px-3 pb-3 sm:px-4 sm:pb-4 pt-2 border-t border-rose-200/50 dark:border-slate-800/40 space-y-2.5 max-h-[75vh] overflow-y-auto">
          {allAlerts.map((alert, idx) => {
            const isCrit = alert.severity === 'critical';
            const meta = getCategoryMeta(alert);
            const IconComponent = meta.icon;

            return (
              <div 
                key={idx}
                onClick={() => onSelectVehicle && onSelectVehicle(alert.vehicleId)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer shadow-xs ${
                  isCrit 
                    ? 'bg-rose-100/70 dark:bg-rose-950/40 border-rose-300/80 dark:border-rose-900/60 hover:border-rose-500' 
                    : 'bg-amber-100/70 dark:bg-amber-950/40 border-amber-300/80 dark:border-amber-900/60 hover:border-amber-500'
                }`}
              >
                {/* RÂNDUL 1: Mașină [RO AG-51-APK] Model | Insignă URGENT / ATENȚIE */}
                <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-black/5 dark:border-white/5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="whitespace-nowrap shrink-0 inline-flex items-center font-mono text-xs font-black tracking-wider text-slate-900 dark:text-white bg-white dark:bg-slate-900 px-2 py-0.5 rounded-md border border-slate-300 dark:border-slate-700 shadow-2xs">
                      <span className="text-[10px] text-blue-600 font-bold mr-1">RO</span>
                      {alert.plate}
                    </span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">
                      {alert.vehicle.makeModel}
                    </span>
                  </div>

                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-md uppercase tracking-wider shrink-0 whitespace-nowrap shadow-2xs ${
                    isCrit 
                      ? 'bg-rose-600 text-white animate-pulse' 
                      : 'bg-amber-500 text-slate-950 font-black'
                  }`}>
                    {isCrit ? (alert.daysLeft !== undefined && alert.daysLeft < 0 ? "EXPIRAT" : "URGENT") : "ATENȚIE"}
                  </span>
                </div>

                {/* RÂNDUL 2: CE ANUME A AJUNS LA SCADENȚĂ (FĂRĂ TRUNCHIERE) */}
                <div className="flex items-start gap-2.5">
                  <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                    isCrit ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400' : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                  }`}>
                    <IconComponent className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Badge categorie + Titlu scadență complet */}
                    <div className="flex items-center gap-1.5 flex-wrap mb-1">
                      <span className={`text-[10.5px] font-black px-2 py-0.5 rounded-md border uppercase tracking-wider ${meta.color}`}>
                        {meta.tag}
                      </span>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white leading-snug">
                        {lang === 'ro' ? alert.titleRo : alert.titleEn}
                      </h4>
                    </div>

                    {/* RÂNDUL 3: Zile rămase sau depășite + Dată scadență + Șofer */}
                    <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-1.5 flex items-center gap-2 flex-wrap">
                      <span className={`font-extrabold flex items-center gap-1 ${isCrit ? 'text-rose-700 dark:text-rose-400' : 'text-amber-800 dark:text-amber-300'}`}>
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                        <span>{lang === 'ro' ? alert.detailRo : alert.detailEn}</span>
                      </span>
                      {alert.dueDate && (
                        <span className="text-slate-500 dark:text-slate-400">
                          • Dată limită: <strong className="text-slate-800 dark:text-slate-200">{alert.dueDate}</strong>
                        </span>
                      )}
                      {alert.vehicle.driver && (
                        <span className="text-slate-500 dark:text-slate-400">
                          • Șofer: <strong className="text-slate-800 dark:text-slate-200">{alert.vehicle.driver}</strong>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
