// The total height of the hero area (Partly occluded by content based on visible height)
const HERO_AREA_TOTAL_HEIGHT = 400;
// The total visible height of the hero area. Used to set the size of the header
const HERO_AREA_VISIBLE_HEIGHT = 280;

// At what scroll distance the date should start fading out
const DATE_FADE_THRESHOLD = 160;
// How much distance the fade takes to finish
const DATE_FADE_DIST = 10;

// // At what scroll distance the header should start fading out
// const HEADER_FADE_THRESHOLD = 50;
// // How much distance the fade takes to finish
// const HEADER_FADE_DIST = 10;


import { Clipboard } from "@capacitor/clipboard";
import { type MetricTypeId, type MetricTypes, MetricTypeIds } from "../models/MetricRegistry";

import type { UserSession } from "../UserSession";

// Services
import type { CloudSyncService } from "../services/CloudSyncService";
import type { DeviceMetricsSyncService } from "../services/DeviceMetricsSyncService";
import type { ExternalAPIMetricsSyncService } from "../services/ExternalAPIMetricsSyncService";
import type { ImageService } from "../services/ImageService";

// Components
import { ActionButtonModel } from "../ui/components/ActionButton";
import { CardModel } from "../ui/components/Card";
import { CardHeaderModel } from "../ui/components/CardHeader";
import { DivModel } from "../ui/components/Div";
import { HeroAreaModel } from "../ui/components/HeroArea";
import { ICONS } from "../ui/components/ICONS";
import { MetricCardModel } from "../ui/components/MetricCard";
import { MetricTextModel } from "../ui/components/MetricText";
import { MyDayHeaderModel } from "../ui/components/MyDayHeader";
import { TimeSpanModel } from "../ui/components/TimeSpan";
import { MyDayScreen, MyDayScreenModel } from "../ui/screens/MyDay";

// Controllers
import type { JourneyController } from "./JourneyController";

// Utils
import { getHoursAndMinutesStrFromTime, toDateKey } from "../utils/DateUtils";
import { MetricTextInputFieldModel } from "../ui/components/MetricTextInputField";
import { DateRowModel } from "../ui/components/DateRow";
import { PublishButtonModel } from "../ui/components/PublishButton";
import { ActivityCardModel } from "../ui/components/ActivityCardModel";

export class MyDayController {
    model:MyDayScreenModel;
    screen:MyDayScreen;

    private readonly userSession:UserSession;

    // Controllers
    private readonly journeyController: JourneyController;

    // Services
    private readonly cloudMetricsSyncService?: CloudSyncService;
    private readonly deviceMetricsSyncService?: DeviceMetricsSyncService;
    private readonly extAPIMetricsSyncServices: ExternalAPIMetricsSyncService[];
    private readonly imageService: ImageService;

    constructor(
        args: {
            userSession: UserSession,
            
            journeyController: JourneyController,
            
            cloudMetricsSyncService?: CloudSyncService,
            deviceMetricsSyncService?: DeviceMetricsSyncService,
            extAPIMetricsSyncServices: ExternalAPIMetricsSyncService[],

            imageService: ImageService;
        }
    ) {
        this.userSession = args.userSession;
        this.journeyController = args.journeyController;

        this.cloudMetricsSyncService = args.cloudMetricsSyncService;
        this.deviceMetricsSyncService = args.deviceMetricsSyncService;
        this.extAPIMetricsSyncServices = args.extAPIMetricsSyncServices;

        this.imageService = args.imageService;

        this.screen = new MyDayScreen();
        this.model = this.buildDefaultModel();
    }

    setSelectedDayMetric<K extends MetricTypeId>(metricTypeId: K, value:MetricTypes[K]) {
        this.userSession.metrics.setUserEditMetric(this.model!.selectedDateKey, metricTypeId, value);         
    }

    getSelectedDayMetric<K extends MetricTypeId>(metricTypeId: K): MetricTypes[K] { 
        return this.userSession.metrics.resolveMetric(this.model!.selectedDateKey, metricTypeId); 
    }

    async loadToday() {
        await this.loadDate(new Date()); // Loads today
    }

