// The total height of the hero area (Partly occluded by content based on visible height)
const HERO_AREA_TOTAL_HEIGHT = 400;
// The total visible height of the hero area. Used to set the size of the header
const HERO_AREA_VISIBLE_HEIGHT = 280;

// // At what scroll distance the header should start fading out
// const HEADER_FADE_THRESHOLD = 50;
// // How much distance the fade takes to finish
// const HEADER_FADE_DIST = 10;

// At what scroll distance the date should start fading out
const DATE_FADE_THRESHOLD = 180;
// How much distance the fade takes to finish
const DATE_FADE_DIST = 20;

import "../styles/main.css"
import "remixicon/fonts/remixicon.css";

// import * as api from "../api/API";
import { WorkoutTypes, type SleepLogData, type WorkoutLogData, type WorkoutType } from "../../models/Models";
import { ToDateKey } from "../../models/DateKey";
import { metricRepository } from "../../models/MetricRepository";
import { getImageUrl as getRandomImageUrl } from "../../controllers/RandomImage";
import { Icons } from "../components/Icons";
import { MetricTypeIds, type MetricTypeId } from "../../models/MetricRegistry";
import * as DeviceSync from "../../controllers/DeviceMetricsSync";
import * as CloudSync from "../../controllers/CloudSync"
import * as ExternalAPISync from "../../controllers/ExternalAPISync"

// import { App } from '@capacitor/app';

// App.addListener('resume', async () => {

//     if (DeviceSync.isAvailable()) { 
//         await DeviceSync.sync(selectedDate);
//     }

//     await CloudSync.cloudSync(selectedDate);
// });

// =====================================================
// Helpers
// =====================================================
export interface UtcDateRange {
    startUtc: string;
    endUtc: string;
}

// let syncTimer: number | null = null;
// let syncing = false;

// const SYNC_INTERVAL_MS = 10_000;

// function startAutoSync() {
//     stopAutoSync();

//     const tick = async () => {
//         if (isToday(selectedDate)) {
//             await healthConnectSync(selectedDate);
//         }

//         syncTimer = window.setTimeout(tick, SYNC_INTERVAL_MS);
//     };

//     syncTimer = window.setTimeout(tick, SYNC_INTERVAL_MS);
// }

// function stopAutoSync() {
//     if (syncTimer !== null) {
//         clearTimeout(syncTimer);
//         syncTimer = null;
//     }
// }

function enableDaySwipe(element: HTMLElement) {
    let startX = 0;
    let startY = 0;

    element.addEventListener("touchstart", e => {
        const touch = e.touches[0];
        startX = touch.clientX;
        startY = touch.clientY;
    }, { passive: true });

    element.addEventListener("touchend", e => {
        const touch = e.changedTouches[0];

        const dx = touch.clientX - startX;
        const dy = touch.clientY - startY;

        // Ignore mostly vertical swipes
        if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy))
            return;

        const nextDate = new Date(selectedDate);

        if (dx < 0) {
            // Swipe left -> next day
            nextDate.setDate(nextDate.getDate() + 1);

            if (!isFuture(nextDate)) {
                transitionToDate(nextDate, "left")
            }
        }
        else {
            // Swipe right -> previous day
            nextDate.setDate(nextDate.getDate() - 1);
            transitionToDate(nextDate, "right")

        }
    }, { passive: true });
}

// =====================================================
// State
// =====================================================

let selectedDate = new Date();
let selectedDateKey = ToDateKey(selectedDate);

let root!: HTMLElement;

// =====================================================
// Mounting
// =====================================================

export async function mount(container: HTMLElement) {
    root = container;

    root.style.setProperty('--hero-area-visible-height', `${HERO_AREA_VISIBLE_HEIGHT}px`);
    root.style.setProperty('--hero-area-total-height', `${HERO_AREA_TOTAL_HEIGHT}px`);

    await loadDate(new Date());
    rerender();

    enableDaySwipe(container);
    // startAutoSync();
}

export function rerender() {
    root.replaceChildren(render());
}

