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
import { ToDateKey } from "../../data-store/DateKey";
import { ICONS } from "../components/ICONS";
import { MetricTypeIds, type MetricTypeId, type MetricTypes } from "../../models/MetricRegistry";

import * as MetricRepositoryController from "../../controllers/MetricRepositoryController";
import * as RandomImageController from "../../controllers/RandomImageController";
import * as DeviceSyncController from "../../controllers/DeviceMetricsSyncController";
import * as CloudSyncController from "../../controllers/CloudSyncController"
import * as ExternalAPISyncController from "../../controllers/ExternalAPISyncController"
import * as JourneyController from "../../controllers/JourneyController"


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

// function enableDaySwipe(element: HTMLElement) {
//     let startX = 0;
//     let startY = 0;

//     element.addEventListener("touchstart", e => {
//         const touch = e.touches[0];
//         startX = touch.clientX;
//         startY = touch.clientY;
//     }, { passive: true });

//     element.addEventListener("touchend", e => {
//         const touch = e.changedTouches[0];

//         const dx = touch.clientX - startX;
//         const dy = touch.clientY - startY;

//         // Ignore mostly vertical swipes
//         if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy))
//             return;

//         const nextDate = new Date(selectedDate);

//         if (dx < 0) {
//             // Swipe left -> next day
//             nextDate.setDate(nextDate.getDate() + 1);

//             if (!isFuture(nextDate)) {
//                 transitionToDate(nextDate, "left")
//             }
//         }
//         else {
//             // Swipe right -> previous day
//             nextDate.setDate(nextDate.getDate() - 1);
//             transitionToDate(nextDate, "right")

//         }
//     }, { passive: true });
// }

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

    // enableDaySwipe(container);
    // startAutoSync();
}

export function rerender() {
    root.replaceChildren(render());
}

async function loadDate(date: Date) {
    selectedDate = date;
    selectedDateKey = ToDateKey(selectedDate);

    if (DeviceSyncController.isAvailable()) { await DeviceSyncController.sync(date); }
    if (CloudSyncController.isAvailable()) { await CloudSyncController.sync(date); } 
    void ExternalAPISyncController.sync(date);
}

// let animating:boolean  = false
async function transitionToDate(date: Date, direction: "left" | "right") {

    void direction;
    await loadDate(date);
    rerender();

    // if (animating) { return; }
    // animating = true;

    // const oldPage = root.firstElementChild as HTMLElement | null;

    // await loadDate(date);

    // const newPage = render();

    // if (!oldPage) {
    //     root.replaceChildren(newPage);
    //     return;
    // }

    // root.insertBefore(newPage, root.firstChild);

    // if (direction === "right") {
    //     oldPage.classList.add("disappear");
    //     newPage.classList.add("slide-in-right");
    // } else {
    //     oldPage.classList.add("disappear");
    //     newPage.classList.add("slide-in-left");
    // }

    // await Promise.all([
    //     waitForAnimation(oldPage),
    //     waitForAnimation(newPage)
    // ]);

    // oldPage.remove();

    // newPage.classList.remove(
    //     "disappear",
    //     "appear",
    //     "slide-in-left",
    //     "slide-in-right"
    // );

    // animating = false;
}

