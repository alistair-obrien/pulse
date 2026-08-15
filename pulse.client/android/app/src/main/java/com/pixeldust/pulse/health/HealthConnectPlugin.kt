package com.pixeldust.pulse.health

import android.content.Intent
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
import androidx.health.connect.client.aggregate.AggregateMetric
import androidx.health.connect.client.request.AggregateRequest
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
    fun openHealthConnectSettings(call: PluginCall) {
        try {
            val intent = Intent(
                HealthConnectClient.ACTION_HEALTH_CONNECT_SETTINGS
            )

            activity.startActivity(intent)

            call.resolve()
        } catch (e: Exception) {
            call.reject(e.message, e)
        }
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

//    private suspend fun aggregate(
//        metrics: Set<AggregateMetric<*>>,
//        start: Instant,
//        end: Instant
//    ): Map<AggregateMetric<*>, Any?> {
//        val client = HealthConnectClient.getOrCreate(context)
//
//        return client.aggregate(
//            AggregateRequest(
//                metrics = metrics,
//                timeRangeFilter = TimeRangeFilter.between(start, end)
//            )
//        )
//    }

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
    fun readActivities(call: PluginCall) = launchPluginCall(call) {

        val (start, end) = call.getTimeRange()

        val records = readRecords(
            ExerciseSessionRecord::class,
            start,
            end
        )

        val activities = JSArray()

        for (record in records) {
            val activity = JSObject()

            val durationMinutes =
                java.time.Duration.between(
                    record.startTime,
                    record.endTime
                ).toMinutes()

            activity.put(
                "type",
                getActivityType(record.exerciseType)
            )

            activity.put(
                "title",
                record.title ?: ""
            )

            activity.put(
                "duration",
                durationMinutes
            )

            activity.put(
                "notes",
                record.notes ?: ""
            )

            activity.put(
                "source",
                record.metadata.dataOrigin.packageName
            )

            activities.put(activity)
        }

        JSObject().apply {
            put("activities", activities)
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

        android.util.Log.d(
            "HealthConnect",
            "RHR READ: start=$start end=$end"
        )

        val records = readRecords(
            RestingHeartRateRecord::class,
            start,
            end
        )

        android.util.Log.d(
            "HealthConnect",
            "RHR RECORD COUNT: ${records.size}"
        )

        for (record in records) {
            android.util.Log.d(
                "HealthConnect",
                "RHR RECORD: ${record.beatsPerMinute} bpm @ ${record.time}"
            )
        }

        val restingHeartRateAverage =
            if (records.isEmpty()) {
                0.0
            } else {
                records.sumOf { it.beatsPerMinute.toDouble() } / records.size
            }

        android.util.Log.d(
            "HealthConnect",
            "RHR AVERAGE: $restingHeartRateAverage"
        )

        JSObject().apply {
            put("averageRestingHeartRate", restingHeartRateAverage)
        }
    }

    private fun getActivityType(type: Int): String =
        when (type) {
            ExerciseSessionRecord.EXERCISE_TYPE_BADMINTON -> "badminton"
            ExerciseSessionRecord.EXERCISE_TYPE_BASEBALL -> "baseball"
            ExerciseSessionRecord.EXERCISE_TYPE_BASKETBALL -> "basketball"
            ExerciseSessionRecord.EXERCISE_TYPE_BIKING -> "cycling"
            ExerciseSessionRecord.EXERCISE_TYPE_BIKING_STATIONARY -> "bikingStationary"
            ExerciseSessionRecord.EXERCISE_TYPE_BOOT_CAMP -> "bootCamp"
            ExerciseSessionRecord.EXERCISE_TYPE_BOXING -> "boxing"
            ExerciseSessionRecord.EXERCISE_TYPE_CALISTHENICS -> "calisthenics"
            ExerciseSessionRecord.EXERCISE_TYPE_CRICKET -> "cricket"
            ExerciseSessionRecord.EXERCISE_TYPE_DANCING -> "dancing"
            ExerciseSessionRecord.EXERCISE_TYPE_ELLIPTICAL -> "elliptical"
            ExerciseSessionRecord.EXERCISE_TYPE_EXERCISE_CLASS -> "exerciseClass"
            ExerciseSessionRecord.EXERCISE_TYPE_FENCING -> "fencing"
            ExerciseSessionRecord.EXERCISE_TYPE_FOOTBALL_AMERICAN -> "americanFootball"
            ExerciseSessionRecord.EXERCISE_TYPE_FOOTBALL_AUSTRALIAN -> "australianFootball"
            ExerciseSessionRecord.EXERCISE_TYPE_FRISBEE_DISC -> "frisbeedisc"
            ExerciseSessionRecord.EXERCISE_TYPE_GOLF -> "golf"
            ExerciseSessionRecord.EXERCISE_TYPE_GYMNASTICS -> "gymnastics"
            ExerciseSessionRecord.EXERCISE_TYPE_HANDBALL -> "handball"
            ExerciseSessionRecord.EXERCISE_TYPE_HIGH_INTENSITY_INTERVAL_TRAINING ->
                "highIntensityIntervalTraining"
            ExerciseSessionRecord.EXERCISE_TYPE_HIKING -> "hiking"
            ExerciseSessionRecord.EXERCISE_TYPE_ICE_HOCKEY -> "iceHockey"
            ExerciseSessionRecord.EXERCISE_TYPE_ICE_SKATING -> "iceSkating"
            ExerciseSessionRecord.EXERCISE_TYPE_MARTIAL_ARTS -> "martialArts"
            ExerciseSessionRecord.EXERCISE_TYPE_PADDLING -> "paddling"
            ExerciseSessionRecord.EXERCISE_TYPE_PARAGLIDING -> "paraGliding"
            ExerciseSessionRecord.EXERCISE_TYPE_PILATES -> "pilates"
            ExerciseSessionRecord.EXERCISE_TYPE_RACQUETBALL -> "racquetball"
            ExerciseSessionRecord.EXERCISE_TYPE_ROCK_CLIMBING -> "rockClimbing"
            ExerciseSessionRecord.EXERCISE_TYPE_ROLLER_HOCKEY -> "rollerHockey"
            ExerciseSessionRecord.EXERCISE_TYPE_ROWING -> "rowing"
            ExerciseSessionRecord.EXERCISE_TYPE_ROWING_MACHINE -> "rowingMachine"
            ExerciseSessionRecord.EXERCISE_TYPE_RUGBY -> "rugby"
            ExerciseSessionRecord.EXERCISE_TYPE_RUNNING -> "running"
            ExerciseSessionRecord.EXERCISE_TYPE_RUNNING_TREADMILL -> "runningTreadmill"
            ExerciseSessionRecord.EXERCISE_TYPE_SAILING -> "sailing"
            ExerciseSessionRecord.EXERCISE_TYPE_SCUBA_DIVING -> "scubaDiving"
            ExerciseSessionRecord.EXERCISE_TYPE_SKATING -> "skating"
            ExerciseSessionRecord.EXERCISE_TYPE_SKIING -> "skiing"
            ExerciseSessionRecord.EXERCISE_TYPE_SNOWBOARDING -> "snowboarding"
            ExerciseSessionRecord.EXERCISE_TYPE_SNOWSHOEING -> "snowshoeing"
            ExerciseSessionRecord.EXERCISE_TYPE_SOCCER -> "soccer"
            ExerciseSessionRecord.EXERCISE_TYPE_SOFTBALL -> "softball"
            ExerciseSessionRecord.EXERCISE_TYPE_SQUASH -> "squash"
            ExerciseSessionRecord.EXERCISE_TYPE_STAIR_CLIMBING -> "stairClimbing"
            ExerciseSessionRecord.EXERCISE_TYPE_STAIR_CLIMBING_MACHINE ->
                "stairClimbingMachine"
            ExerciseSessionRecord.EXERCISE_TYPE_STRENGTH_TRAINING ->
                "strengthTraining"
            ExerciseSessionRecord.EXERCISE_TYPE_STRETCHING -> "stretching"
            ExerciseSessionRecord.EXERCISE_TYPE_SURFING -> "surfing"
            ExerciseSessionRecord.EXERCISE_TYPE_SWIMMING_OPEN_WATER ->
                "swimmingOpenWater"
            ExerciseSessionRecord.EXERCISE_TYPE_SWIMMING_POOL -> "swimmingPool"
            ExerciseSessionRecord.EXERCISE_TYPE_TABLE_TENNIS -> "tableTennis"
            ExerciseSessionRecord.EXERCISE_TYPE_TENNIS -> "tennis"
            ExerciseSessionRecord.EXERCISE_TYPE_VOLLEYBALL -> "volleyball"
            ExerciseSessionRecord.EXERCISE_TYPE_WALKING -> "walking"
            ExerciseSessionRecord.EXERCISE_TYPE_WATER_POLO -> "waterPolo"
            ExerciseSessionRecord.EXERCISE_TYPE_WEIGHTLIFTING -> "weightlifting"
            ExerciseSessionRecord.EXERCISE_TYPE_WHEELCHAIR -> "wheelchair"
            ExerciseSessionRecord.EXERCISE_TYPE_YOGA -> "yoga"
            else -> "other"
        }
}