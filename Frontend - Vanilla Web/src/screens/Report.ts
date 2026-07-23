import * as dailyLogs from "../api/dailyLogs";
import type { DailyLogData } from "../models/DailyLog";

// =====================================================
// State
// =====================================================

let selectedDate = new Date();

let currentLog!: DailyLogData;
let currentId!: number;

let root!: HTMLElement;

// =====================================================
// Mounting
// =====================================================

export async function mount(container: HTMLElement) {
    root = container;

    const response = await dailyLogs.getByDate(
        selectedDate.toISOString().substring(0, 10)
    );

    if (response == null) {

        const created = await dailyLogs.create(createEmptyLog(selectedDate));

        currentId = created.id;
        currentLog = created;

        return;
    }

    currentId = response.id;
    currentLog = response;
    rerender();
}

export function rerender() {
    root.replaceChildren(render());
}

function createEmptyLog(date: Date): DailyLogData {
    return {
        date: date.toISOString().substring(0, 10),
        isPublished: false,
        reflection: "",

        sleeps: [],

        nutrition: {
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            nutritionNotes: ""
        },

        workouts: [],

        weight: 0,
        bodyFatPercentage: 0,

        restingHeartRate: 0,
        steps: 0,

        sharePublicly: false
    };
}

// =====================================================
// Actions
// =====================================================

async function onImportClicked() {
    currentLog = await dailyLogs.importLog(currentId);
    rerender();
}

async function onSaveClicked() {
    currentLog = await dailyLogs.update(currentId, currentLog);
    rerender();
}

async function onPublishClicked() {
    currentLog = await dailyLogs.update(currentId, currentLog);
    currentLog = await dailyLogs.publish(currentId);
    rerender();
}

// =====================================================
// Rendering
// =====================================================

export function render(): HTMLElement {

    const screen = document.createElement("div");
    screen.className = "report-screen";

    // // If its already published we show something else maybe
    // if (currentLog.isPublished) {
    //     screen.append(
    //         createHeader(),
    //         // TODO: Show the report
    //         createActions()
    //     );
    // }
    // else
    {
        screen.append(
            createHeader(),

            createReflectionCard(),
            createSleepCard(),
            createNutritionCard(),
            createWorkoutCard(),
            createBodyCard(),
            createRecoveryCard(),
            createHighlightsSection(),
            createActions()
        );
    }



    return screen;
}

// =====================================================
// Header
// =====================================================

function createHeader(): HTMLElement {

    const section = document.createElement("div");

    const date = document.createElement("h3");
    date.textContent = "📅 Wednesday 22 July";

    const title = document.createElement("h2");
    title.textContent = "Close Today";

    section.append(
        date,
        title
    );

    return section;
}

// =====================================================
// Reflection
// =====================================================

function createReflectionCard(): HTMLElement {

    const section = document.createElement("div");

    const title = document.createElement("h3");
    title.textContent = "Reflection";

    const textarea = document.createElement("textarea");
    textarea.placeholder = "How did today go?";

    bindTextArea(
        textarea,
        () => currentLog.reflection,
        value => currentLog.reflection = value
    );

    section.append(
        title,
        textarea
    );

    return section;
}

// =====================================================
// Sleep
// =====================================================

function createSleepCard(): HTMLElement {

    const card = document.createElement("div");
    card.className = "card";

    const title = document.createElement("h3");
    title.textContent = "😴 Sleep";

    const duration = document.createElement("div");
    duration.textContent = "7h 42m";

    const notes = document.createElement("textarea");
    notes.placeholder = "How did you sleep?";

    card.append(
        title,
        duration,
        notes
    );

    return card;
}

// =====================================================
// Nutrition
// =====================================================

function createNutritionCard(): HTMLElement {

    const card = document.createElement("div");
    card.className = "card";

    const title = document.createElement("h3");
    title.textContent = "🥩 Nutrition";

    const calories = document.createElement("div");
    calories.textContent = "Calories: 2596";

    const protein = document.createElement("div");
    protein.textContent = "Protein: 182g";

    const carbs = document.createElement("div");
    carbs.textContent = "Carbs: 292g";

    const fat = document.createElement("div");
    fat.textContent = "Fat: 78g";

    const notes = document.createElement("textarea");
    notes.placeholder = "Any nutrition notes?";

    bindTextArea(
        notes,
        () => currentLog.nutrition.nutritionNotes,
        value => currentLog.nutrition.nutritionNotes = value
    );

    card.append(
        title,
        calories,
        protein,
        carbs,
        fat,
        notes
    );

    return card;
}

