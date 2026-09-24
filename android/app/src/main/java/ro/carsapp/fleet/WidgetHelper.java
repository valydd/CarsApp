package ro.carsapp.fleet;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.os.Build;
import android.widget.RemoteViews;

public class WidgetHelper {
    public static final String PREFS_NAME = "CarsAppWidgetPrefs";
    public static final String KEY_UNPAID_AMOUNT = "unpaidAmount";
    public static final String KEY_UNPAID_COUNT = "unpaidCount";
    public static final String KEY_ACTIVE_PLATE = "activePlate";
    public static final String KEY_TOTAL_KM = "totalKm";
    public static final String KEY_THEME = "theme";                 // "dark", "light", "auto"
    public static final String KEY_DARK_INTENSITY = "darkIntensity"; // 50, 70, 85, 100
    public static final String KEY_DARK_COLOR = "darkColor";         // "#000000", "#0B0F17", "#181D26", "#222A38", "#334155"
    public static final String KEY_LAST_UPDATE = "lastUpdate";

    public static final String ACTION_ADD_FUEL = "add_fuel";
    public static final String ACTION_ADD_TRIP = "add_trip";
    public static final String ACTION_OPEN_TRIPS = "open_trips";
    public static final String ACTION_REFRESH = "ro.carsapp.fleet.WIDGET_REFRESH";
    public static final String EXTRA_WIDGET_ACTION = "widget_action";

    public static SharedPreferences getPrefs(Context context) {
        return context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
    }

    public static void updateAllWidgets(Context context) {
        AppWidgetManager manager = AppWidgetManager.getInstance(context);

        // Update 2x1
        int[] ids2x1 = manager.getAppWidgetIds(new ComponentName(context, CarsAppWidget2x1.class));
        if (ids2x1 != null && ids2x1.length > 0) {
            update2x1(context, manager, ids2x1);
        }

        // Update 4x1
        int[] ids4x1 = manager.getAppWidgetIds(new ComponentName(context, CarsAppWidget4x1.class));
        if (ids4x1 != null && ids4x1.length > 0) {
            update4x1(context, manager, ids4x1);
        }

        // Update 4x3
        int[] ids4x3 = manager.getAppWidgetIds(new ComponentName(context, CarsAppWidget4x3.class));
        if (ids4x3 != null && ids4x3.length > 0) {
            update4x3(context, manager, ids4x3);
        }
    }

