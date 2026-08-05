// Styles
import "../styles/main.css"
import "remixicon/fonts/remixicon.css";

// Components
import { Component, ComponentModel } from "../components/Component";
import { Div} from "../components/Div";
import { Card, CardModel } from "../components/Card";
import { MyDayHeader, MyDayHeaderModel } from "../components/MyDayHeader";
import { HeroArea, HeroAreaModel } from "../components/HeroArea";

// Utils
import * as DateUtils from "../../utils/DateUtils";

export class MyDayScreenModel extends ComponentModel<MyDayScreen> {
    readonly component = MyDayScreen;

    heroAreaVisibleHeight:number;
    heroAreaTotalHeight:number;
    selectedDate:Date; // TODO: Lets make this obsolete and stick to date keys?
    selectedDateKey:DateUtils.DateKey;
    headerModel:MyDayHeaderModel;
    heroAreaModel:HeroAreaModel;
    metricSectionCardModels: CardModel[];
    myDayActionsModel:CardModel;

    constructor(args: {
        heroAreaVisibleHeight:number;
        heroAreaTotalHeight:number;
        selectedDate:Date;
        selectedDateKey:DateUtils.DateKey;
        headerModel:MyDayHeaderModel;
        heroAreaModel: HeroAreaModel;
        metricSectionCardModels: CardModel[];
        myDayActionsModel:CardModel;
    }) {
        super();

        this.heroAreaVisibleHeight = args.heroAreaVisibleHeight;
        this.heroAreaTotalHeight = args.heroAreaTotalHeight;
        this.selectedDate = args.selectedDate;
        this.selectedDateKey = args.selectedDateKey;
        this.headerModel = args.headerModel;
        this.heroAreaModel = args.heroAreaModel;
        this.metricSectionCardModels = args.metricSectionCardModels;
        this.myDayActionsModel  = args.myDayActionsModel;
    }
}

export class MyDayScreen extends Component<MyDayScreenModel> {
        
    private readonly header: MyDayHeader;
    
    private readonly heroArea: HeroArea;
    private readonly heroSpacer: Div;
    
    private readonly content: Div;
    
    private readonly metricSectionCardsContainer:Div;
    private readonly metricSectionCards:Card[];

    private readonly myDayActionsCard: Card;

    constructor() {
        super();

        // The screen container that holds the whole composition
        this.root.className = "screen-container";
        
        // The content inside the screen
        this.content = new Div();
        this.content.className = "content";
        
        // The header and hero area
        this.header = new MyDayHeader();
        this.header.setContentRoot(this.content);
        
        this.heroArea = new HeroArea();
        this.heroArea.setContentRoot(this.content);
        
        this.heroSpacer = new Div();
        this.heroSpacer.className = "hero-spacer";

        this.metricSectionCards = [];

        this.myDayActionsCard = new Card();

        this.metricSectionCardsContainer = new Div();
        this.metricSectionCardsContainer.className = "metric-cards-section";

        this.content.append(
            this.heroSpacer,
            this.metricSectionCardsContainer,
            this.myDayActionsCard
        );

        this.root.append(
            this.header.root,
            this.heroArea.root,
            this.content.root,
        );

        // enableDaySwipe(container);
        // startAutoSync();
    }

    protected render(): void {
        this.root.style.setProperty('--hero-area-visible-height', `${this.model.heroAreaVisibleHeight}px`);
        this.root.style.setProperty('--hero-area-total-height', `${this.model.heroAreaTotalHeight}px`);

        this.header.update(this.model.headerModel);

        this.heroArea.update(this.model.heroAreaModel);

        // Create missing cards
        while (this.metricSectionCards.length < this.model.metricSectionCardModels.length) {
            const card = new Card();
            this.metricSectionCards.push(card);
            this.metricSectionCardsContainer.append(card);
        }

        // Remove extra cards
        while (this.metricSectionCards.length > this.model.metricSectionCardModels.length) {
            const card = this.metricSectionCards.pop()!;
            card.root.remove();
        }

        // Update existing cards
        this.metricSectionCards.forEach((card, i) => {
            card.update(this.model.metricSectionCardModels[i]);
        });

        this.myDayActionsCard.update(this.model.myDayActionsModel);
    }
}







// Le graveyard

// import { App } from '@capacitor/app';

// App.addListener('resume', async () => {

//     if (DeviceSync.isAvailable()) { 
//         await DeviceSync.sync(selectedDate);
//     }

