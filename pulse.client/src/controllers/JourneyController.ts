import { API } from "../api/API";
import { MetricTypeIds, type MetricTypes } from "../models/MetricRegistry";
import { JourneyStep } from "../models/JourneyStep";
import { AuthService } from "../services/AuthService";
import { toDateKey } from "../utils/DateUtils";
import type { MetricsRepository } from "../repositories/MetricsRepository";
import { JourneyScreen, JourneyScreenModel } from "../ui/screens/Journey";
import { CardModel } from "../ui/components/Card";
import { CardHeaderModel } from "../ui/components/CardHeader";
import { ProfileThumbnail, ProfileThumbnailModel } from "../ui/components/ProfileThumbnail";
import { DivModel } from "../ui/components/Div";
import { ICONS } from "../ui/components/ICONS";
import { MetricTextModel } from "../ui/components/MetricText";
import { MetricCardModel } from "../ui/components/MetricCard";
import { MetricTextInputFieldModel } from "../ui/components/MetricTextInputField";

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

    // TODO
    model:JourneyScreenModel;
    screen:JourneyScreen;

    private readonly metricsRepository:MetricsRepository;
    private readonly authService:AuthService;
    private readonly api:API;

    constructor(
        metricsRepository: MetricsRepository, 
        authService: AuthService,
        api:API) {

        this.metricsRepository = metricsRepository;
        this.authService = authService;
        this.api = api;

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

        let model = this.buildDefaultModel();

        journeySteps.forEach(element => {

            let journeyStepsCard = 
                new CardModel(
                    {
                        content: []
                    }
                )

            // new CardHeaderModel({ title: element.userName, iconClass: "" }),
            const topHeader = new DivModel({className: ""}); // TODO
            journeyStepsCard.content.push(topHeader);

            const profileThumb = new ProfileThumbnailModel({ imageUrl: element.userProfilePicture });            
            topHeader.content.push(profileThumb);

            const reflections = this.metricsRepository.resolveMetric(element.date, MetricTypeIds.Reflection);
            const reflectionTextModel = new MetricTextModel({value: reflections})
            journeyStepsCard.content.push(reflectionTextModel);

            const nutritionRowModel = new DivModel({ className: "row" });
            journeyStepsCard.content.push(nutritionRowModel);

            let calories = this.metricsRepository.resolveMetric(element.date, MetricTypeIds.Nutrition_Calories);
            calories = Math.round(calories);
            nutritionRowModel.content.push(new MetricCardModel({ 
                name: "Calories", 
                iconClass: ICONS.None, 
                metricValue: new MetricTextModel({ 
                    value: calories.toLocaleString(), 
                    unit: "kcal" 
                }) 
            }));

            let protein = this.metricsRepository.resolveMetric(element.date, MetricTypeIds.Nutrition_Protein);
            protein = Math.round(protein);
            nutritionRowModel.content.push(new MetricCardModel({ 
                name: "Protein", 
                iconClass: ICONS.None, 
                metricValue: new MetricTextModel({ 
                    value: protein.toLocaleString(), 
                    unit: "g" 
                }) 
            }));

            let carbs = this.metricsRepository.resolveMetric(element.date, MetricTypeIds.Nutrition_Carbs);
            carbs = Math.round(carbs);
            nutritionRowModel.content.push(new MetricCardModel({ 
                name: "Carbs", 
                iconClass: ICONS.None, 
                metricValue: new MetricTextModel({ 
                    value: carbs.toLocaleString(), 
                    unit: "g" 
                }) 
            }));

            let fat = this.metricsRepository.resolveMetric(element.date, MetricTypeIds.Nutrition_Fat);
            fat = Math.round(fat);
            nutritionRowModel.content.push(new MetricCardModel({ 
                name: "Fat", 
                iconClass: ICONS.None, 
                metricValue: new MetricTextModel({ 
                    value: fat.toLocaleString(), 
                    unit: "g" 
                }) 
            }));

            model.journeySteps.push(journeyStepsCard);
        });

        this.screen.update(model);
    }

    async publish(date: Date) {
        let dateKey = toDateKey(date);
        void dateKey;

        await this.api.putJournalStep(dateKey);
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

                const metrics:Partial<MetricTypes> = this.metricsRepository.resolveMetrics(dateKey, ...DEFAULT_JOURNEY_STEP_METRICS );

                const journeyStep = JourneyStep.fromJson({
                    id: "local",
                    date: dateKey,
                    userName: "Ali",
                    userProfilePicture: "",
                    liked: true,
                    likesCount: 42,
                    comments: [],
                    metrics,
                });
                journeySteps.push(journeyStep);
        }
        }

        return journeySteps;
    }

    async likeJourneyStep(journeyStep: JourneyStep) : Promise<{ liked: boolean }> {
        // Need just the journey id
        return await this.api.likeJourneyStep(journeyStep.date, journeyStep.userId);
    }
}