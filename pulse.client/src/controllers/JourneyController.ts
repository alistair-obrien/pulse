import { API } from "../api/API";
import { MetricTypeIds, type MetricTypes } from "../models/MetricRegistry";
import { JourneyStep } from "../models/JourneyStep";
import { AuthService } from "../services/AuthService";
import { toDateKey } from "../utils/DateUtils";
import { JourneyScreen, JourneyScreenModel } from "../ui/screens/Journey";
import { DivModel } from "../ui/components/Div";
import { ICONS } from "../ui/components/ICONS";
import { MetricTextModel } from "../ui/components/MetricText";
import { MetricCardModel } from "../ui/components/MetricCard";
import { JourneyStepCardModel } from "../ui/components/JourneyStepCard";
import { ProfileThumbnailModel } from "../ui/components/ProfileThumbnail";
import { CardIdHeaderModel } from "../ui/components/CardIdHeader";
import { ActionButtonModel } from "../ui/components/ActionButton";
import { JourneyStepGroupModel } from "../ui/components/JourneyStepGroup";
import type { PulseApp } from "../ui/PulseApp";
import { ReflectionTextModel } from "../ui/components/ReflectionText";
import type { UserSession } from "../UserSession";
import { JourneyContextPopupModel } from "../ui/components/JourneyContextPopup";

const DEFAULT_JOURNEY_STEP_METRICS  = [
    MetricTypeIds.Reflection,
    MetricTypeIds.Steps,
    MetricTypeIds.Sleep,
    MetricTypeIds.Nutrition_Calories,
    MetricTypeIds.Nutrition_Protein,
    MetricTypeIds.Nutrition_Carbs,
    MetricTypeIds.Nutrition_Fat,
    MetricTypeIds.Workouts
] as const;

export class JourneyController {

    model:JourneyScreenModel;
    screen:JourneyScreen;

    private readonly userSession:UserSession;
    private readonly authService:AuthService;
    private readonly api:API;
    private readonly pulseApp:PulseApp;

    constructor(args: {
        userSession: UserSession,
        authService: AuthService,
        api:API,
        pulseApp:PulseApp
    }
    ) {

        this.userSession = args.userSession;
        this.authService = args.authService;
        this.api = args.api;
        this.pulseApp = args.pulseApp;

        this.screen = new JourneyScreen();
        this.model = this.buildDefaultModel();
    }

    buildDefaultModel() : JourneyScreenModel {
        return new JourneyScreenModel(
            {
                journeySteps: []
            }
        )
    }

    async refresh() {
        const journeySteps = await this.getAllJourneySteps(new Date());

        this.model = new JourneyScreenModel(
            {
                journeySteps: []
            }
        )

        let currentDate = "";

        let journeyStepGroup:JourneyStepGroupModel;

        journeySteps.forEach(element => {

            if (element.date !== currentDate) {
                currentDate = element.date;

                journeyStepGroup = new JourneyStepGroupModel({
                        date: element.date
                    })

                this.model.journeyStepGroups.push(journeyStepGroup);
            }

            let journeyStepsCard = new JourneyStepCardModel()

            const idHeader = new CardIdHeaderModel({ 
                userName: element.userName, 
                userImage: new ProfileThumbnailModel({ 
                    imageUrl: element.userProfilePicture 
                })  
            });
            journeyStepsCard.card.content.push(idHeader);

            const reflections = element.getMetric(MetricTypeIds.Reflection);
            const reflectionTextModel = new ReflectionTextModel({text: reflections})
            journeyStepsCard.card.content.push(reflectionTextModel);

            const nutritionRowModel = new DivModel({ className: "row" });
            journeyStepsCard.card.content.push(nutritionRowModel);

            let calories = element.getMetric(MetricTypeIds.Nutrition_Calories);
            calories = Math.round(calories);
            nutritionRowModel.content.push(new MetricCardModel({ 
                name: "Calories", 
                iconClass: ICONS.None, 
                metricValue: new MetricTextModel({ 
                    value: calories.toLocaleString(), 
                    unit: "kcal" 
                }) 
            }));

            let protein = element.getMetric(MetricTypeIds.Nutrition_Protein);
            protein = Math.round(protein);
            nutritionRowModel.content.push(new MetricCardModel({ 
                name: "Protein", 
                iconClass: ICONS.None, 
                metricValue: new MetricTextModel({ 
                    value: protein.toLocaleString(), 
                    unit: "g" 
                }) 
            }));

            let carbs = element.getMetric(MetricTypeIds.Nutrition_Carbs);
            carbs = Math.round(carbs);
            nutritionRowModel.content.push(new MetricCardModel({ 
                name: "Carbs", 
                iconClass: ICONS.None, 
                metricValue: new MetricTextModel({ 
                    value: carbs.toLocaleString(), 
                    unit: "g" 
                }) 
            }));

            let fat = element.getMetric(MetricTypeIds.Nutrition_Fat);
            fat = Math.round(fat);
            nutritionRowModel.content.push(new MetricCardModel({ 
                name: "Fat", 
                iconClass: ICONS.None, 
                metricValue: new MetricTextModel({ 
                    value: fat.toLocaleString(), 
                    unit: "g" 
                }) 
            }));

            // >>> FOOTER <<<
            const actionRowModel = new DivModel({ className: "footer-action-buttons-row" });
            journeyStepsCard.card.content.push(actionRowModel);

            const leftGroup = new DivModel({
                className: "row left-group"
            })
            actionRowModel.content.push(leftGroup);


            journeyStepsCard.contextPopup = new JourneyContextPopupModel({
                onEdit: () => this.openInMyDay(element),
                onUnpublish: async () => { 
                    await this.unpublish(element);
                    await this.refresh(); 
                }
            })

            if (element.userId == this.userSession.userId) {
                const editActBtn = new ActionButtonModel({
                    iconClass: ICONS.Options,
                    labelStr: "",
                    onClick: () => {
                        journeyStepsCard.contextPopup.visible = !journeyStepsCard.contextPopup.visible;
                        this.screen.update(this.model);
                    }
                })
                leftGroup.content.push(editActBtn);
            }


            const rightGroup = new DivModel({
                className: "row right-group"
            })
            actionRowModel.content.push(rightGroup);

            const commentActBtn = new ActionButtonModel({
                iconClass: ICONS.Comment,
                labelStr: element.comments.length.toLocaleString(),
                onClick: () => console.log("Comment") // TODO
            })
            rightGroup.content.push(commentActBtn);

            const likeActBtn = new ActionButtonModel({
                iconClass: element.liked ? ICONS.LikeFilled : ICONS.Like,
                labelStr: element.likesCount.toLocaleString(),
                
                onClick: async () => {
                    // Optimistic
                    element.liked = !element.liked;
                    element.likesCount += !element.liked ? -1 : 1;
                    likeActBtn.iconClass = element.liked ? ICONS.LikeFilled : ICONS.Like;
                    likeActBtn.labelStr = element.likesCount.toLocaleString();
                    this.screen.update(this.model);
                    
                    // Authorative
                    await this.likeJourneyStep(element); 
                    await this.refresh();
                }
            });
            rightGroup.content.push(likeActBtn);

            journeyStepGroup.journeyStepCards.push(journeyStepsCard);
        });

        this.screen.update(this.model);
    }