    async buildModel(date: Date) {

        // >>> My Day Model Init <<<
        const newDate = date;
        const newDateKey = toDateKey(newDate);

        const today = new Date();
        const minDate = new Date(today);
        minDate.setDate(today.getDate() - 300);

        const maxDate = today;

        const image = this.imageService.getRandomImageUrl(newDate.getFullYear() + newDate.getMonth() + newDate.getDate());

        const journeyStep = await this.journeyController.getJourneyStep(newDate);

        const published = journeyStep?.published ?? false;
        // console.log(JSON.stringify(journeyStep));
        // console.log(published);

        this.model = new MyDayScreenModel({
            heroAreaVisibleHeight: HERO_AREA_VISIBLE_HEIGHT,
            heroAreaTotalHeight: HERO_AREA_TOTAL_HEIGHT,
            selectedDate: newDate,
            selectedDateKey: newDateKey,
            headerModel: new MyDayHeaderModel({
                date: newDate,
                dateFadeThreshold: DATE_FADE_THRESHOLD,
                dateFadeDistance: DATE_FADE_DIST,
                heroAreaVisibleHeight: HERO_AREA_VISIBLE_HEIGHT,
                publishButtonModel: new PublishButtonModel( 
                    {
                        published: published,
                        onClick: async () => { 
                            await this.publishAction(published); 
                            await this.refresh(); 
                        }
                    }
                ), 
                dateRowModel: new DateRowModel({
                    date: newDate,
                    minDate: minDate,
                    maxDate: maxDate,
                    onDateChangeRequest: (date) => {
                        void this.transitionToDate(
                            date,
                            date < newDate ? "right" : "left"
                        );
                    }
                })
            }),
            heroAreaModel: new HeroAreaModel({
                imageUrl: image
            }),
            metricSectionCardModels: [],
            myDayActionsModel: new CardModel ({
                content: []
            })
        })

        // // >>> Publish Button <<<
        // this.model.push(
        //     new ActionButtonModel({
        //         iconClass: ICONS.PublishToServer,
        //         labelStr: "Publish",
        //         onClick: () => this.publish()
        //     })
        // );

        // >>> Reflection Card <<<
        const reflectionsCard = new CardModel({
            content: []
        });
        reflectionsCard.content.push(new CardHeaderModel({ title: "Reflections", iconClass: ICONS.Reflection }));
        this.model.metricSectionCardModels.push(reflectionsCard);
        
        const textAreaModel = new MetricTextInputFieldModel({
            placeholderText: "...what did you achieve today?",
            getter: () => this.getSelectedDayMetric(MetricTypeIds.Reflection),
            setter: (value: string) => this.setSelectedDayMetric(MetricTypeIds.Reflection, value)
        }

        );
        reflectionsCard.content.push(textAreaModel);

        // >>> Recovery Card <<<
        const recoveryCardModel = new CardModel({
            content: []
        });
        recoveryCardModel.content.push(new CardHeaderModel({ title: "Recovery", iconClass: ICONS.Recovery }));

        const recoveryRowModel = new DivModel({ className: "row" });
        recoveryCardModel.content.push(recoveryRowModel);

        // Sleep
        const sleepRecords = this.userSession.metrics.resolveMetric(this.model.selectedDateKey, MetricTypeIds.Sleep);
        const totalSleepHours = sleepRecords.reduce( (total, sleep) => total + sleep.sleepHours, 0);
        recoveryRowModel.content.push(new MetricCardModel({ name: "Total Sleep", iconClass: ICONS.Sleep, metricValue: new TimeSpanModel({ time: totalSleepHours }) }));
        
        // Steps
        const steps = this.userSession.metrics.resolveMetric(this.model.selectedDateKey, MetricTypeIds.Steps);
        recoveryRowModel.content.push(new MetricCardModel({ name: "Total Steps", iconClass: ICONS.Steps, metricValue: new MetricTextModel({ value: steps.toLocaleString() }) }));
        
        // RHR
        const rhr = this.userSession.metrics.resolveMetric(this.model.selectedDateKey, MetricTypeIds.RestingHeartRate);
        recoveryRowModel.content.push(new MetricCardModel({ name: "Resting HR", iconClass: ICONS.RestingHeartRate, metricValue: new MetricTextModel({ value: rhr.toLocaleString(), unit: "bpm" }) }));

        this.model.metricSectionCardModels.push(recoveryCardModel);

        // >>> Nutrition Card <<<
        const nutritionCardModel = new CardModel({
            content: []
        });
        nutritionCardModel.content.push(new CardHeaderModel({ title: "Nutrition", iconClass: ICONS.Nutrition }));
        this.model.metricSectionCardModels.push(nutritionCardModel);
        
        const nutritionRowModel = new DivModel({ className: "row" });
        nutritionCardModel.content.push(nutritionRowModel);

        let calories = this.userSession.metrics.resolveMetric(this.model.selectedDateKey, MetricTypeIds.Nutrition_Calories);
        calories = Math.round(calories);
        nutritionRowModel.content.push(new MetricCardModel({ 
            name: "Calories", 
            iconClass: ICONS.None, 
            metricValue: new MetricTextModel({ 
                value: calories.toLocaleString(), 
                unit: "kcal" 
            }) 
        }));

        let protein = this.userSession.metrics.resolveMetric(this.model.selectedDateKey, MetricTypeIds.Nutrition_Protein);
        protein = Math.round(protein);
        nutritionRowModel.content.push(new MetricCardModel({ 
            name: "Protein", 
            iconClass: ICONS.None, 
            metricValue: new MetricTextModel({ 
                value: protein.toLocaleString(), 
                unit: "g" 
            }) 
        }));

        let carbs = this.userSession.metrics.resolveMetric(this.model.selectedDateKey, MetricTypeIds.Nutrition_Carbs);
        carbs = Math.round(carbs);
        nutritionRowModel.content.push(new MetricCardModel({ 
            name: "Carbs", 
            iconClass: ICONS.None, 
            metricValue: new MetricTextModel({ 
                value: carbs.toLocaleString(), 
                unit: "g" 
            }) 
        }));

        let fat = this.userSession.metrics.resolveMetric(this.model.selectedDateKey, MetricTypeIds.Nutrition_Fat);
        fat = Math.round(fat);
        nutritionRowModel.content.push(new MetricCardModel({ 
            name: "Fat", 
            iconClass: ICONS.None, 
            metricValue: new MetricTextModel({ 
                value: fat.toLocaleString(), 
                unit: "g" 
            }) 
        }));

        // >>> Activity Card <<<
        const activityCardModel = new CardModel({
            content: []
        });
        activityCardModel.content.push(new CardHeaderModel({ title: "Activity", iconClass: ICONS.Activity }));
        this.model.metricSectionCardModels.push(activityCardModel);
        
        const activitiesRowModel = new DivModel({ className: "activity-card-container" });
        activityCardModel.content.push(activitiesRowModel);

        const activities = this.userSession.metrics.resolveMetric(this.model.selectedDateKey, MetricTypeIds.Activities);

        activities.forEach(element => {
            activitiesRowModel.content.push(new ActivityCardModel({ 
                activityType: element.type,
                name: element.type,
                duration: new TimeSpanModel({ time: element.duration / 60 }) // Kind hacky tbh
            }));
        });

        // >>> Actions <<<
        const actionsRowModel = new DivModel({ className: "row" });
        this.model.myDayActionsModel.content.push(actionsRowModel);

        actionsRowModel.content.push(
            new ActionButtonModel({ 
                iconClass: ICONS.CloudSync, 
                labelStr: "Cloud Sync", 
                onClick: async () => { 
                    await this.syncFromCloud(this.model.selectedDate); 
                    await this.refresh(); }
            })
        );

        if (this.deviceMetricsSyncService?.isAvailable()) {
            actionsRowModel.content.push(
                new ActionButtonModel({
                    iconClass: ICONS.DeviceSync,
                    labelStr: "Device Sync",
                    onClick: async () => { 
                        await this.syncFromDevice(this.model.selectedDate);
                        await this.refresh(); }
                })            
            );
        }


        // actionsRowModel.content.push(
        //     new ActionButtonModel({
        //         iconClass: ICONS.ExtAPISync,
        //         labelStr: "Ext API Sync",
        //         onClick: async () => { 
        //             await this.syncFromExtAPI(this.model.selectedDate); 
        //             await this.refresh(); }
        //     })
        // );
        
        actionsRowModel.content.push(
            new ActionButtonModel({
                iconClass: ICONS.CopyText,
                labelStr: "Copy Text",
                onClick: () => this.copyAsTextToClipboard()
            })
        );

    }

