// Styles
import './styles/colors.css';
import './styles/main.css'

import type { PulseAppConfig } from "../PulseAppConfig";
import { Keyboard } from '@capacitor/keyboard';

// Screens
import * as Splash from "./screens/Splash"
// import * as Me from "./screens/Me";
// import * as Journey from "./screens/Journey";

// Components
import { VersionTag } from './components/VersionTag';
import { Footer } from "./components/Footer";
import { type Component } from './components/Component';

import { UserSession } from '../UserSession';

// Services
import { CloudSyncService } from '../services/CloudSyncService';
import { type DeviceMetricsSyncService } from '../services/DeviceMetricsSyncService';
import { type ExternalAPIMetricsSyncService } from '../services/ExternalAPIMetricsSyncService';
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
import { fromDateKey } from '../utils/DateUtils';
import { ContextMenu, ContextMenuModel } from './components/ContextMenu';

export class PulseApp {

    private readonly version_tag:VersionTag;
    
    private readonly screenContainer:HTMLElement;

    private readonly contextMenu : ContextMenu;

    private splashEnabled: boolean;
    private showDebugVersionAnnotation: boolean;

    private readonly myDayController: MyDayController;
    private readonly journeyController: JourneyController;
    private readonly meController: MeController;

    constructor(appConfig:PulseAppConfig) {
        this.splashEnabled = appConfig.splashEnabled;
        this.showDebugVersionAnnotation = appConfig.showDebugVersionAnnotation;
            
        // >>> User Session <<<
        const userSession:UserSession = new UserSession(appConfig);

        // >>> API and AUTH <<<
        const api:API = new API(); // HACK. We attach the client after auth is ready

        const authService:AuthService = new AuthService(appConfig, api, userSession);
        authService.addProvider(new GoogleAuthProvider(appConfig.socialLoginIds.googleWebClientId, appConfig.platform, api));
        
        api.attachClient(new APIClient(appConfig.apiBase, authService))
        // HACK end

        // >>> Sync Services <<<
        const cloudSyncService:CloudSyncService = new CloudSyncService(userSession, authService, api);
        let deviceMetricsSyncService:DeviceMetricsSyncService | undefined = undefined; // Can be undefined on web.
        
        // deviceMetricsSyncService = new CapacitorHealthDeviceMetricsProvider(userSession); // TODO: Maybe a generic wrapper

        if (appConfig.platform == 'android') {
            deviceMetricsSyncService = new HealthConnectSyncService(userSession);
        }
        else if (appConfig.platform == 'ios') {
            deviceMetricsSyncService = new HealthKitSyncService(userSession);
        }
        deviceMetricsSyncService?.initialize()

        const extAPIMetricsSyncServices:ExternalAPIMetricsSyncService[] = [];
        // extAPIMetricsSyncServices.push(new HEVYAPIMetricsSyncService(userSession));

        // >>> Other Services <<<
        const imageService:ImageService = new ImageService();
        
        // >>> Controllers <<<
        this.journeyController = new JourneyController({
            userSession: userSession, 
            authService: authService, 
            api: api,
            pulseApp: this
        });
        
        this.myDayController = new MyDayController({
            userSession: userSession,

            pulseApp: this,

            journeyController: this.journeyController,

            cloudMetricsSyncService: cloudSyncService,
            deviceMetricsSyncService: deviceMetricsSyncService,
            extAPIMetricsSyncServices: extAPIMetricsSyncServices,

            imageService: imageService
        });
        this.meController = new MeController({ 
            userSession: userSession,
            imageService: imageService,
            authService: authService, 
            externalAPIServices: extAPIMetricsSyncServices,
            cloudSyncService: cloudSyncService,
            deviceMetricsSyncService: deviceMetricsSyncService
        });

        // >>> Build DOM
        const app = document.createElement("div");
        app.className = "app";
        document.body.append(app);

        // Screen Container for screen contents
        this.screenContainer = document.createElement("div")
        this.screenContainer.className = "screen";
        app.append(this.screenContainer);

        // Mount all screens
        this.screenContainer.append(
            this.myDayController.screen.root,
            this.journeyController.screen.root,
            this.meController.screen.root
        );

        // Should make this a component
        const footer = new Footer();

        const journeyButton = new ActionButton();
        journeyButton.update(
            new ActionButtonModel({
                labelStr: "Journey", 
                iconClass: ICONS.Journey, 
                onClick: () => { this.journeyController.refresh(); this.changeScreen(this.journeyController.screen); }
        }));
        footer.appendButton(journeyButton);

        const myDayButton = new ActionButton();
        myDayButton.update(
            new ActionButtonModel({
                labelStr: "My Day", 
                iconClass: ICONS.MyDay, 
                onClick: () => { this.myDayController.refresh(); this.changeScreen(this.myDayController.screen); }
        }));
        footer.appendButton(myDayButton);

        const meButton = new ActionButton();
        meButton.update(
            new ActionButtonModel({
                labelStr: "Me", 
                iconClass: ICONS.Me, 
                onClick: () => { this.meController.refresh(); this.changeScreen(this.meController.screen) }
        }));
        footer.appendButton(meButton);

        app.append(footer.root);

        this.version_tag = new VersionTag(appConfig);
        app.append(this.version_tag.root);
        this.setVersionVisibility(this.showDebugVersionAnnotation);

        // >>> Generic Context Menu <<<
        this.contextMenu = new ContextMenu();
        document.body.append(this.contextMenu.root)

        // >>> For Detetcing Keyboard State in CSS <<<
        Keyboard.addListener('keyboardWillShow', () => {
            document.body.classList.add('keyboard-open');
        });

        Keyboard.addListener('keyboardWillHide', () => {
            document.body.classList.remove('keyboard-open');
        });
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

    changeScreen(newScreen: Component<any>) {
        for (const screen of this.screenContainer.children) {
            screen.classList.remove("active");
        }

        newScreen.root.classList.add("active");
    }
    
    // Probabky want screen controller
    openMyDayAtDate(date: string) {
        this.myDayController.transitionToDate(fromDateKey(date), "left");
        this.changeScreen(this.myDayController.screen)
    }

    setVersionVisibility(value:boolean) {
        this.showDebugVersionAnnotation = value;
        // TODO: actually disable it
    }

    openContextMenu(model: ContextMenuModel) {

        this.contextMenu.update(model);
    }
}