async function loadDate(date: Date) {
    selectedDate = date;
    selectedDateKey = ToDateKey(selectedDate);

    if (DeviceSync.isAvailable()) { await DeviceSync.sync(date); }
    if (CloudSync.isAvailable()) { await CloudSync.sync(date); } 
    void ExternalAPISync.sync(date);
}

let animating:boolean  = false
async function transitionToDate(date: Date, direction: "left" | "right") {

    if (animating) { return; }
    animating = true;

    const oldPage = root.firstElementChild as HTMLElement | null;

    await loadDate(date);

    const newPage = render();

    if (!oldPage) {
        root.replaceChildren(newPage);
        return;
    }

    root.insertBefore(newPage, root.firstChild);

    if (direction === "right") {
        oldPage.classList.add("disappear");
        newPage.classList.add("slide-in-right");
    } else {
        oldPage.classList.add("disappear");
        newPage.classList.add("slide-in-left");
    }

    await Promise.all([
        waitForAnimation(oldPage),
        waitForAnimation(newPage)
    ]);

    oldPage.remove();

    newPage.classList.remove(
        "disappear",
        "appear",
        "slide-in-left",
        "slide-in-right"
    );

    animating = false;
}

function waitForAnimation(element: HTMLElement): Promise<void> {
    return new Promise(resolve => {
        element.addEventListener("animationend", () => resolve(), {
            once: true
        });
    });
}

// =====================================================
// Actions
// =====================================================
// async function onPublishClicked() {
//     await cloudSync(selectedDate);
//     await api.publish(selectedDateKey);
// }
import { Toast } from "@capacitor/toast";

import { Clipboard } from "@capacitor/clipboard";
import { ActionButton } from "../components/ActionButton";
import { Card } from "../components/Card";
import { isFuture, isToday } from "../../controllers/DateTime";
async function onCopyTextClicked() {

    const sleepRecords = getSelectedDayMetric<SleepLogData[]>(MetricTypeIds.Sleep);
    const totalSleepHours = sleepRecords.reduce(
        (total, sleep) => total + sleep.sleepHours,
        0
    );
    const sleepText = getHoursAndMinutesStrFromTime(totalSleepHours);

    const calories = Math.round(getSelectedDayMetric<number>(MetricTypeIds.Nutrition_Calories));
    const protein = Math.round(getSelectedDayMetric<number>(MetricTypeIds.Nutrition_Protein));
    const carbs = Math.round(getSelectedDayMetric<number>(MetricTypeIds.Nutrition_Carbs));
    const fat = Math.round(getSelectedDayMetric<number>(MetricTypeIds.Nutrition_Fat));
    const nutritionNotes = getSelectedDayMetric<string>(MetricTypeIds.Nutrition_Notes);

    const reflectionNotes = getSelectedDayMetric<string>(MetricTypeIds.Reflection);

    let dailyJournaltext = [];

    // https://hevy.com/workout/FNNqHdwBvc0
    dailyJournaltext.push("😪 Sleep");
    dailyJournaltext.push(sleepText);             // 7h 30m
    dailyJournaltext.push(``);
    dailyJournaltext.push(`🥩 Food`);
    dailyJournaltext.push(`${calories} calories`) // 2584 calories
    dailyJournaltext.push(`${protein}g protein`)  // 184g protein
    dailyJournaltext.push(`${carbs}g carbs`)      // 289g carbs
    dailyJournaltext.push(`${fat}g fat`)          // 77g fat
    nutritionNotes && dailyJournaltext.push(nutritionNotes);
    dailyJournaltext.push(``);
    dailyJournaltext.push(`💪 Workout`);
    reflectionNotes && dailyJournaltext.push(reflectionNotes);

    await Clipboard.write({
        string: dailyJournaltext.join('\n')
    });
}

// =====================================================
// Rendering
// =====================================================

export function render(): HTMLElement {

    const screenContainer = document.createElement("div");
    screenContainer.className = "screen-container";
    
    const content = document.createElement("div");
    content.className = "content";
    
    const header = createHeader(content);

    const heroArea = createHeroArea(content);
    
    const heroSpacer = document.createElement("div");
    heroSpacer.className = "hero-spacer";
    
    content.append(
        heroSpacer,
        createReflectionCard(),
        createRecoveryCard(),
        createNutritionCard(),
        createActivityCard(),
        createReportActionButtons(),
    );

    // const footer = createFooter();

    screenContainer.append(
        header,
        heroArea,
        content,
        // footer,
    );

    return screenContainer;
}

