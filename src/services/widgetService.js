import { registerPlugin, Capacitor } from '@capacitor/core';

export const CarsAppWidget = registerPlugin('CarsAppWidget');

const WIDGET_SETTINGS_KEY = 'carsapp_widget_settings_v1';

export const DEFAULT_WIDGET_SETTINGS = {
  theme: 'dark',           // 'dark' | 'light' | 'auto'
  darkIntensity: 85,       // 50 | 70 | 85 | 100 (percentage opacity)
  darkColor: '#0B0F17'     // '#000000' (OLED) | '#0B0F17' (Cărbune) | '#181D26' (Grafit) | '#222A38' (Ardezie) | '#334155' (Gri Mediu)
};

export const DARK_COLOR_PRESETS = [
  { id: 'pure_black', label: 'Negru Pur (OLED)', hex: '#000000', border: 'border-slate-800' },
  { id: 'charcoal', label: 'Negru Cărbune', hex: '#0B0F17', border: 'border-slate-800' },
  { id: 'graphite', label: 'Grafit Închis', hex: '#181D26', border: 'border-slate-700' },
  { id: 'slate', label: 'Gri Ardezie', hex: '#222A38', border: 'border-slate-600' },
  { id: 'medium_gray', label: 'Gri Neutru', hex: '#334155', border: 'border-slate-500' }
];

export const INTENSITY_PRESETS = [
  { value: 100, label: '100% Solid' },
  { value: 85, label: '85% Intens (Recomandat)' },
  { value: 70, label: '70% Semitransparent' },
  { value: 50, label: '50% Translucid' }
];

export const getStoredWidgetSettings = () => {
  try {
    const raw = localStorage.getItem(WIDGET_SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_WIDGET_SETTINGS };
    return { ...DEFAULT_WIDGET_SETTINGS, ...JSON.parse(raw) };
  } catch (_) {
    return { ...DEFAULT_WIDGET_SETTINGS };
  }
};

export const saveStoredWidgetSettings = (settings) => {
  try {
    const merged = { ...getStoredWidgetSettings(), ...settings };
    localStorage.setItem(WIDGET_SETTINGS_KEY, JSON.stringify(merged));
    return merged;
  } catch (_) {
    return settings;
  }
};

/**
 * Synchronizes fleet stats and user preferences with the native Android widget
 */
export const syncWidgetData = async ({ personalTrips = [], vehicles = [], activeVehicle = null, currentTheme = 'dark' } = {}) => {
  if (!Capacitor.isNativePlatform()) return;

  try {
    const settings = getStoredWidgetSettings();
    const unpaidTrips = (personalTrips || []).filter(t => t && !t.isPaid);
    const unpaidAmountNum = unpaidTrips.reduce((sum, t) => sum + (Number(t.tripCost) || 0), 0);
    const formattedAmount = `${unpaidAmountNum.toLocaleString('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} RON`;

    const activePlate = activeVehicle?.plate 
      ? activeVehicle.plate 
      : (vehicles && vehicles.length === 1 ? vehicles[0].plate : (vehicles.length > 1 ? `Flotă (${vehicles.length})` : 'CarsApp'));

    const effectiveTheme = settings.theme === 'auto' ? currentTheme : settings.theme;

    await CarsAppWidget.updateWidgetData({
      unpaidAmount: formattedAmount,
      unpaidCount: unpaidTrips.length,
      activePlate: activePlate,
      theme: effectiveTheme,
      darkIntensity: settings.darkIntensity,
      darkColor: settings.darkColor
    });
  } catch (e) {
    console.warn('CarsApp: Could not sync widget data:', e);
  }
};

/**
 * Checks if the app was launched by a widget button
 */
export const checkInitialWidgetAction = async () => {
  if (!Capacitor.isNativePlatform()) return null;
  try {
    const res = await CarsAppWidget.getInitialAction();
    return res?.action || null;
  } catch (e) {
    return null;
  }
};

/**
 * Listens for widget actions while the app is already in memory
 */
export const addWidgetActionListener = (callback) => {
  if (!Capacitor.isNativePlatform()) return { remove: () => {} };
  return CarsAppWidget.addListener('widgetAction', (data) => {
    if (data && data.action) {
      callback(data.action);
    }
  });
};
