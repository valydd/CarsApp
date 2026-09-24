package ro.carsapp.fleet;

import android.content.Context;
import android.content.SharedPreferences;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "CarsAppWidget")
public class CarsAppWidgetPlugin extends Plugin {
    public static String sPendingAction = null;

    public static void setPendingAction(String action) {
        sPendingAction = action;
    }

    public void emitWidgetAction(String action) {
        JSObject data = new JSObject();
        data.put("action", action);
        notifyListeners("widgetAction", data, true);
    }

    @PluginMethod
    public void updateWidgetData(PluginCall call) {
        try {
            Context context = getContext();
            SharedPreferences.Editor editor = WidgetHelper.getPrefs(context).edit();

            if (call.hasOption("unpaidAmount")) {
                editor.putString(WidgetHelper.KEY_UNPAID_AMOUNT, call.getString("unpaidAmount", "0,00 RON"));
            }
            if (call.hasOption("unpaidCount")) {
                editor.putInt(WidgetHelper.KEY_UNPAID_COUNT, call.getInt("unpaidCount", 0));
            }
            if (call.hasOption("activePlate")) {
                editor.putString(WidgetHelper.KEY_ACTIVE_PLATE, call.getString("activePlate", "FLOTĂ"));
            }
            if (call.hasOption("totalKm")) {
                editor.putString(WidgetHelper.KEY_TOTAL_KM, call.getString("totalKm", ""));
            }
            if (call.hasOption("theme")) {
                editor.putString(WidgetHelper.KEY_THEME, call.getString("theme", "dark"));
            }
            if (call.hasOption("darkIntensity")) {
                editor.putInt(WidgetHelper.KEY_DARK_INTENSITY, call.getInt("darkIntensity", 85));
            }
            if (call.hasOption("darkColor")) {
                editor.putString(WidgetHelper.KEY_DARK_COLOR, call.getString("darkColor", "#0B0F17"));
            }
            editor.putString(WidgetHelper.KEY_LAST_UPDATE, String.valueOf(System.currentTimeMillis()));
            editor.apply();

            WidgetHelper.updateAllWidgets(context);

            JSObject ret = new JSObject();
            ret.put("success", true);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Failed to update widget: " + e.getMessage(), e);
        }
    }

    @PluginMethod
    public void getWidgetData(PluginCall call) {
        Context context = getContext();
        SharedPreferences prefs = WidgetHelper.getPrefs(context);

        JSObject ret = new JSObject();
        ret.put("unpaidAmount", prefs.getString(WidgetHelper.KEY_UNPAID_AMOUNT, "0,00 RON"));
        ret.put("unpaidCount", prefs.getInt(WidgetHelper.KEY_UNPAID_COUNT, 0));
        ret.put("activePlate", prefs.getString(WidgetHelper.KEY_ACTIVE_PLATE, "FLOTĂ"));
        ret.put("theme", prefs.getString(WidgetHelper.KEY_THEME, "dark"));
        ret.put("darkIntensity", prefs.getInt(WidgetHelper.KEY_DARK_INTENSITY, 85));
        ret.put("darkColor", prefs.getString(WidgetHelper.KEY_DARK_COLOR, "#0B0F17"));
        call.resolve(ret);
    }

    @PluginMethod
    public void getInitialAction(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("action", sPendingAction);
        sPendingAction = null; // Clear after reading
        call.resolve(ret);
    }
}
