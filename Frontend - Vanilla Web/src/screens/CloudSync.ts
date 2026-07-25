import * as api from "../api/API";
import { ToDateKey, type DateKey } from "../models/DateKey";
import { metricRepository } from "../models/MetricRepository";
import { MetricTypeIds, type MetricTypeId } from "../models/MetricTypeIds";

export async function cloudSync(date: Date) {
    let dateKey = ToDateKey(date);

    await uploadMetrics(dateKey);
    metricRepository.userEditsStore.Clear(dateKey); // Clear user edits
    await downloadMetrics(dateKey);
}

async function downloadMetrics(dateKey: DateKey) {

    const [
        reflection, steps, restingHeartRate, sleep, nutrition_calories, nutrition_protein, nutrition_carbs, nutrition_fat, nutrition_notes
    ] = await Promise.all([
        api.getMetric(dateKey, MetricTypeIds.Reflection),
        api.getMetric(dateKey, MetricTypeIds.Steps),
        api.getMetric(dateKey, MetricTypeIds.RestingHeartRate),
        api.getMetric(dateKey, MetricTypeIds.Sleep),
        api.getMetric(dateKey, MetricTypeIds.Nutrition_Calories),
        api.getMetric(dateKey, MetricTypeIds.Nutrition_Protein),
        api.getMetric(dateKey, MetricTypeIds.Nutrition_Carbs),
        api.getMetric(dateKey, MetricTypeIds.Nutrition_Fat),
        api.getMetric(dateKey, MetricTypeIds.Nutrition_Notes),
    ]);

    console.log(reflection);

    if (reflection)
        metricRepository.cloudCacheStore.Set(dateKey, MetricTypeIds.Reflection, reflection);
    if (steps)
        metricRepository.cloudCacheStore.Set(dateKey, MetricTypeIds.Steps, steps);
    if (restingHeartRate)
        metricRepository.cloudCacheStore.Set(dateKey, MetricTypeIds.RestingHeartRate, restingHeartRate);
    if (sleep)
        metricRepository.cloudCacheStore.Set(dateKey, MetricTypeIds.Sleep, sleep);
    if (nutrition_calories)
        metricRepository.cloudCacheStore.Set(dateKey, MetricTypeIds.Nutrition_Calories, nutrition_calories);
    if (nutrition_protein)
        metricRepository.cloudCacheStore.Set(dateKey, MetricTypeIds.Nutrition_Protein, nutrition_protein);
    if (nutrition_carbs)
        metricRepository.cloudCacheStore.Set(dateKey, MetricTypeIds.Nutrition_Carbs, nutrition_carbs);
    if (nutrition_fat)
        metricRepository.cloudCacheStore.Set(dateKey, MetricTypeIds.Nutrition_Fat, nutrition_fat);
    if (nutrition_notes)
        metricRepository.cloudCacheStore.Set(dateKey, MetricTypeIds.Nutrition_Notes, nutrition_notes);
}


async function uploadMetrics(dateKey: DateKey) {

    const reflection = getMetricToUpload<number>(dateKey, MetricTypeIds.Reflection);
    if (reflection !== undefined)
        await api.setMetric(dateKey, MetricTypeIds.Reflection, reflection);

    const steps = getMetricToUpload<number>(dateKey, MetricTypeIds.Steps);
    if (steps !== undefined)
        await api.setMetric(dateKey, MetricTypeIds.Steps, steps);


    // const [
    //     reflection,
    //     steps,
    //     restingHeartRate,
    //     sleep,
    //     nutrition_calories,
    //     nutrition_protein,
    //     nutrition_carbs,
    //     nutrition_fat,
    //     nutrition_notes
    // ] = await Promise.all([
    //     api.setMetric(dateKey, MetricTypeIds.Reflection, getSelectedDayMetric<string>(MetricTypeIds.Reflection, "")),
    //     api.setMetric(dateKey, MetricTypeIds.Steps, getSelectedDayMetric<number>(MetricTypeIds.Steps, 0)),
    //     api.setMetric(dateKey, MetricTypeIds.RestingHeartRate, getSelectedDayMetric<number>(MetricTypeIds.RestingHeartRate, 0)),
    //     api.setMetric(dateKey, MetricTypeIds.Sleep, getSelectedDayMetric<number>(MetricTypeIds.Sleep, 0)),
    //     api.setMetric(dateKey, MetricTypeIds.Nutrition_Calories, getSelectedDayMetric<number>(MetricTypeIds.Nutrition_Calories, 0)),
    //     api.setMetric(dateKey, MetricTypeIds.Nutrition_Protein, getSelectedDayMetric<number>(MetricTypeIds.Nutrition_Protein, 0)),
    //     api.setMetric(dateKey, MetricTypeIds.Nutrition_Carbs, getSelectedDayMetric<number>(MetricTypeIds.Nutrition_Carbs, 0)),
    //     api.setMetric(dateKey, MetricTypeIds.Nutrition_Fat, getSelectedDayMetric<number>(MetricTypeIds.Nutrition_Fat, 0)),
    //     api.setMetric(dateKey, MetricTypeIds.Nutrition_Notes, getSelectedDayMetric<string>(MetricTypeIds.Nutrition_Notes, ""))
    // ]);
}

function getMetricToUpload<T>(
    date: DateKey,
    metricTypeId: MetricTypeId
): T | undefined {

    const user = metricRepository.userEditsStore.Get<T>(date, metricTypeId);
    if (user) {
        console.log("USER", date, metricTypeId)
        return user.metricData;
    }

    const device = metricRepository.deviceCacheStore.Get<T>(date, metricTypeId);
    if (device) {
        console.log("DEVICE", date, metricTypeId)
        return device.metricData;
    }

    return undefined;
}
