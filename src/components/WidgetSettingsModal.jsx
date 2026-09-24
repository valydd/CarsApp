import React, { useState } from 'react';
import { 
  X, 
  Smartphone, 
  Sun, 
  Moon, 
  Sparkles, 
  Check, 
  Fuel, 
  Navigation, 
  RefreshCw,
  Sliders,
  CheckCircle2,
  Info
} from 'lucide-react';
import { 
  getStoredWidgetSettings, 
  saveStoredWidgetSettings, 
  DARK_COLOR_PRESETS, 
  INTENSITY_PRESETS, 
  syncWidgetData 
} from '../services/widgetService';
import { translations } from '../i18n';

export const WidgetSettingsModal = ({
  isOpen,
  onClose,
  personalTrips = [],
  vehicles = [],
  activeVehicle = null,
  currentTheme = 'dark',
  lang = 'ro',
  onShowToast
}) => {
  const t = translations[lang] || translations.ro;
  const [settings, setSettings] = useState(() => getStoredWidgetSettings());
  const [previewTab, setPreviewTab] = useState('4x1'); // '2x1' | '4x1' | '4x3'
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const unpaidTrips = (personalTrips || []).filter(t => t && !t.isPaid);
  const unpaidAmountNum = unpaidTrips.reduce((sum, t) => sum + (Number(t.tripCost) || 0), 0);
  const formattedAmount = `${unpaidAmountNum.toLocaleString('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} RON`;
  const unpaidCount = unpaidTrips.length;
  const activePlate = activeVehicle?.plate 
    ? activeVehicle.plate 
    : (vehicles && vehicles.length === 1 ? vehicles[0].plate : (vehicles.length > 1 ? `Flotă (${vehicles.length})` : 'RO B 123 ABC'));

  const effectiveTheme = settings.theme === 'auto' ? currentTheme : settings.theme;
  const isLight = effectiveTheme === 'light';

  // Preview styling calculations
  const opacityVal = settings.darkIntensity / 100;
  const previewBgColor = isLight ? '#FFFFFF' : settings.darkColor;

  const handleUpdate = (patch) => {
    const updated = { ...settings, ...patch };
    setSettings(updated);
    saveStoredWidgetSettings(updated);
    syncWidgetData({
      personalTrips,
      vehicles,
      activeVehicle,
      currentTheme
    });
  };

  const handleSaveAndApply = () => {
    saveStoredWidgetSettings(settings);
    syncWidgetData({
      personalTrips,
      vehicles,
      activeVehicle,
      currentTheme
    });
    setSavedSuccess(true);
    if (onShowToast) {
      onShowToast(t.widgetSettingsSaved || "Setările widget-ului au fost salvate și aplicate!");
    }
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-purple-500/15 text-purple-600 dark:text-purple-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>{t.widgetSettingsTitle || "Widget Ecran Telefon"}</span>
                <span className="text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-600 dark:text-purple-300 px-2 py-0.5 rounded-full">
                  Android
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t.widgetSettingsDesc || "Formate 2x1, 4x1, 4x3 cu acțiuni rapide și sumă de plată"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5">

          {/* 1. Live Preview Area with Tab Switcher */}
          <div className="bg-slate-100 dark:bg-slate-950 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                <span>Previzualizare Live</span>
              </span>

              {/* Format Switcher Pills */}
              <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                {['2x1', '4x1', '4x3'].map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => setPreviewTab(fmt)}
                    className={`px-2.5 py-0.5 rounded-lg font-black text-[11px] transition-all cursor-pointer ${
                      previewTab === fmt
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>

            {/* Simulated Android Wallpaper Background */}
            <div className="p-4 rounded-2xl bg-gradient-to-tr from-sky-900 via-indigo-950 to-slate-900 border border-white/10 flex items-center justify-center min-h-[140px] relative overflow-hidden">
              
              {/* --- PREVIEW 2x1 --- */}
              {previewTab === '2x1' && (
                <div 
                  style={{
                    backgroundColor: previewBgColor,
                    opacity: opacityVal,
                    borderColor: isLight ? '#E2E8F0' : 'rgba(255, 255, 255, 0.15)'
                  }}
                  className={`w-full max-w-[280px] p-3 rounded-[20px] border shadow-xl flex items-center justify-between gap-2.5 transition-all ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <span className="text-[9px] font-black uppercase tracking-wider block opacity-70">
                      RĂMAS WEEKEND
                    </span>
                    <span className="text-sm font-black font-mono tracking-tight block">
                      {formattedAmount}
                    </span>
                    <span className="text-[9px] font-semibold block opacity-60">
                      {unpaidCount} {unpaidCount === 1 ? 'cursă' : 'curse'} de plată
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-xs">
                      <Fuel className="w-4 h-4 stroke-[2.5]" />
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
                      <Navigation className="w-4 h-4 stroke-[2.5]" />
                    </div>
                  </div>
                </div>
              )}

              {/* --- PREVIEW 4x1 --- */}
              {previewTab === '4x1' && (
                <div 
                  style={{
                    backgroundColor: previewBgColor,
                    opacity: opacityVal,
                    borderColor: isLight ? '#E2E8F0' : 'rgba(255, 255, 255, 0.15)'
                  }}
                  className={`w-full p-3.5 rounded-[22px] border shadow-xl flex items-center justify-between gap-3 transition-all ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[9px] font-black bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.2 rounded font-mono">
                        {activePlate}
                      </span>
                      <span className="text-[9px] font-black uppercase tracking-wider opacity-70">
                        CURSE WEEKEND • DE PLATĂ
                      </span>
                    </div>
                    <div className="text-base font-black font-mono tracking-tight leading-tight">
                      {formattedAmount}
                    </div>
                    <span className="text-[9.5px] font-semibold opacity-60">
                      {unpaidCount} curse decontabile neachitate
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="h-9 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white flex items-center gap-1.5 shadow-xs font-bold text-xs">
                      <Fuel className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Alimentare</span>
                    </div>
                    <div className="h-9 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex items-center gap-1.5 shadow-xs font-bold text-xs">
                      <Navigation className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Cursă</span>
                    </div>
                  </div>
                </div>
              )}

              {/* --- PREVIEW 4x3 --- */}
              {previewTab === '4x3' && (
                <div 
                  style={{
                    backgroundColor: previewBgColor,
                    opacity: opacityVal,
                    borderColor: isLight ? '#E2E8F0' : 'rgba(255, 255, 255, 0.15)'
                  }}
                  className={`w-full p-4 rounded-[24px] border shadow-2xl space-y-3 transition-all ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  {/* Top Header */}
                  <div className="flex items-center justify-between pb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-xs">CarsApp</span>
                      <span className="text-[9.5px] font-bold font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-500">
                        {activePlate}
                      </span>
                    </div>
                    <RefreshCw className="w-3.5 h-3.5 opacity-60" />
                  </div>

                  {/* Center Card */}
                  <div className={`p-3 rounded-2xl border ${
                    isLight 
                      ? 'bg-slate-100/90 border-slate-200' 
                      : 'bg-white/10 border-white/15'
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-purple-500 dark:text-purple-300">
                        🚗 CURSE WEEKEND • RĂMAS DE ACHITAT
                      </span>
                      <span className="text-[9px] font-bold bg-amber-500/20 text-amber-500 px-1.5 py-0.2 rounded font-mono">
                        DE PLATĂ
                      </span>
                    </div>
                    <div className="text-2xl font-black font-mono tracking-tight leading-none my-1">
                      {formattedAmount}
                    </div>
                    <span className="text-[10px] opacity-70 block mt-1">
                      {unpaidCount} curse de weekend în așteptare • Apasă pentru jurnal
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-0.5">
                    <div className="h-10 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white flex items-center justify-center gap-1.5 shadow-md font-black text-xs">
                      <Fuel className="w-4 h-4 stroke-[2.5]" />
                      <span>+ Alimentare</span>
                    </div>
                    <div className="h-10 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex items-center justify-center gap-1.5 shadow-md font-black text-xs">
                      <Navigation className="w-4 h-4 stroke-[2.5]" />
                      <span>+ Cursă Weekend</span>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* 2. Theme Selector: Light vs Dark vs Auto */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              1. Temă Widget (Light / Dark)
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleUpdate({ theme: 'dark' })}
                className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                  settings.theme === 'dark'
                    ? 'border-purple-500 bg-purple-500/10 text-purple-600 dark:text-purple-400 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                }`}
              >
                <Moon className="w-4 h-4" />
                <span>Dark</span>
              </button>

              <button
                type="button"
                onClick={() => handleUpdate({ theme: 'light' })}
                className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                  settings.theme === 'light'
                    ? 'border-purple-500 bg-purple-500/10 text-purple-600 dark:text-purple-400 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                }`}
              >
                <Sun className="w-4 h-4 text-amber-500" />
                <span>Light</span>
              </button>

              <button
                type="button"
                onClick={() => handleUpdate({ theme: 'auto' })}
                className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                  settings.theme === 'auto'
                    ? 'border-purple-500 bg-purple-500/10 text-purple-600 dark:text-purple-400 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                }`}
              >
                <Sparkles className="w-4 h-4 text-purple-500" />
                <span>Auto (Aplicație)</span>
              </button>
            </div>
          </div>

          {/* 3. Dark Color Tone: Negru spre Gri */}
          {settings.theme !== 'light' && (
            <div className="space-y-2 animate-in fade-in duration-150">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>2. Nuanță Dark (Negru spre Gri)</span>
                <span className="font-mono text-[11px] font-semibold text-slate-400">
                  {DARK_COLOR_PRESETS.find(p => p.hex === settings.darkColor)?.label || settings.darkColor}
                </span>
              </label>

              <div className="grid grid-cols-5 gap-2">
                {DARK_COLOR_PRESETS.map((preset) => {
                  const isSelected = settings.darkColor.toLowerCase() === preset.hex.toLowerCase();
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleUpdate({ darkColor: preset.hex })}
                      className={`flex flex-col items-center gap-1.5 p-2 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-purple-500 ring-2 ring-purple-500/30 bg-purple-500/10'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-400'
                      }`}
                    >
                      <div 
                        style={{ backgroundColor: preset.hex }} 
                        className={`w-7 h-7 rounded-full shadow-inner border flex items-center justify-center ${preset.border}`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                      </div>
                      <span className="text-[9.5px] font-bold text-slate-700 dark:text-slate-300 text-center leading-tight truncate w-full">
                        {preset.label.split(' ')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4. Dark Intensity / Opacity */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>{settings.theme === 'light' ? '2.' : '3.'} Intensitate / Opacitate Fundal</span>
              <span className="font-mono text-[11px] font-black text-purple-600 dark:text-purple-400">
                {settings.darkIntensity}%
              </span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {INTENSITY_PRESETS.map((preset) => {
                const isSelected = settings.darkIntensity === preset.value;
                return (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => handleUpdate({ darkIntensity: preset.value })}
                    className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'border-purple-500 bg-purple-500/15 text-purple-600 dark:text-purple-300 font-black shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300 text-xs font-semibold'
                    }`}
                  >
                    <div className="text-xs font-black">{preset.value}%</div>
                    <div className="text-[10px] opacity-75 truncate">{preset.label.split(' ')[1] || ''}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Instructions Box */}
          <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/50 rounded-2xl p-3.5 text-xs text-purple-900 dark:text-purple-200 space-y-2">
            <div className="flex items-center gap-2 font-black text-purple-700 dark:text-purple-300">
              <Info className="w-4 h-4 shrink-0" />
              <span>Cum adaugi widget-ul pe ecranul telefonului:</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-[11.5px] leading-relaxed text-purple-800 dark:text-purple-300/90 pl-1">
              <li>Mergi pe ecranul principal al telefonului tău.</li>
              <li>Ține apăsat pe un spațiu liber timp de 1-2 secunde.</li>
              <li>Apasă pe opțiunea <strong>«Widget-uri»</strong> (sau <em>Widgets</em>).</li>
              <li>Caută <strong>«CarsApp»</strong> în listă și alege formatul dorit: <strong>2x1</strong>, <strong>4x1</strong> sau <strong>4x3</strong>.</li>
            </ol>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5 bg-slate-50/80 dark:bg-slate-900/90 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
          >
            {t.close || "Închide"}
          </button>
          <button
            type="button"
            onClick={handleSaveAndApply}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-black shadow-lg shadow-purple-500/25 transition-all transform active:scale-95 flex items-center gap-1.5 cursor-pointer"
          >
            {savedSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                <span>Salvat!</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Salvează și Aplică pe Widget</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
