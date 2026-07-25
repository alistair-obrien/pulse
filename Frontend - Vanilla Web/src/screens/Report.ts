// The total height of the hero area (Partly occluded by content based on visible height)
const HERO_AREA_TOTAL_HEIGHT = 400;
// The total visible height of the hero area. Used to set the size of the header
const HERO_AREA_VISIBLE_HEIGHT = 280;

// At what scroll distance the header should start fading out
const HEADER_FADE_THRESHOLD = 50;
// How much distance the fade takes to finish
const HEADER_FADE_DIST = 10;

// At what scroll distance the date should start fading out
const DATE_FADE_THRESHOLD = 180;
// How much distance the fade takes to finish
const DATE_FADE_DIST = 20;

import "../style.css"
import "remixicon/fonts/remixicon.css";

import * as api from "../api/API";
import type { SleepLogData, WorkoutLogData } from "../models/DailyLog";
import { ToDateKey } from "../models/DateKey";
import { metricRepository } from "../models/MetricRepository";
import { getImageUrl as getRandomImageUrl } from "./RandomImage";
import { Icons } from "./Icons";
import { MetricTypeIds, type MetricTypeId } from "../models/MetricTypeIds";
import { healthConnectSync } from "./DeviceMetricsSync";
import { healthConnectAvailable } from "../platform/health-connect";
import { cloudSync } from "./CloudSync"

// =====================================================
// Helpers
// =====================================================
export interface UtcDateRange {
    startUtc: string;
    endUtc: string;
}

let syncTimer: number | null = null;
let syncing = false;

const SYNC_INTERVAL_MS = 10_000;

function startAutoSync() {
    stopAutoSync();

    const tick = async () => {
        if (isToday(selectedDate)) {
            await healthConnectSync(selectedDate);
        }

        syncTimer = window.setTimeout(tick, SYNC_INTERVAL_MS);
    };

    syncTimer = window.setTimeout(tick, SYNC_INTERVAL_MS);
}

function stopAutoSync() {
    if (syncTimer !== null) {
        clearTimeout(syncTimer);
        syncTimer = null;
    }
}

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

function isFuture(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const check = new Date(date);
    check.setHours(0, 0, 0, 0);

    return check > today;
}

function isToday(date: Date): boolean {
    const today = new Date();

    return (
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate()
    );
}