    async loadDate(date: Date) {
        // Build and display immediately using whatever data is currently available
        await this.buildModel(date);
        await this.screen?.update(this.model);

        // Sync in the background. Refresh when each one completes.
        void this.syncFromCloud(date).then(() => this.refreshIfDate(date));
        void this.syncFromDevice(date).then(() => this.refreshIfDate(date));
        void this.syncFromExtAPI(date).then(() => this.refreshIfDate(date));
    }

    private async refreshIfDate(date: Date) {
        // Don't let an old request overwrite a newer selected date
        if (toDateKey(this.model.selectedDate) !== toDateKey(date))
            return;

        await this.refresh();
    }

    // let animating:boolean  = false
    async transitionToDate(date: Date, direction: "left" | "right") {

        void direction;
        
        await this.loadDate(date);
    }

    async refresh() {
        await this.buildModel(this.model.selectedDate)
        await this.screen?.update(this.model);
    }

    async syncFromCloud(date:Date) {
        if (this.cloudMetricsSyncService?.isAvailable()) { 
            await this.cloudMetricsSyncService.sync(date);
        }
    }

    async syncFromDevice(date:Date) {
        if (this.deviceMetricsSyncService?.isAvailable()) { 
            await this.deviceMetricsSyncService.sync(date);
        }
        
    }