    async publish(date: Date) {
        const dateKey = toDateKey(date);

        if (this.authService.isLoggedIn()) {
            await this.api.putJournalStep(dateKey);
        } else {
            // Mark the local journey record as published.
            // ...
        }
    }

    async getJourneyStep(date: Date): Promise<JourneyStep | undefined> {
        let dateKey = toDateKey(date);

        console.log("Hi");

        if (this.authService.isLoggedIn()) {

            const journeyStepResponse = await this.api.getJourneyStep(dateKey);
            console.log(JSON.stringify(journeyStepResponse));
            return journeyStepResponse?.journeyStep;
        } else {
            return undefined;
        }
    }

    async getAllJourneySteps(date: Date) : Promise<JourneyStep[]> {
        let dateKey = toDateKey(date);
        void dateKey;

        // If we have no online account then we should get from local storage.

        let journeySteps:JourneyStep[];

        // Remote Construction since we need other users specifically exposed metrics
        if (this.authService.isLoggedIn()) {
        
            const journeyStepsResponse = await this.api.getJourneySteps(0);
            journeySteps = journeyStepsResponse?.journeySteps ?? [];
        
        // Local Construction
        } else {
        journeySteps = [];

        const today = new Date();
        for (let i = 0; i < 10; i++) {
                const selDate = new Date(today);
                selDate.setDate(today.getDate() - i);

                const dateKey = toDateKey(selDate);

                const metrics:Partial<MetricTypes> = this.userSession.metrics.resolveMetrics(dateKey, ...DEFAULT_JOURNEY_STEP_METRICS );

                const journeyStep = JourneyStep.fromJson({
                    id: "local",
                    date: dateKey,
                    userName: this.userSession.userData.getUserData().displayName,
                    userProfilePicture: this.userSession.userData.getUserData().profileImage,
                    liked: true,
                    likesCount: 0,
                    comments: [],
                    metrics,
                });
                journeySteps.push(journeyStep);
        }
        }

        return journeySteps;
    }

    async likeJourneyStep(journeyStep: JourneyStep) : Promise<{ liked: boolean }> {
        // Need just the journey id maybe. Though date and user are consistent
        return await this.api.likeJourneyStep(journeyStep.id);
    }

    async unpublish(journeyStep: JourneyStep) {
        if (this.authService.isLoggedIn()) {
            await this.api.deleteJournalStep(journeyStep.date);
        } else {
            // Mark local journey record as unpublished.
            // ...
        }
    }
    async openInMyDay(journeyStep: JourneyStep) {
        this.pulseApp.openMyDayAtDate(journeyStep.date);   
    }
}