    public static void update2x1(Context context, AppWidgetManager manager, int[] appWidgetIds) {
        SharedPreferences prefs = getPrefs(context);
        WidgetStyle style = getWidgetStyle(prefs);

        for (int widgetId : appWidgetIds) {
            RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_layout_2x1);

            // Background & Theme styling
            applyWidgetStyle(views, style);

            // Data
            String amount = prefs.getString(KEY_UNPAID_AMOUNT, "0,00 RON");
            int count = prefs.getInt(KEY_UNPAID_COUNT, 0);

            views.setTextViewText(R.id.widget_unpaid_amount, amount);
            String subtext = count == 1 ? "1 cursă de plată" : count + " curse de plată";
            views.setTextViewText(R.id.widget_subtext, subtext);

            // Intents
            views.setOnClickPendingIntent(R.id.btn_widget_fuel, createActionPendingIntent(context, ACTION_ADD_FUEL, 101));
            views.setOnClickPendingIntent(R.id.btn_widget_trip, createActionPendingIntent(context, ACTION_ADD_TRIP, 102));
            views.setOnClickPendingIntent(R.id.widget_click_info, createActionPendingIntent(context, ACTION_OPEN_TRIPS, 103));

            manager.updateAppWidget(widgetId, views);
        }
    }

    public static void update4x1(Context context, AppWidgetManager manager, int[] appWidgetIds) {
        SharedPreferences prefs = getPrefs(context);
        WidgetStyle style = getWidgetStyle(prefs);

        for (int widgetId : appWidgetIds) {
            RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_layout_4x1);

            // Background & Theme styling
            applyWidgetStyle(views, style);

            // Data
            String amount = prefs.getString(KEY_UNPAID_AMOUNT, "0,00 RON");
            int count = prefs.getInt(KEY_UNPAID_COUNT, 0);
            String plate = prefs.getString(KEY_ACTIVE_PLATE, "FLOTĂ");

            views.setTextViewText(R.id.widget_unpaid_amount, amount);
            views.setTextViewText(R.id.widget_plate_badge, plate);
            String subtext = count == 1 ? "1 cursă de plată" : count + " curse de plată";
            views.setTextViewText(R.id.widget_subtext, subtext);

            // Intents
            views.setOnClickPendingIntent(R.id.btn_widget_fuel, createActionPendingIntent(context, ACTION_ADD_FUEL, 201));
            views.setOnClickPendingIntent(R.id.btn_widget_trip, createActionPendingIntent(context, ACTION_ADD_TRIP, 202));
            views.setOnClickPendingIntent(R.id.widget_click_info, createActionPendingIntent(context, ACTION_OPEN_TRIPS, 203));

            manager.updateAppWidget(widgetId, views);
        }
    }

    public static void update4x3(Context context, AppWidgetManager manager, int[] appWidgetIds) {
        SharedPreferences prefs = getPrefs(context);
        WidgetStyle style = getWidgetStyle(prefs);

        for (int widgetId : appWidgetIds) {
            RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_layout_4x3);

            // Background & Theme styling
            applyWidgetStyle(views, style);

            // Data
            String amount = prefs.getString(KEY_UNPAID_AMOUNT, "0,00 RON");
            int count = prefs.getInt(KEY_UNPAID_COUNT, 0);
            String plate = prefs.getString(KEY_ACTIVE_PLATE, "FLOTĂ");

            views.setTextViewText(R.id.widget_unpaid_amount, amount);
            views.setTextViewText(R.id.widget_plate_badge, plate);
            String subtext = count == 1 ? "1 cursă weekend neachitată • Apasă pentru detalii" : count + " curse weekend neachitate • Apasă pentru detalii";
            views.setTextViewText(R.id.widget_subtext, subtext);

            // Intents
            views.setOnClickPendingIntent(R.id.btn_widget_fuel, createActionPendingIntent(context, ACTION_ADD_FUEL, 301));
            views.setOnClickPendingIntent(R.id.btn_widget_trip, createActionPendingIntent(context, ACTION_ADD_TRIP, 302));
            views.setOnClickPendingIntent(R.id.widget_click_info, createActionPendingIntent(context, ACTION_OPEN_TRIPS, 303));
            views.setOnClickPendingIntent(R.id.btn_widget_refresh, createRefreshPendingIntent(context, 304));

            manager.updateAppWidget(widgetId, views);
        }
    }

    public static class WidgetStyle {
        public boolean isLight;
        public int backgroundColor;
        public int primaryTextColor;
        public int secondaryTextColor;
        public int labelColor;
    }

    public static WidgetStyle getWidgetStyle(SharedPreferences prefs) {
        WidgetStyle s = new WidgetStyle();
        String theme = prefs.getString(KEY_THEME, "dark");
        s.isLight = "light".equalsIgnoreCase(theme);

        int intensityPercent = prefs.getInt(KEY_DARK_INTENSITY, 85);
        if (intensityPercent < 30) intensityPercent = 30;
        if (intensityPercent > 100) intensityPercent = 100;
        int alpha = (int) (intensityPercent * 255.0f / 100.0f);

        if (s.isLight) {
            s.backgroundColor = Color.argb(alpha, 255, 255, 255);
            s.primaryTextColor = Color.parseColor("#0F172A");    // dark slate
            s.secondaryTextColor = Color.parseColor("#475569");  // slate 600
            s.labelColor = Color.parseColor("#64748B");          // slate 500
        } else {
            String hexColor = prefs.getString(KEY_DARK_COLOR, "#0B0F17");
            int parsedColor;
            try {
                parsedColor = Color.parseColor(hexColor);
            } catch (Exception e) {
                parsedColor = Color.parseColor("#0B0F17");
            }
            int r = Color.red(parsedColor);
            int g = Color.green(parsedColor);
            int b = Color.blue(parsedColor);
            s.backgroundColor = Color.argb(alpha, r, g, b);

            s.primaryTextColor = Color.parseColor("#FFFFFF");
            s.secondaryTextColor = Color.parseColor("#94A3B8");
            s.labelColor = Color.parseColor("#A78BFA");
        }
        return s;
    }

    private static void applyWidgetStyle(RemoteViews views, WidgetStyle style) {
        // Set dynamic background color & alpha
        views.setInt(R.id.widget_bg, "setColorFilter", style.backgroundColor);

        // Set text colors
        views.setTextColor(R.id.widget_unpaid_amount, style.primaryTextColor);
        views.setTextColor(R.id.widget_subtext, style.secondaryTextColor);

        try {
            views.setTextColor(R.id.widget_label, style.labelColor);
        } catch (Exception ignored) {}
    }

    private static PendingIntent createActionPendingIntent(Context context, String action, int requestCode) {
        Intent intent = new Intent(context, MainActivity.class);
        intent.setAction(Intent.ACTION_VIEW);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        intent.putExtra(EXTRA_WIDGET_ACTION, action);

        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            flags |= PendingIntent.FLAG_IMMUTABLE;
        }
        return PendingIntent.getActivity(context, requestCode, intent, flags);
    }

    private static PendingIntent createRefreshPendingIntent(Context context, int requestCode) {
        Intent intent = new Intent(context, CarsAppWidget4x3.class);
        intent.setAction(ACTION_REFRESH);

        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            flags |= PendingIntent.FLAG_IMMUTABLE;
        }
        return PendingIntent.getBroadcast(context, requestCode, intent, flags);
    }
}