// =====================================================
// Header
// =====================================================

function createHeroArea(contentRoot: HTMLElement): HTMLElement {
    const heroArea = document.createElement("div");
    heroArea.className = "hero";
    heroArea.id = "hero-area";
    
    const heroImage = document.createElement("img");
    
    heroImage.src = getRandomImageUrl(selectedDate.getDay());
    heroImage.id = "hero-image"

    heroArea.append(
        heroImage,
    );

    contentRoot.addEventListener("scroll", () => {
    const y = contentRoot.scrollTop;

    heroArea.style.transform =
        `translateY(${-y * 0.5}px)`;
    });

    return heroArea;
}

function createDateRow(): HTMLElement {
    const dateRow = document.createElement("div");
    dateRow.className = "date-row"
    dateRow.id = "date-row";

    const dateContainer = document.createElement("div");
    dateContainer.className = "date-row-container";

    const weekdayFormatted = new Intl.DateTimeFormat("en-GB", {
        weekday: "long"
    }).format(selectedDate);

    const dateFormatted = new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric"
    }).format(selectedDate);

    const weekday = document.createElement("h1");
    weekday.textContent = weekdayFormatted;

    const dateText = document.createElement("h2");
    dateText.textContent = dateFormatted;

    dateContainer.append(weekday, dateText);

    const prevButton = document.createElement("button");
    prevButton.className = "icon-button";
    prevButton.innerHTML = `
    <svg 
        xmlns="http://www.w3.org/2000/svg"  
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        stroke-width="2" 
        stroke-linecap="round" 
        stroke-linejoin="round" 
        class="lucide lucide-chevron-left-icon lucide-chevron-left">
        <path d="m15 18-6-6 6-6"/>
    </svg>`

    prevButton.onclick = async () => {
        const date = new Date(selectedDate);
        date.setDate(date.getDate() - 1);
        await transitionToDate(date, "right");
    };

    const nextButton = document.createElement("button");
    nextButton.className = "icon-button";
    nextButton.innerHTML = `
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            stroke-width="2" 
            stroke-linecap="round" 
            stroke-linejoin="round" 
            class="lucide lucide-chevron-right-icon lucide-chevron-right">
            <path d="m9 18 6-6-6-6"/>
        </svg>`
    nextButton.onclick = async () => {
        const next = new Date(selectedDate);
        next.setDate(next.getDate() + 1);

        if (!isFuture(next)) {
            await transitionToDate(next, "left");

        }
    };

    nextButton.disabled = isToday(selectedDate);

    // // TODO: Only if we are not on today
    // const todayButton = document.createElement("button");
    // todayButton.textContent = "Today";
    // todayButton.onclick = () => {
    //     const date = new Date();
    //     date.setDate(date.getDate());
    //     changeDate(date);
    // };

    dateRow.append(prevButton, dateContainer, nextButton);

    return dateRow;
}

function createHeader(contentRoot:HTMLElement): HTMLElement {

    const header = document.createElement("div");
    header.className = "header";

    const dateRow = createDateRow();
    header.append(dateRow);

    // If we need a top header again we can use this to smooth fade it out when scrolling
    // contentRoot.addEventListener("scroll", () => {
    //     const y = contentRoot.scrollTop;

    //     const start = HEADER_FADE_THRESHOLD;
    //     const end = HEADER_FADE_THRESHOLD + HEADER_FADE_DIST;

    //     const opacity = 1 - ((y - start) / (end - start));
    //     headerInner.style.opacity = `${opacity}`;
    // });

    contentRoot.addEventListener("scroll", () => {
            const y = contentRoot.scrollTop;
            
            const opacity = 1 - ((y - DATE_FADE_THRESHOLD) / (DATE_FADE_DIST));
            dateRow.style.opacity = `${opacity}`;
            header.style.height = `${HERO_AREA_VISIBLE_HEIGHT - y}px`;
        }
    );

    return header;
}