async function loadDate(date: Date) {
    selectedDate = date;
    selectedDateKey = ToDateKey(selectedDate);

    // await downloadSelectedDateFromCloud();
    // await healthConnectSync(selectedDate);
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
async function onPublishClicked() {
    await cloudSync(selectedDate);
    await api.publish(selectedDateKey);
}

async function onCopyTextClicked() {
    //TODO: 
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
        createWorkoutCard(),
        createReportActionButtons(),
    );

    const footer = createFooter();

    screenContainer.append(
        header,
        heroArea,
        content,
        footer,
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

function createActionButton(name: string, iconClass: string): HTMLButtonElement {
    const button = document.createElement("button");
    button.className = "action-button";

    const icon = document.createElement("i");
    icon.className = iconClass;

    const label = document.createElement("span");
    label.textContent = name;

    button.append(icon, label);

    return button;
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

function createFooter(): HTMLElement {
    const section = document.createElement("div");
    section.className = "footer";

    const footerInner = document.createElement("div");
    footerInner.className = "footer-inner";

    const friendsButton = createActionButton("Friends", Icons.Friends);

    const myDayButton = createActionButton("My Day", Icons.MyDay);
    myDayButton.onclick = myDayPressed;
    myDayButton.classList.add("selected")

    const meButton = createActionButton("Me", Icons.Me);

    footerInner.append(
        friendsButton,
        myDayButton,
        meButton,
    );

    section.append(footerInner);

    return section;
}

// =====================================================
// Reflection
// =====================================================

function createReflectionCard(): HTMLElement {

    const card = document.createElement("div");
    card.className = "card"
    // card.className = "card image-card";
    // card.style.setProperty(
    //     "--reflection-image",
    //     `url(${getImageUrl()})`
    // );    
    
    // card.style.minHeight = '300px';

    const title = cardHeader(
        "Reflections", 
        `<path d="M4.7134 7.12811L4.46682 7.69379C4.28637 8.10792 3.71357 8.10792 3.53312 7.69379L3.28656 7.12811C2.84706 6.11947 2.05545 5.31641 1.06767 4.87708L0.308047 4.53922C-0.102682 4.35653 -0.102682 3.75881 0.308047 3.57612L1.0252 3.25714C2.03838 2.80651 2.84417 1.97373 3.27612 0.930828L3.52932 0.319534C3.70578 -0.106511 4.29417 -0.106511 4.47063 0.319534L4.72382 0.930828C5.15577 1.97373 5.96158 2.80651 6.9748 3.25714L7.69188 3.57612C8.10271 3.75881 8.10271 4.35653 7.69188 4.53922L6.93228 4.87708C5.94451 5.31641 5.15288 6.11947 4.7134 7.12811ZM3.06361 21.6132C4.08854 15.422 6.31105 1.99658 21 1.99658C19.5042 4.99658 18.5 6.49658 17.5 7.49658L16.5 8.49658L18 9.49658C17 12.4966 14 15.9966 10 16.4966C7.33146 16.8301 5.66421 18.6635 4.99824 21.9966H3C3.02074 21.8722 3.0419 21.7443 3.06361 21.6132Z"></path>`
        );

    // const textarea = document.createElement("textarea");
    // textarea.placeholder = "How did today go?";

    const textArea = createTextInputArea("...what did you achieve today?", MetricTypeIds.Reflection);
      

    card.append(
        title,
        textArea
    );

    return card;
}

// =====================================================
// Nutrition
// =====================================================

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

    const getter:() => string = () => metricRepository.resolveMetric<string>(selectedDateKey, metricTypeId, "");
    const setter:(value: string) => void = value => metricRepository.userEditsStore.Set(selectedDateKey, metricTypeId, value);

    bindTextArea(
        textArea,
        getter,
        setter
    );

    return container;
}

function getSelectedDayMetric<T>(metricTypeId:MetricTypeId, defaultValue:T) : T {
    return metricRepository.resolveMetric<T>(selectedDateKey, metricTypeId, defaultValue);
}

function createNutritionCard(): HTMLElement {

    const card = document.createElement("div");
    card.className = "card";

    const title = cardHeader(
        "Nutrition", 
        `<path d="M4.22235 3.80753L10.9399 10.525L8.11144 13.3535L4.22235 9.46438C2.66026 7.90229 2.66026 5.36963 4.22235 3.80753ZM14.2683 12.1464L13.4147 12.9999L20.4858 20.071L19.0716 21.4852L12.0005 14.4141L4.92946 21.4852L3.51525 20.071L12.854 10.7322C12.2664 9.27525 12.8738 7.1769 14.4754 5.5753C16.428 3.62268 19.119 3.1478 20.4858 4.51464C21.8526 5.88147 21.3778 8.57242 19.4251 10.525C17.8235 12.1267 15.7252 12.7341 14.2683 12.1464Z"></path>`);

    const nutritionlist = document.createElement("div");
    nutritionlist.className = "metric-list";

    const calories = Math.round(getSelectedDayMetric<number>(MetricTypeIds.Nutrition_Calories, 0));
    const caloriesElement = createMetricValue(calories.toString(), 'kcal');
    const caloriesCard = createMetricRow("Calories", caloriesElement);
    
    const protein = Math.round(getSelectedDayMetric<number>(MetricTypeIds.Nutrition_Protein, 0));
    const proteinElement = createMetricValue(protein.toString(), 'g');
    const proteinCard = createMetricRow("Protein", proteinElement);
    
    const carbs = Math.round(getSelectedDayMetric<number>(MetricTypeIds.Nutrition_Carbs, 0));
    const carbsElement = createMetricValue(carbs.toString(), 'g');
    const carbsCard = createMetricRow("Carbs", carbsElement);

    const fat = Math.round(getSelectedDayMetric<number>(MetricTypeIds.Nutrition_Fat, 0));
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

    card.append(
        title,
        nutritionlist,
        textArea
    );

    return card;
}

// =====================================================
// Workout
// =====================================================

function createWorkoutCard(): HTMLElement {

    const card = document.createElement("div");
    card.className = "card";

    const title = cardHeader(
        "Activity", 
        `<path d="M16.5 3C19.5376 3 22 5.5 22 9C22 16 14.5 20 12 21.5C10.0224 20.3135 4.91625 17.5626 2.8685 13L7.56619 13L8.5 11.4437L11.5 16.4437L13.5662 13H17V11H12.4338L11.5 12.5563L8.5 7.55635L6.43381 11L2.21024 10.9999C2.07418 10.3626 2 9.69615 2 9C2 5.5 4.5 3 7.5 3C9.35997 3 11 4 12 5C13 4 14.64 3 16.5 3Z"></path>`
    );

    card.append(title);

    const workoutRecords = getSelectedDayMetric<WorkoutLogData[]>(MetricTypeIds.Workouts, []);

    if (workoutRecords.length === 0) {
        const empty = document.createElement("div");
        empty.textContent = "No activity logged for today";
        
        const empty2 = document.createElement("div");
        empty2.innerHTML = `
            Log a workout, or enjoy your rest day <i class="ri-emotion-happy-fill"></i>
        `;
        
        card.append(empty, empty2);
        return card;
    }

    for (const workout of workoutRecords) {

        const workoutCard = document.createElement("div");

        const workoutTitle = document.createElement("div");
        workoutTitle.textContent = workout.workoutName;
        workoutCard.append(workoutTitle);

        const workoutlist = document.createElement("div");
        workoutlist.className = "metric-list";

        workoutCard.append(workoutlist);

        const workoutDurationElement =  createTimeSpanMetricElement(workout.workoutDuration);
        //  createMetricValue(currentLog.nutrition.calories.toString(), 'kcal');
        const durationRow = createMetricRow("Duration", workoutDurationElement);
        
        const volumeElement = createMetricValue(workout.workoutVolume.toString(), 'kg');
        const volumeCard = createMetricRow("Volume", volumeElement);

        workoutlist.append(
            durationRow,
            volumeCard,
        );

        const notes = document.createElement("textarea");
        notes.placeholder = "Any workout notes?";

        // bindTextArea(
        //     notes,
        //     () => currentLog.nutrition.nutritionNotes,
        //     value => currentLog.nutrition.nutritionNotes = value
        // );

        // const section = document.createElement("div");
        // section.className = "workout";

        // const name = document.createElement("h4");
        // name.textContent = workout.workoutName;



        // const duration = document.createElement("div");
        // duration.textContent =
        //     `Duration: ${workout.workoutDuration}`;

        // const volume = document.createElement("div");
        // volume.textContent =
        //     `Volume: ${workout.workoutVolume.toLocaleString()} kg`;

        // const prs = document.createElement("div");
        // prs.textContent =
        //     `PRs: ${workout.personalRecords}`;

        // const notes = document.createElement("textarea");
        // notes.placeholder = "How did the workout go?";

        // bindTextArea(
        //     notes,
        //     () => workout.workoutNotes,
        //     value => workout.workoutNotes = value
        // );

        // section.append(
        //     name,
        //     duration,
        //     volume,
        //     prs,
        //     notes
        // );

        card.append(workoutCard);
    }

    return card;
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

function cardHeader(text:string, iconPath:string): HTMLElement {
    const header = document.createElement("h3");

    header.innerHTML = 
    `<span class="header-content">
        <svg viewBox="0 0 24 24" fill="currentColor"> ${iconPath}</svg>
        <span>${text}</span>
    </span>`;

    return header;
}

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

    element.append(
        createMetricValue(hours.toString(), "h"),
        createMetricValue(minutes.toString(), "m")
    );

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

    const card = document.createElement("div");
    card.className = "card";

    const title = cardHeader(
        "Recovery", 
        `<path d="M21.998 7V9.5C21.998 13.0899 19.0879 16 15.498 16H12.998V21H10.998V14L11.0169 13.0007C11.2719 9.64413 14.0762 7 17.498 7H21.998ZM5.99805 3C9.0904 3 11.7144 5.00519 12.6408 7.78626C11.1417 9.06119 10.1516 10.9143 10.0144 13.0004L8.99805 13C5.13205 13 1.99805 9.86599 1.99805 6V3H5.99805Z"></path>`);

    const recoveryGrid = document.createElement("div");
    recoveryGrid.className = "metric-grid-3";

    // Sleep
    const sleepRecords = getSelectedDayMetric<SleepLogData[]>(MetricTypeIds.Sleep, []);
    const totalSleepHours = sleepRecords.reduce(
        (total, sleep) => total + sleep.sleepHours,
        0
    );
    const sleepText = createTimeSpanMetricElement(totalSleepHours);
    const sleepCard = createInnerCard("Total Sleep", sleepText, Icons.Sleep);
    
    // RHR
    const restingHeartRate = getSelectedDayMetric<number>(MetricTypeIds.RestingHeartRate, 0);
    const restingHeartRateMetricElement = createMetricValue(restingHeartRate.toString(), 'bpm');
    const restingHeartRateCard = createInnerCard("Resting HR", restingHeartRateMetricElement, Icons.RestingHeartRate);
    
    // Steps
    const steps = getSelectedDayMetric<number>(MetricTypeIds.Steps, 0);
    const stepsMetricElement = createMetricValue(steps.toLocaleString());
    const stepsCard = createInnerCard("Total Steps", stepsMetricElement, Icons.Steps);

    recoveryGrid.append(
        sleepCard,
        stepsCard,
        restingHeartRateCard,
    );

    card.append(
        title,
        recoveryGrid
    );

    return card;
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

    const actionButtonsCard = document.createElement("div");
    actionButtonsCard.className = "card";

    const actionButtonRow = document.createElement("div");
    actionButtonRow.className = "action-buttons-row";

    const cloudSyncButton = createActionButton("Cloud Sync", Icons.CloudSync); 
    cloudSyncButton.onclick = async () => { 
        await cloudSync(selectedDate); 
        rerender(); 
    }

    const deviceSync = createActionButton("Device Sync", Icons.DeviceSync);
    deviceSync.onclick = async () => { 
        await healthConnectSync(selectedDate); 
        rerender(); 
    }

    // const publishToServerButton = createActionButton("Publish", Icons.PublishToServer);
    // publishToServerButton.onclick = onPublishClicked;

    const copyTextButton = createActionButton("Copy Text", Icons.CopyText);
    copyTextButton.onclick = onCopyTextClicked;

    actionButtonRow.append(
        cloudSyncButton,
        deviceSync,
        copyTextButton
    );

    if (!healthConnectAvailable) { 
        deviceSync.remove();
    }

    actionButtonsCard.append(actionButtonRow);

    return actionButtonsCard;
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
async function myDayPressed(this: GlobalEventHandlers, ev: PointerEvent) {
    if (!isToday(selectedDate))
        await transitionToDate(new Date(), "left")
}