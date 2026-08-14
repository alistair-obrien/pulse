package com.pixeldust.pulse;

import android.os.Bundle;

import androidx.activity.result.ActivityResultLauncher;

import com.getcapacitor.BridgeActivity;
import com.pixeldust.pulse.health.HealthConnectPlugin;

import java.util.Set;

public class MainActivity extends BridgeActivity {
    public ActivityResultLauncher<Set<String>> healthPermissionLauncher;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(HealthConnectPlugin.class);

        super.onCreate(savedInstanceState);
    }
}