// =====================================================
// Reflection
// =====================================================

function createReflectionCard(): HTMLElement {

    const card = new Card("Reflections", Icons.Reflection); 

    const textArea = createTextInputArea(
        "...what did you achieve today?", 
        MetricTypeIds.Reflection
    );

    card.addContent(
        textArea
    );

    return card.root;
}

// =====================================================
// Nutrition
// =====================================================

function createNutritionCard(): HTMLElement {

    const card = new Card("Nutrition", Icons.Nutrition); 

    const nutritionlist = document.createElement("div");
    nutritionlist.className = "metric-list";

    const calories = Math.round(getSelectedDayMetric<number>(MetricTypeIds.Nutrition_Calories));
    const caloriesElement = createMetricValue(calories.toString(), 'kcal');
    const caloriesCard = createMetricRow("Calories", caloriesElement);
    
    const protein = Math.round(getSelectedDayMetric<number>(MetricTypeIds.Nutrition_Protein));
    const proteinElement = createMetricValue(protein.toString(), 'g');
    const proteinCard = createMetricRow("Protein", proteinElement);
    
    const carbs = Math.round(getSelectedDayMetric<number>(MetricTypeIds.Nutrition_Carbs));
    const carbsElement = createMetricValue(carbs.toString(), 'g');
    const carbsCard = createMetricRow("Carbs", carbsElement);

    const fat = Math.round(getSelectedDayMetric<number>(MetricTypeIds.Nutrition_Fat));
    const fatElement = createMetricValue(fat.toString(), 'g');
    const fatCard = createMetricRow("Fat", fatElement);

    nutritionlist.append(
        caloriesCard,
        proteinCard,
        carbsCard,
        fatCard
    );

    const textArea = createTextInputArea(
        "...how were your meals?",
        MetricTypeIds.Nutrition_Notes
    );

    card.addContent(
        nutritionlist
    );

    card.addContent(
        textArea,
    )

    return card.root;
}

// =====================================================
// Workout
// =====================================================

const WORKOUT_ICONS: Record<WorkoutType, string> = {
    [WorkoutTypes.Strength]: Icons.Strength,
    [WorkoutTypes.Cardio]: Icons.Cardio,
    [WorkoutTypes.Sports]: Icons.Sports,
    [WorkoutTypes.HIIT]: Icons.HIIT,
    [WorkoutTypes.FlexibilityMobility]: Icons.FlexibilityMobility,
};

function createActivityCard(): HTMLElement {

    const card = new Card("Activity", Icons.Activity); 

    const workoutRecords = getSelectedDayMetric<WorkoutLogData[]>(MetricTypeIds.Workouts);

    if (workoutRecords.length === 0) {
        const empty = document.createElement("div");
        empty.textContent = "No activity logged for today";
        
        const empty2 = document.createElement("div");
        empty2.innerHTML = `
            Log a workout, or enjoy your rest day <i class="ri-emotion-happy-fill"></i>
        `;
        
        card.addContent(empty);
        card.addContent(empty2);
        return card.root;
    }

    for (const workout of workoutRecords) {
        const icon = WORKOUT_ICONS[workout.workoutType] ?? Icons.Activity;
        const workoutDurationElement =  createTimeSpanMetricElement(workout.workoutDuration / 60);
        const restingHeartRateCard = createInnerCard(workout.workoutType, workoutDurationElement, icon); 

        const notes = document.createElement("textarea");
        notes.placeholder = "Any workout notes?";

        card.addContent(restingHeartRateCard);
    }

    return card.root;
}

function createMetricRow(metricName:string, metricValue:HTMLElement, metricIconClass:string | null = null): HTMLElement {
    const row = document.createElement("div");
    row.className = "metric-row";

    const labelContainer = document.createElement("div");
    labelContainer.className = "metric-label-container"

    const icon = document.createElement("i");
    if (metricIconClass != null)
    {
        icon.className = metricIconClass!;
        labelContainer.append(icon);
    }

    const label = document.createElement("div");
    label.className = "metric-label-text";
    label.textContent = metricName;
    labelContainer.append(label);

    row.append(labelContainer, metricValue);

    return row;
}

