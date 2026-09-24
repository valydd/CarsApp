package ro.carsapp.fleet;

import android.Manifest;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Bundle;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.PluginHandle;

public class MainActivity extends BridgeActivity {
    private static final int CAMERA_PERMISSION_CODE = 101;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(CarsAppWidgetPlugin.class);
        super.onCreate(savedInstanceState);

        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.CAMERA}, CAMERA_PERMISSION_CODE);
        }

        handleWidgetIntent(getIntent());
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        handleWidgetIntent(intent);
    }

    private void handleWidgetIntent(Intent intent) {
        if (intent != null && intent.hasExtra(WidgetHelper.EXTRA_WIDGET_ACTION)) {
            String action = intent.getStringExtra(WidgetHelper.EXTRA_WIDGET_ACTION);
            if (action != null && !action.isEmpty()) {
                CarsAppWidgetPlugin.setPendingAction(action);
                try {
                    PluginHandle handle = getBridge().getPlugin("CarsAppWidget");
                    if (handle != null && handle.getInstance() instanceof CarsAppWidgetPlugin) {
                        ((CarsAppWidgetPlugin) handle.getInstance()).emitWidgetAction(action);
                    }
                } catch (Exception ignored) {}
            }
        }
    }
}
