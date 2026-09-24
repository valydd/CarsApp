package ro.carsapp.fleet;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;

public class CarsAppWidget4x3 extends AppWidgetProvider {

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        WidgetHelper.update4x3(context, appWidgetManager, appWidgetIds);
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        super.onReceive(context, intent);
        if (WidgetHelper.ACTION_REFRESH.equals(intent.getAction())) {
            WidgetHelper.updateAllWidgets(context);
        }
    }
}
