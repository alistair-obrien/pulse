import * as api from "../api/API";
import { ToDateKey } from "../models/DateKey";
import { metricRepository } from "../models/MetricRepository";
import { MetricTypeIds, type MetricTypeId } from "../models/MetricTypeIds";

export async function cloudSync(date: Date) {
    await downloadMetrics(date);
    await uploadMetrics(date);
}

async function downloadMetrics(date: Date) {

    let dateKey = ToDateKey(date);

    const [
        steps, restingHeartRate, sleep, nutrition_calories, nutrition_protein, nutrition_carbs, nutrition_fat, nutrition_notes
    ] = await Promise.all([
        api.getMetric(dateKey, MetricTypeIds.Steps),
        api.getMetric(dateKey, MetricTypeIds.RestingHeartRate),
        api.getMetric(dateKey, MetricTypeIds.Sleep),
        api.getMetric(dateKey, MetricTypeIds.Nutrition_Calories),
        api.getMetric(dateKey, MetricTypeIds.Nutrition_Protein),
        api.getMetric(dateKey, MetricTypeIds.Nutrition_Carbs),
        api.getMetric(dateKey, MetricTypeIds.Nutrition_Fat),
        api.getMetric(dateKey, MetricTypeIds.Nutrition_Notes),
    ]);

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


async function uploadMetrics(date: Date) {

    const dateKey = ToDateKey(date);

    function getSelectedDayMetric<T>(metricTypeId:MetricTypeId, defaultValue:T) : T {
        return metricRepository.resolveMetric<T>(dateKey, metricTypeId, defaultValue);
    }

    const stepsValue = getSelectedDayMetric<number>(MetricTypeIds.Steps, 0);

    await api.setMetric(dateKey, MetricTypeIds.RestingHeartRate, getSelectedDayMetric<number>(MetricTypeIds.RestingHeartRate, 0));

    const [
        steps,
        restingHeartRate,
        sleep,
        nutrition_calories,
        nutrition_protein,
        nutrition_carbs,
        nutrition_fat,
        nutrition_notes
    ] = await Promise.all([
        api.setMetric(dateKey, MetricTypeIds.Steps, stepsValue),
        api.setMetric(dateKey, MetricTypeIds.RestingHeartRate, getSelectedDayMetric<number>(MetricTypeIds.RestingHeartRate, 0)),
        api.setMetric(dateKey, MetricTypeIds.Sleep, getSelectedDayMetric<number>(MetricTypeIds.Sleep, 0)),
        api.setMetric(dateKey, MetricTypeIds.Nutrition_Calories, getSelectedDayMetric<number>(MetricTypeIds.Nutrition_Calories, 0)),
        api.setMetric(dateKey, MetricTypeIds.Nutrition_Protein, getSelectedDayMetric<number>(MetricTypeIds.Nutrition_Protein, 0)),
        api.setMetric(dateKey, MetricTypeIds.Nutrition_Carbs, getSelectedDayMetric<number>(MetricTypeIds.Nutrition_Carbs, 0)),
        api.setMetric(dateKey, MetricTypeIds.Nutrition_Fat, getSelectedDayMetric<number>(MetricTypeIds.Nutrition_Fat, 0)),
        api.setMetric(dateKey, MetricTypeIds.Nutrition_Notes, getSelectedDayMetric<string>(MetricTypeIds.Nutrition_Notes, "")),
    ]);
}