// =====================================================
// Workout
// =====================================================

function createWorkoutCard(): HTMLElement {

    const card = document.createElement("div");
    card.className = "card";

    const title = document.createElement("h3");
    title.textContent = "💪 Workout";

    card.append(title);

    if (currentLog.workouts.length === 0) {
        const empty = document.createElement("div");
        empty.textContent = "No workouts";
        card.append(empty);
        return card;
    }

    for (const workout of currentLog.workouts) {

        const section = document.createElement("div");
        section.className = "workout";

        const name = document.createElement("h4");
        name.textContent = workout.workoutName;

        const duration = document.createElement("div");
        duration.textContent =
            `Duration: ${workout.workoutDuration}`;

        const volume = document.createElement("div");
        volume.textContent =
            `Volume: ${workout.workoutVolume.toLocaleString()} kg`;

        const prs = document.createElement("div");
        prs.textContent =
            `PRs: ${workout.personalRecords}`;

        const notes = document.createElement("textarea");
        notes.placeholder = "How did the workout go?";

        bindTextArea(
            notes,
            () => workout.workoutNotes,
            value => workout.workoutNotes = value
        );

        section.append(
            name,
            duration,
            volume,
            prs,
            notes
        );

        card.append(section);
    }

    return card;
}

// =====================================================
// Body
// =====================================================

function createBodyCard(): HTMLElement {

    const card = document.createElement("div");
    card.className = "card";

    const title = document.createElement("h3");
    title.textContent = "⚖ Body";

    const weight = document.createElement("div");
    weight.textContent = "Weight: 79.8kg";

    const bodyFat = document.createElement("div");
    bodyFat.textContent = "Body Fat: 18.6%";

    card.append(
        title,
        weight,
        bodyFat
    );

    return card;
}

// =====================================================
// Recovery
// =====================================================

function createRecoveryCard(): HTMLElement {

    const card = document.createElement("div");
    card.className = "card";

    const title = document.createElement("h3");
    title.textContent = "❤️ Recovery";

    const restingHr = document.createElement("div");
    restingHr.textContent = "Resting HR: 54";

    const steps = document.createElement("div");
    steps.textContent = "Steps: 12,345";

    card.append(
        title,
        restingHr,
        steps
    );

    return card;
}

// =====================================================
// Highlights
// =====================================================

function createHighlightsSection(): HTMLElement {

    const section = document.createElement("div");

    const title = document.createElement("h3");
    title.textContent = "Highlights";

    const highlight1 = document.createElement("div");
    highlight1.className = "card";
    highlight1.textContent = "⭐ One week until your 1-year lifting anniversary";

    const highlight2 = document.createElement("div");
    highlight2.className = "card";
    highlight2.textContent = "🔥 4 workout streak";

    const highlight3 = document.createElement("div");
    highlight3.className = "card";
    highlight3.textContent = "📉 Weight down 0.8kg this month";

    section.append(
        title,
        highlight1,
        highlight2,
        highlight3
    );

    return section;
}

// =====================================================
// Actions
// =====================================================

function createActions(): HTMLElement {

    const actions = document.createElement("div");

    const importButton = document.createElement("button");
    importButton.textContent = "Import";
    importButton.onclick = onImportClicked;

    const saveButton = document.createElement("button");
    saveButton.textContent = "Save Changes";
    saveButton.onclick = onSaveClicked;

    const shareLabel = document.createElement("label");

    const sharePublicly = document.createElement("input");
    sharePublicly.type = "checkbox";
    sharePublicly.checked = currentLog.sharePublicly;
    sharePublicly.onchange = () => {
        currentLog.sharePublicly = sharePublicly.checked;
    };

    shareLabel.append(
        sharePublicly,
        " Share publicly"
    );

    const publishButton = document.createElement("button");
    publishButton.textContent = "Publish Report";
    publishButton.onclick = onPublishClicked;

    actions.append(
        importButton,
        saveButton,
        shareLabel,
        publishButton
    );

    return actions;
}

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