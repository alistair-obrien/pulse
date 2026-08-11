// Styles
import './styles/colors.css';
import './styles/main.css'

import type { AppConfig } from "../AppConfig";

// Screens
import * as Splash from "./screens/Splash"
// import * as Me from "./screens/Me";
// import * as Journey from "./screens/Journey";

// Components
import { VersionTag } from './components/VersionTag';
import { Footer } from "./components/Footer";
import { type Component } from './components/Component';

// Repositories
import { MetricsRepository } from '../repositories/MetricsRepository';

// Services
import { CloudMetricsSyncService } from '../services/CloudMetricsSyncService';
import { type DeviceMetricsSyncService } from '../services/DeviceMetricsSyncService';
import { type ExternalAPIMetricsSyncService } from '../services/ExternalAPIMetricsSyncService';
import { HEVYAPIMetricsSyncService } from '../services/ExternalAPIMetricsProviders/HEVYAPIMetricsProvider';
import { ImageService } from '../services/ImageService';
import { HealthConnectSyncService } from '../services/DeviceMetricsProviders/AndroidHealthConnectDeviceMetricsProvider';
import { HealthKitSyncService } from '../services/DeviceMetricsProviders/AppleHealthKitDeviceMetricsProvider';

// Controllers
import { JourneyController } from '../controllers/JourneyController';
import { MyDayController } from '../controllers/MyDayController';
import { MeController } from '../controllers/MeController';
import { ActionButton, ActionButtonModel } from './components/ActionButton';
import { ICONS } from './components/ICONS';
import { AuthService } from '../services/AuthService';
import { GoogleAuthProvider } from '../services/AuthProviders/GoogleAuthProvider';
import { API } from '../api/API';
import { APIClient } from '../api/APIClient';
export class PulseApp {

    private readonly version_tag:VersionTag;
    
    private readonly screenContainer:HTMLElement;

    private splashEnabled: boolean;
    private showDebugVersionAnnotation: boolean;

    private readonly myDayController: MyDayController;
    private readonly journeyController: JourneyController;
    private readonly meController: MeController;

    constructor(appConfig:AppConfig) {
        this.splashEnabled = appConfig.splashEnabled;
        this.showDebugVersionAnnotation = appConfig.showDebugVersionAnnotation;
    
        // Repositories
        const metricsRepository:MetricsRepository = new MetricsRepository();
        const api:API = new API(); // HACK. We attach the client after auth is ready
        
        const authService:AuthService = new AuthService(appConfig, api);
        authService.addProvider(new GoogleAuthProvider(appConfig.socialLoginIds.googleWebClientId, appConfig.platform, api));
        
        api.attachClient(new APIClient(appConfig.apiBase, authService))

        const cloudMetricsSyncService:CloudMetricsSyncService = new CloudMetricsSyncService(metricsRepository, authService, api);
        let deviceMetricsSyncService:DeviceMetricsSyncService | undefined = undefined; // Can be undefined on web.
        
        if (appConfig.platform == 'android') {
            deviceMetricsSyncService = new HealthConnectSyncService(metricsRepository);
        }
        else if (appConfig.platform == 'ios') {
            deviceMetricsSyncService = new HealthKitSyncService(metricsRepository);
        }
        deviceMetricsSyncService?.initialize()

        const extAPIMetricsSyncServices:ExternalAPIMetricsSyncService[] = [];
        extAPIMetricsSyncServices.push(new HEVYAPIMetricsSyncService(metricsRepository));

        const imageService:ImageService = new ImageService();
        
        // Controllers
        this.journeyController = new JourneyController(metricsRepository, authService, api);
        this.myDayController = new MyDayController({
            metricsRepository: metricsRepository,

            journeyController: this.journeyController,

            cloudMetricsSyncService: cloudMetricsSyncService,
            deviceMetricsSyncService: deviceMetricsSyncService,
            extAPIMetricsSyncServices: extAPIMetricsSyncServices,

            imageService: imageService
        });
        this.meController = new MeController({ authService: authService, externalAPIServices: extAPIMetricsSyncServices });

        // >>> Build DOM
        const app = document.createElement("div");
        app.className = "app";
        document.body.append(app);

        // Screen Container for screen contents
        this.screenContainer = document.createElement("div")
        this.screenContainer.className = "screen";
        app.append(this.screenContainer);

        // Should make this a component
        const footer = new Footer();

        const journeyButton = new ActionButton();
        journeyButton.update(
            new ActionButtonModel({
                labelStr: "Journey", 
                iconClass: ICONS.Journey, 
                onClick: () => this.changeScreen(this.journeyController.screen)
        }));
        footer.appendButton(journeyButton);

        const myDayButton = new ActionButton();
        myDayButton.update(
            new ActionButtonModel({
                labelStr: "My Day", 
                iconClass: ICONS.MyDay, 
                onClick: () => this.changeScreen(this.myDayController.screen)
        }));
        footer.appendButton(myDayButton);

        const meButton = new ActionButton();
        meButton.update(
            new ActionButtonModel({
                labelStr: "Me", 
                iconClass: ICONS.Me, 
                onClick: () => this.changeScreen(this.meController.screen)
        }));
        footer.appendButton(meButton);

        app.append(footer.root);

        this.version_tag = new VersionTag(appConfig);
        app.append(this.version_tag.root);
        this.setVersionVisibility(this.showDebugVersionAnnotation);
    }

    async start() {
        // if (this.splashEnabled) {
        //     const splash = this.splashScreen;
        //     document.body.append(splash);
        // }
    
        await this.myDayController.loadToday();
        this.changeScreen(this.myDayController.screen);
        
        // if (this.splashEnabled) {
        //     await Splash.finish();
        // }
    }

    changeScreen(newScreen:Component<any>) {
        this.screenContainer.replaceChildren(newScreen.root)
    }

    setVersionVisibility(value:boolean) {
        this.showDebugVersionAnnotation = value;
        // TODO: actually disable it
    }
}