function createTextInputArea(placeholderText:string, metricTypeId: MetricTypeId) : HTMLElement {
    const container = document.createElement("div");
    container.className = "text-area";

    const icon = document.createElement("i");
    icon.className = Icons.EditTextField;
    container.append(icon);

    const textArea = document.createElement("textarea");
    textArea.placeholder = placeholderText;
    container.append(textArea);

    const getter:() => string = () => metricRepository.resolveMetric<string>(selectedDateKey, metricTypeId);
    const setter:(value: string) => void = value => metricRepository.userEditsStore.Set(selectedDateKey, metricTypeId, value);

    bindTextArea(
        textArea,
        getter,
        setter
    );

    return container;
}

function getSelectedDayMetric<T>(metricTypeId:MetricTypeId) : T {
    return metricRepository.resolveMetric<T>(selectedDateKey, metricTypeId);
}

// =====================================================
// Body
// =====================================================

// function createBodyCard(): HTMLElement {

//     const card = document.createElement("div");
//     card.className = "card";

//     const title = cardHeader(
//         "Body", 
//         `<path d="M8 2v4"/>
//         <path d="M16 2v4"/>
//         <rect x="3" y="4" width="18" height="18" rx="2"/>
//         <path d="M3 10h18"/>`);

//     const weight = document.createElement("div");
//     weight.textContent = `Weight: ${currentLog.weight}kg`;

//     const bodyFat = document.createElement("div");
//     bodyFat.textContent = `Body Fat: ${currentLog.bodyFatPercentage}%`;

//     card.append(
//         title,
//         weight,
//         bodyFat
//     );

//     return card;
// }

// =====================================================
// Recovery
// =====================================================

function createInnerCard(metricName:string, metricValue:HTMLElement, metricIconClass:string) : HTMLElement {
    const innerCard = document.createElement("div");
    innerCard.className = "metric-card";

    const icon = document.createElement("i");
    icon.className = metricIconClass;
    
    const name = document.createElement("div");
    name.className = "metric-label-text";
    name.textContent = metricName;

    // innerCard.append(icon, metricValue, name);
    innerCard.append(icon, name, metricValue);

    return innerCard;
}

//01:51:00
//13.933333333333334
// -> 3h 14m
function getHoursAndMinutesStrFromTime(time: number | string): string {

    let hours: number;
    let minutes: number;

    if (typeof time === "number") {
        hours = Math.floor(time);
        minutes = Math.round((time - hours) * 60);
    } else {
        const [h, m] = time.split(":").map(Number);
        hours = h;
        minutes = m;
    }

    return `${hours}h ${minutes}m`;
}

//01:51:00
//13.933333333333334
function createTimeSpanMetricElement(time: number | string): HTMLElement {
    const element = document.createElement("div");
    element.className = "metric-time-span";

    let hours: number;
    let minutes: number;

    if (typeof time === "number") {
        hours = Math.floor(time);
        minutes = Math.round((time - hours) * 60);
    } else {
        const [h, m] = time.split(":").map(Number);
        hours = h;
        minutes = m;
    }

    if (hours > 0) {
        element.append(createMetricValue(hours.toString(), "h"))
    }

    element.append(createMetricValue(minutes.toString(), "m"));

    return element;
}

function createMetricValue(value: string, unit?: string): HTMLElement {
    const element = document.createElement("div");
    element.className = "metric-value";

    element.append(document.createTextNode(value));

    if (unit) {
        const span = document.createElement("span");
        span.className = "metric-unit";
        span.textContent = ` ${unit}`;
        element.append(span);
    }

    return element;
}

