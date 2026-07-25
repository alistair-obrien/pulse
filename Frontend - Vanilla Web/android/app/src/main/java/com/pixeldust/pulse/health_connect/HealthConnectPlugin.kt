package com.pixeldust.pulse.health_connect

import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import androidx.health.connect.client.HealthConnectClient

import androidx.health.connect.client.records.StepsRecord
import androidx.health.connect.client.request.ReadRecordsRequest
import androidx.health.connect.client.time.TimeRangeFilter

import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

import java.time.Instant

import androidx.activity.result.ActivityResultLauncher
import androidx.health.connect.client.PermissionController
import androidx.health.connect.client.permission.HealthPermission
import androidx.health.connect.client.records.BodyFatRecord
import androidx.health.connect.client.records.ExerciseSessionRecord
import androidx.health.connect.client.records.NutritionRecord
import androidx.health.connect.client.records.RestingHeartRateRecord
import androidx.health.connect.client.records.SleepSessionRecord
import androidx.health.connect.client.records.WeightRecord
import com.getcapacitor.JSArray
import androidx.health.connect.client.records.Record
import kotlin.reflect.KClass

@CapacitorPlugin(name = "HealthConnect")
class HealthConnectPlugin : Plugin() {

    private lateinit var permissionLauncher: ActivityResultLauncher<Set<String>>
    private var pendingPermissionCall: PluginCall? = null

    companion object {
        private val PERMISSIONS = setOf(
            HealthPermission.getReadPermission(StepsRecord::class),
            HealthPermission.getReadPermission(NutritionRecord::class),
            HealthPermission.getReadPermission(SleepSessionRecord::class),
            HealthPermission.getReadPermission(RestingHeartRateRecord::class),
            HealthPermission.getReadPermission(WeightRecord::class),
            HealthPermission.getReadPermission(BodyFatRecord::class),
            HealthPermission.getReadPermission(ExerciseSessionRecord::class)
            )
    }

    override fun load() {
        permissionLauncher =
            activity.registerForActivityResult(
                PermissionController.createRequestPermissionResultContract()
            ) { granted ->

                val call = pendingPermissionCall ?: return@registerForActivityResult

                val ret = JSObject()
                ret.put("granted", granted.containsAll(PERMISSIONS))

                call.resolve(ret)
                pendingPermissionCall = null
            }
    }

    @PluginMethod
    fun requestHealthConnectPermissions(call: PluginCall) {
        pendingPermissionCall = call
        permissionLauncher.launch(PERMISSIONS)
    }


    @PluginMethod
    fun isAvailable(call: PluginCall) {

        val provider = "com.google.android.apps.healthdata"

        val status = HealthConnectClient.getSdkStatus(
            context,
            provider
        )

        val ret = JSObject()

        when (status) {
            HealthConnectClient.SDK_AVAILABLE -> {
                ret.put("available", true)
                ret.put("status", status)
                ret.put("reason", "available")
            }

            HealthConnectClient.SDK_UNAVAILABLE -> {
                ret.put("available", false)
                ret.put("status", status)
                ret.put("reason", "unsupported")
            }

            HealthConnectClient.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED -> {
                ret.put("available", false)
                ret.put("status", status)
                ret.put("reason", "update_required")
            }
        }

        call.resolve(ret)
    }

    private suspend fun <T : Record> readRecords(
        recordType: KClass<T>,
        start: Instant,
        end: Instant
    ): List<T> {
        val client = HealthConnectClient.getOrCreate(context)

        return client.readRecords(
            ReadRecordsRequest(
                recordType,
                TimeRangeFilter.between(start, end)
            )
        ).records
    }

    private fun launchPluginCall(
        call: PluginCall,
        block: suspend () -> JSObject
    ) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val result = block()

                withContext(Dispatchers.Main) {
                    call.resolve(result)
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    call.reject(e.message, e)
                }
            }
        }
    }

    private fun PluginCall.getTimeRange(): Pair<Instant, Instant> =
        Pair(
            Instant.parse(getString("startUtc")!!),
            Instant.parse(getString("endUtc")!!)
        )

    @PluginMethod
    fun hasHealthConnectPermissions(call: PluginCall) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val client = HealthConnectClient.getOrCreate(context)

                val granted = client.permissionController
                    .getGrantedPermissions()

                val ret = JSObject()
                ret.put("has_permissions", granted.containsAll(PERMISSIONS))

                withContext(Dispatchers.Main) {
                    call.resolve(ret)
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    call.reject(e.message, e)
                }
            }
        }
    }

    @PluginMethod
    fun readSteps(call: PluginCall) = launchPluginCall(call) {

        val (start, end) = call.getTimeRange()

        val records = readRecords(
            StepsRecord::class,
            start,
            end
        )

        JSObject().apply {
            put("totalSteps", records.sumOf { it.count })
        }
    }

    @PluginMethod
    fun readSleep(call: PluginCall) = launchPluginCall(call) {

        val (start, end) = call.getTimeRange()

        val records = readRecords(
            SleepSessionRecord::class,
            start,
            end
        )

        val sessions = JSArray()
        for (record in records) {
            val session = JSObject()

            session.put("startTime", record.startTime.toString())
            session.put("endTime", record.endTime.toString())
            session.put("title", record.title)
            session.put("notes", record.notes)
            session.put("startZoneOffset", record.startZoneOffset?.toString())
            session.put("endZoneOffset", record.endZoneOffset?.toString())

            sessions.put(session)
        }

        JSObject().apply {
            put("sessions", sessions)
        }
    }

    @PluginMethod
    fun readNutrition(call: PluginCall) = launchPluginCall(call) {

        val (start, end) = call.getTimeRange()
        val records = readRecords(
            NutritionRecord::class,
            start,
            end
        )

        JSObject().apply {
            put("totalCalories", records.sumOf { (it.energy?.inCalories ?: 0.0) / 1000.0 })
            put("totalProtein", records.sumOf { it.protein?.inGrams ?: 0.0 })
            put("totalCarbohydrates", records.sumOf { it.totalCarbohydrate?.inGrams ?: 0.0 })
            put("totalFats", records.sumOf { it.totalFat?.inGrams ?: 0.0 })
            put("totalFiber", records.sumOf { it.dietaryFiber?.inGrams ?: 0.0 })
        }
    }

    @PluginMethod
    fun readRestingHeartRate(call: PluginCall) = launchPluginCall(call) {
        val (start, end) = call.getTimeRange()
        val records = readRecords(
            RestingHeartRateRecord::class,
            start,
            end
        )

        val restingHeartRateAverage =
            if (records.isEmpty()) {
                0.0
            } else {
                records.sumOf { it.beatsPerMinute.toDouble() } / records.size
            }
        JSObject().apply {
            put("averageRestingHeartRate", restingHeartRateAverage)
        }
    }
}