//     await CloudSync.cloudSync(selectedDate);
// });



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

    // =====================================================
    // Reflection
    // =====================================================

    // createReflectionCard(): HTMLElement {

    //     const card = new Card(); 
    //     const header = new CardHeader("Reflections", ICONS.Reflection);

    //     const textArea = new MetricTextInputField(
    //         "...what did you achieve today?", 
    //         MetricTypeIds.Reflection,
    //         this.model.selectedDateKey
    //     );


    //     card.append(
    //         header.root,
    //         textArea.root
    //     );

    //     return card.root;
    // }

    // =====================================================
    // Nutrition
    // =====================================================

    // createNutritionCard(): HTMLElement {

    //     const card = new Card(); 
    //     const header = new CardHeader("Nutrition", ICONS.Nutrition);

    //     const nutritionlist = document.createElement("div");
    //     nutritionlist.className = "metric-list";

    //     const calories = Math.round(this.getSelectedDayMetric(MetricTypeIds.Nutrition_Calories));
    //     const caloriesElement = new MetricText(calories.toString(), 'kcal');
    //     const caloriesCard = new MetricRow("Calories", caloriesElement.root);
        
    //     const protein = Math.round(this.getSelectedDayMetric(MetricTypeIds.Nutrition_Protein));
    //     const proteinElement = new MetricText(protein.toString(), 'g');
    //     const proteinCard = new MetricRow("Protein", proteinElement.root);
        
    //     const carbs = Math.round(this.getSelectedDayMetric(MetricTypeIds.Nutrition_Carbs));
    //     const carbsElement = new MetricText(carbs.toString(), 'g');
    //     const carbsCard = new MetricRow("Carbs", carbsElement.root);

    //     const fat = Math.round(this.getSelectedDayMetric(MetricTypeIds.Nutrition_Fat));
    //     const fatElement = new MetricText(fat.toString(), 'g');
    //     const fatCard = new MetricRow("Fat", fatElement.root);

    //     nutritionlist.append(
    //         caloriesCard.root,
    //         proteinCard.root,
    //         carbsCard.root,
    //         fatCard.root
    //     );

    //     const textArea = new MetricTextInputField(
    //         "...how were your meals?",
    //         MetricTypeIds.Nutrition_Notes,
    //         this.model.selectedDateKey
    //     );

    //     card.append(
    //         header.root,
    //         nutritionlist,
    //         textArea.root,
    //     );

    //     return card.root;
    // }

    // createActivityCard(): HTMLElement {

    //     const card = new Card(); 
    //     const header = new CardHeader("Activity", ICONS.Activity);

    //     card.append(header.root);

    //     const workoutRecords = this.getSelectedDayMetric(MetricTypeIds.Workouts);

    //     if (workoutRecords.length === 0) {
    //         const empty = document.createElement("div");
    //         empty.textContent = "No activity logged for today";
            
    //         const empty2 = document.createElement("div");
    //         empty2.innerHTML = `
    //             Log a workout, or enjoy your rest day <i class="ri-emotion-happy-fill"></i>
    //         `;
            
    //         card.append(empty);
    //         card.append(empty2);
    //         return card.root;
    //     }

    //     const row = document.createElement("div");
    //     row.className = "metric-grid-3";
    //     card.append(row);
    //     for (const workout of workoutRecords) {
    //         const icon = WORKOUT_ICONS[workout.workoutType] ?? ICONS.Activity;
    //         const workoutDurationElement =  new TimeSpan(workout.workoutDuration / 60);
    //         const workoutCard = new MetricCard({ 
    //             name: workout.workoutType, 
    //             metricValue: workoutDurationElement.root, 
    //             iconClass: icon }); 
    //         row.append(workoutCard.root);

    //         const notes = document.createElement("textarea");
    //         notes.placeholder = "Any workout notes?";
    //     }

    //     return card.root;
    // }

    // =====================================================
    // Recovery
    // =====================================================


    // createRecoveryCard(): HTMLElement {

    //     const card = new Card(); 
    //     const header = new CardHeader("Recovery", ICONS.Recovery) ;

    //     const recoveryGrid = document.createElement("div");
    //     recoveryGrid.className = "metric-grid-3";

    //     // Sleep
    //     const sleepRecords = this.getSelectedDayMetric(MetricTypeIds.Sleep);
    //     const totalSleepHours = sleepRecords.reduce(
    //         (total, sleep) => total + sleep.sleepHours,
    //         0
    //     );
        
    //     const sleepText = new TimeSpan(totalSleepHours);
    //     const sleepCard = new MetricCard({
    //         name: "Total Sleep", 
    //         metricValue: sleepText.root, 
    //         iconClass: ICONS.Sleep}
    //     );
        
    //     // RHR
    //     const restingHeartRate = this.getSelectedDayMetric(MetricTypeIds.RestingHeartRate);
    //     const restingHeartRateMetricElement = new MetricText(restingHeartRate.toString(), 'bpm');
    //     const restingHeartRateCard = new MetricCard({
    //         name: "Resting HR", 
    //         metricValue: restingHeartRateMetricElement.root, 
    //         iconClass: ICONS.RestingHeartRate}
    //     );
        
    //     // Steps
    //     const steps = this.getSelectedDayMetric(MetricTypeIds.Steps);
    //     const stepsMetricElement = new MetricText(steps.toLocaleString());
    //     const stepsCard = new MetricCard({
    //         name: "Total Steps", 
    //         metricValue: stepsMetricElement.root, 
    //         iconClass: ICONS.Steps}
    //     );

    //     recoveryGrid.append(
    //         sleepCard.root,
    //         stepsCard.root,
    //         restingHeartRateCard.root,
    //     );

    //     card.append(
    //         header.root,
    //         recoveryGrid
    //     );

    //     return card.root;
    // }

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