function createRecoveryCard(): HTMLElement {

    const card = new Card("Recovery", Icons.Recovery) 

    const recoveryGrid = document.createElement("div");
    recoveryGrid.className = "metric-grid-3";

    // Sleep
    const sleepRecords = getSelectedDayMetric<SleepLogData[]>(MetricTypeIds.Sleep);
    const totalSleepHours = sleepRecords.reduce(
        (total, sleep) => total + sleep.sleepHours,
        0
    );
    const sleepText = createTimeSpanMetricElement(totalSleepHours);
    const sleepCard = createInnerCard("Total Sleep", sleepText, Icons.Sleep);
    
    // RHR
    const restingHeartRate = getSelectedDayMetric<number>(MetricTypeIds.RestingHeartRate);
    const restingHeartRateMetricElement = createMetricValue(restingHeartRate.toString(), 'bpm');
    const restingHeartRateCard = createInnerCard("Resting HR", restingHeartRateMetricElement, Icons.RestingHeartRate);
    
    // Steps
    const steps = getSelectedDayMetric<number>(MetricTypeIds.Steps);
    const stepsMetricElement = createMetricValue(steps.toLocaleString());
    const stepsCard = createInnerCard("Total Steps", stepsMetricElement, Icons.Steps);

    recoveryGrid.append(
        sleepCard,
        stepsCard,
        restingHeartRateCard,
    );

    card.addContent(
        recoveryGrid
    );

    return card.root;
}

// =====================================================
// Highlights
// =====================================================

// function createHighlightsSection(): HTMLElement {

//     const section = document.createElement("div");

//     const title = document.createElement("h3");
//     title.textContent = "Highlights";

//     // const highlight1 = document.createElement("div");
//     // highlight1.className = "card";
//     // highlight1.textContent = "⭐ One week until your 1-year lifting anniversary";

//     // const highlight2 = document.createElement("div");
//     // highlight2.className = "card";
//     // highlight2.textContent = "🔥 4 workout streak";

//     // const highlight3 = document.createElement("div");
//     // highlight3.className = "card";
//     // highlight3.textContent = "📉 Weight down 0.8kg this month";

//     // section.append(
//     //     title,
//     //     highlight1,
//     //     highlight2,
//     //     highlight3
//     // );

//     return section;
// }

// =====================================================
// Actions
// =====================================================

function createReportActionButtons(): HTMLElement {

    const actionButtonsCard = new Card();

    const actionButtonRow = document.createElement("div");
    actionButtonRow.className = "action-buttons-row";
    actionButtonsCard.addContent(actionButtonRow);

    if (CloudSync.isAvailable()) {
        const cloudSyncButton = new ActionButton(
            "Cloud Sync", 
            Icons.CloudSync, 
            async () => { 
                await CloudSync.sync(selectedDate);
                rerender();
                await Toast.show({
                    text: "Synced with Cloud!",
                duration: "short",
                position: "bottom",
            });
        }); 
        actionButtonRow.append(cloudSyncButton.root);
    }

    if (DeviceSync.isAvailable()) {
        const deviceSyncButton = new ActionButton(
            "Device Sync", 
            Icons.DeviceSync,
            async () => { 
                await DeviceSync.sync(selectedDate); 
                rerender(); 
                await Toast.show({
                    text: "Synced with Device!",
                    duration: "short",
                    position: "bottom",
                });
            });
        actionButtonRow.append(deviceSyncButton.root);
    }

    const extApiSyncButton = new ActionButton(
            "Ext API Sync", 
            Icons.ExtAPISync,
            async () => { 
                await ExternalAPISync.sync(selectedDate); 
                rerender(); 
                await Toast.show({
                    text: "Synced with External APIs!",
                    duration: "short",
                    position: "bottom",
                });
            });
        actionButtonRow.append(extApiSyncButton.root);
    
    const copyTextButton = new ActionButton("Copy Text", Icons.CopyText, onCopyTextClicked);
    actionButtonRow.append(copyTextButton.root);
    
    return actionButtonsCard.root;
}

// TODO: A more explicit publish prompt

// =====================================================
// Helpers
// =====================================================

function bindTextArea(
    textarea: HTMLTextAreaElement,
    getter: () => string,
    setter: (value: string) => void
) {
    textarea.value = getter();
    textarea.oninput = () => setter(textarea.value);
}

// Maybe later a cooler animation
export async function myDayPressed(this: GlobalEventHandlers) {
    if (!isToday(selectedDate))
        await transitionToDate(new Date(), "left")
}
