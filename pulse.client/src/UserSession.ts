import type { AppConfig } from "./AppConfig";
import { JourneyStepRepository as JourneyStepRepository } from "./repositories/JourneyStepRepository";
import { MetricsRepository } from "./repositories/MetricsRepository";
import { UserDataRepository } from "./repositories/UserDataRepository";

export class UserSession {

    private static readonly LAST_USER_KEY = "pulse:last-user-id";

    private metricsRepository!:MetricsRepository;
    private userDataRepository!:UserDataRepository;
    private journeyStepRepository!:JourneyStepRepository;

    private readonly appConfig:AppConfig;

    constructor(appConfig: AppConfig) {
        this.appConfig = appConfig;

        const lastUserId = localStorage.getItem(
            UserSession.LAST_USER_KEY
        );

        this.changeUser(lastUserId);
    }

    get metrics(): MetricsRepository {
        return this.metricsRepository;
    }

    get userData(): UserDataRepository {
        return this.userDataRepository;
    }

    get journey(): JourneyStepRepository {
    return this.journeyStepRepository;
}

    private changeUser(userId: string | null) {

        if (userId === null) {
            localStorage.removeItem(UserSession.LAST_USER_KEY);
        } else {
            localStorage.setItem(
                UserSession.LAST_USER_KEY,
                userId
            );
        }

        const prefix = userId === null
            ? `pulse_${this.appConfig.environment}:local`
            : `pulse_${this.appConfig.environment}:user:${userId}`;

        this.metricsRepository = new MetricsRepository(this.appConfig, prefix);
        this.userDataRepository = new UserDataRepository(this.appConfig, prefix);
        this.journeyStepRepository = new JourneyStepRepository(this.appConfig, prefix);
    }

    setUser(userId: string) {
        this.changeUser(userId);
    }

    clearUser() {
        this.changeUser(null);
    }
}