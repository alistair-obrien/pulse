package com.pixeldust.pulse;

import android.os.Bundle;

import androidx.activity.result.ActivityResultLauncher;
import androidx.health.connect.client.PermissionController;

import com.getcapacitor.BridgeActivity;
import com.pixeldust.pulse.health_connect.HealthConnectPlugin;

import java.util.Set;
import java.util.function.Consumer;

public class MainActivity extends BridgeActivity {
    public ActivityResultLauncher<Set<String>> healthPermissionLauncher;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(HealthConnectPlugin.class);
        super.onCreate(savedInstanceState);
    }
}