// function waitForAnimation(element: HTMLElement): Promise<void> {
//     return new Promise(resolve => {
//         element.addEventListener("animationend", () => resolve(), {
//             once: true
//         });
//     });
// }

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
import { Card, CardHeader } from "../components/Card";
import { isFuture, isToday } from "../../controllers/DateTimeController";
import { MetricCard, MetricRow, MetricText, MetricTextInputField, TimeSpan } from "../components/JourneyStepCard";
import { WORKOUT_ICONS } from "../components/WORKOUT_ICONS";
async function onCopyTextClicked() {

    const sleepRecords = getSelectedDayMetric(MetricTypeIds.Sleep);
    const totalSleepHours = sleepRecords.reduce(
        (total, sleep) => total + sleep.sleepHours,
        0
    );
    const sleepText = getHoursAndMinutesStrFromTime(totalSleepHours);

    const calories = Math.round(getSelectedDayMetric(MetricTypeIds.Nutrition_Calories));
    const protein = Math.round(getSelectedDayMetric(MetricTypeIds.Nutrition_Protein));
    const carbs = Math.round(getSelectedDayMetric(MetricTypeIds.Nutrition_Carbs));
    const fat = Math.round(getSelectedDayMetric(MetricTypeIds.Nutrition_Fat));
    const nutritionNotes = getSelectedDayMetric(MetricTypeIds.Nutrition_Notes);

    const reflectionNotes = getSelectedDayMetric(MetricTypeIds.Reflection);

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

    screenContainer.append(
        header,
        heroArea,
        content,
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
    
    heroImage.src = RandomImageController.getImageUrl(selectedDate.getDay());
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

    const card = new Card(); 
    const header = new CardHeader("Reflections", ICONS.Reflection);

    const textArea = new MetricTextInputField(
        "...what did you achieve today?", 
        MetricTypeIds.Reflection,
        selectedDateKey
    );


    card.append(
        header.root,
        textArea.root
    );

    return card.root;
}

// =====================================================
// Nutrition
// =====================================================

function createNutritionCard(): HTMLElement {

    const card = new Card(); 
    const header = new CardHeader("Nutrition", ICONS.Nutrition);

    const nutritionlist = document.createElement("div");
    nutritionlist.className = "metric-list";

    const calories = Math.round(getSelectedDayMetric(MetricTypeIds.Nutrition_Calories));
    const caloriesElement = new MetricText(calories.toString(), 'kcal');
    const caloriesCard = new MetricRow("Calories", caloriesElement.root);
    
    const protein = Math.round(getSelectedDayMetric(MetricTypeIds.Nutrition_Protein));
    const proteinElement = new MetricText(protein.toString(), 'g');
    const proteinCard = new MetricRow("Protein", proteinElement.root);
    
    const carbs = Math.round(getSelectedDayMetric(MetricTypeIds.Nutrition_Carbs));
    const carbsElement = new MetricText(carbs.toString(), 'g');
    const carbsCard = new MetricRow("Carbs", carbsElement.root);

    const fat = Math.round(getSelectedDayMetric(MetricTypeIds.Nutrition_Fat));
    const fatElement = new MetricText(fat.toString(), 'g');
    const fatCard = new MetricRow("Fat", fatElement.root);

    nutritionlist.append(
        caloriesCard.root,
        proteinCard.root,
        carbsCard.root,
        fatCard.root
    );

    const textArea = new MetricTextInputField(
        "...how were your meals?",
        MetricTypeIds.Nutrition_Notes,
        selectedDateKey
    );

    card.append(
        header.root,
        nutritionlist,
        textArea.root,
    );

    return card.root;
}

function createActivityCard(): HTMLElement {

    const card = new Card(); 
    const header = new CardHeader("Activity", ICONS.Activity);

    card.append(header.root);

    const workoutRecords = getSelectedDayMetric(MetricTypeIds.Workouts);

    if (workoutRecords.length === 0) {
        const empty = document.createElement("div");
        empty.textContent = "No activity logged for today";
        
        const empty2 = document.createElement("div");
        empty2.innerHTML = `
            Log a workout, or enjoy your rest day <i class="ri-emotion-happy-fill"></i>
        `;
        
        card.append(empty);
        card.append(empty2);
        return card.root;
    }

    const row = document.createElement("div");
    row.className = "metric-grid-3";
    card.append(row);
    for (const workout of workoutRecords) {
        const icon = WORKOUT_ICONS[workout.workoutType] ?? ICONS.Activity;
        const workoutDurationElement =  new TimeSpan(workout.workoutDuration / 60);
        const workoutCard = new MetricCard(workout.workoutType, workoutDurationElement.root, icon); 
        row.append(workoutCard.root);

        const notes = document.createElement("textarea");
        notes.placeholder = "Any workout notes?";
    }

    return card.root;
}

function getSelectedDayMetric<K extends MetricTypeId>(
    metricTypeId: K
): MetricTypes[K] {
    return MetricRepositoryController.metricRepository.resolveMetric(selectedDateKey, metricTypeId);
}

// =====================================================
// Recovery
// =====================================================



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

function createRecoveryCard(): HTMLElement {

    const card = new Card(); 
    const header = new CardHeader("Recovery", ICONS.Recovery) ;

    const recoveryGrid = document.createElement("div");
    recoveryGrid.className = "metric-grid-3";

    // Sleep
    const sleepRecords = getSelectedDayMetric(MetricTypeIds.Sleep);
    const totalSleepHours = sleepRecords.reduce(
        (total, sleep) => total + sleep.sleepHours,
        0
    );
    
    const sleepText = new TimeSpan(totalSleepHours);
    const sleepCard = new MetricCard("Total Sleep", sleepText.root, ICONS.Sleep) 
    
    // RHR
    const restingHeartRate = getSelectedDayMetric(MetricTypeIds.RestingHeartRate);
    const restingHeartRateMetricElement = new MetricText(restingHeartRate.toString(), 'bpm');
    const restingHeartRateCard = new MetricCard("Resting HR", restingHeartRateMetricElement.root, ICONS.RestingHeartRate);
    
    // Steps
    const steps = getSelectedDayMetric(MetricTypeIds.Steps);
    const stepsMetricElement = new MetricText(steps.toLocaleString());
    const stepsCard = new MetricCard("Total Steps", stepsMetricElement.root, ICONS.Steps);

    recoveryGrid.append(
        sleepCard.root,
        stepsCard.root,
        restingHeartRateCard.root,
    );

    card.append(
        header.root,
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
    actionButtonsCard.append(actionButtonRow);

    if (CloudSyncController.isAvailable()) {
        const cloudSyncButton = new ActionButton(
            "Cloud Sync", 
            ICONS.CloudSync, 
            async () => { 
                await CloudSyncController.sync(selectedDate);
                rerender();
                await Toast.show({
                    text: "Synced with Cloud!",
                duration: "short",
                position: "bottom",
            });
        }); 
        actionButtonRow.append(cloudSyncButton.root);
    }

    if (DeviceSyncController.isAvailable()) {
        const deviceSyncButton = new ActionButton(
            "Device Sync", 
            ICONS.DeviceSync,
            async () => { 
                await DeviceSyncController.sync(selectedDate); 
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
            ICONS.ExtAPISync,
            async () => { 
                await ExternalAPISyncController.sync(selectedDate); 
                rerender(); 
                await Toast.show({
                    text: "Synced with External APIs!",
                    duration: "short",
                    position: "bottom",
                });
            });
        actionButtonRow.append(extApiSyncButton.root);
    
    const publishButton = new ActionButton(
            "Share Journey Step", 
            ICONS.PublishToServer,
            async () => { 
                await JourneyController.publish(selectedDate); 
                rerender(); 
                await Toast.show({
                    text: "Synced with External APIs!",
                    duration: "short",
                    position: "bottom",
                });
            });
        actionButtonRow.append(publishButton.root);

    const copyTextButton = new ActionButton("Copy Text", ICONS.CopyText, onCopyTextClicked);
    actionButtonRow.append(copyTextButton.root);
    
    return actionButtonsCard.root;
}

// TODO: A more explicit publish prompt

// =====================================================
// Helpers
// =====================================================



// Maybe later a cooler animation
export async function myDayPressed(this: GlobalEventHandlers) {
    if (!isToday(selectedDate))
        await transitionToDate(new Date(), "left")
}