    async syncFromExtAPI(date:Date) {
        let syncedAPICount = 0;

        await Promise.all(
            this.extAPIMetricsSyncServices.map(async element => {
                if (element.isAvailable()) {
                    await element.sync(date);
                    syncedAPICount++;
                }
            })
        );

        return syncedAPICount;
    }

    async publishAction(published:boolean) {
        await this.journeyController.publish(this.model!.selectedDate); 
        // await Toast.show({ text: "Published!", duration: "short", position: "bottom" });
    }

    async copyAsTextToClipboard() {

        const sleepRecords = this.getSelectedDayMetric(MetricTypeIds.Sleep);
        const totalSleepHours = sleepRecords.reduce(
            (total, sleep) => total + sleep.sleepHours,
            0
        );
        const sleepText = getHoursAndMinutesStrFromTime(totalSleepHours);

        const calories = Math.round(this.getSelectedDayMetric(MetricTypeIds.Nutrition_Calories));
        const protein = Math.round(this.getSelectedDayMetric(MetricTypeIds.Nutrition_Protein));
        const carbs = Math.round(this.getSelectedDayMetric(MetricTypeIds.Nutrition_Carbs));
        const fat = Math.round(this.getSelectedDayMetric(MetricTypeIds.Nutrition_Fat));
        const nutritionNotes = this.getSelectedDayMetric(MetricTypeIds.Nutrition_Notes);

        const reflectionNotes = this.getSelectedDayMetric(MetricTypeIds.Reflection);

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
    // // Maybe later a cooler animation
    // async myDayPressed(this: GlobalEventHandlers) {
    //     if (!isToday(selectedDate))
    //         await transitionToDate(new Date(), "left")
    // }

    buildDefaultModel(): MyDayScreenModel {

        const newDate = new Date();
        const newDateKey = toDateKey(newDate);

        return new MyDayScreenModel({
            heroAreaVisibleHeight: HERO_AREA_VISIBLE_HEIGHT,
            heroAreaTotalHeight: HERO_AREA_TOTAL_HEIGHT,
            selectedDate: newDate,
            selectedDateKey: newDateKey,
            headerModel: new MyDayHeaderModel({
                date: newDate,
                dateFadeThreshold: DATE_FADE_THRESHOLD,
                dateFadeDistance: DATE_FADE_DIST,
                heroAreaVisibleHeight: HERO_AREA_VISIBLE_HEIGHT,
                publishButtonModel: new PublishButtonModel({
                    published: false,
                    onClick: () => null
                }),
                dateRowModel: new DateRowModel({
                    date: newDate,
                    minDate: newDate,
                    maxDate: newDate,
                    onDateChangeRequest: () => null
                })
            }),
            heroAreaModel: new HeroAreaModel({
                imageUrl: ""
            }),
            metricSectionCardModels: [],
            myDayActionsModel: new CardModel ({
                content: []
            })
        })
    }
}