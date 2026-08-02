// Styles
import './styles/colors.css';
import './styles/main.css'

import type { AppConfig } from "../AppConfig";

// Screens
import * as Splash from "./screens/Splash"
import * as MyDay from "./screens/MyDay";
import * as Me from "./screens/Me";
import * as Journey from "./screens/Journey";

// Components
import { ActionButton } from './components/ActionButton';
import { VersionTag } from './components/VersionTag';
import { Footer } from "./components/Footer";
import { ICONS } from "./components/ICONS";

export class PulseApp {

    private readonly version_tag:VersionTag;
    
    private readonly screenContainer:HTMLElement;

    private splashEnabled: boolean;
    private showDebugVersionAnnotation: boolean;

    constructor(appConfig:AppConfig) {
        this.splashEnabled = appConfig.splashEnabled;
        this.showDebugVersionAnnotation = appConfig.showDebugVersionAnnotation;
    
        const app = document.createElement("div");
        app.className = "app";
        document.body.append(app);

        // Screen Container for screen contents
        this.screenContainer = document.createElement("div")
        this.screenContainer.id = "Screen"
        this.screenContainer.className = "screen";
        app.append(this.screenContainer);

        // Universal Footer. May want to consider a base Screen class instead which takes App via DI and can then decide what footer means in that context or if its even on
        const footer = new Footer();
        footer.appendButton(new ActionButton("Journey", ICONS.Journey, () => this.changeScreen(this.journeyScreen)));
        footer.appendButton(new ActionButton("My Day", ICONS.MyDay, () => this.changeScreen(this.myDayScreen)));
        footer.appendButton(new ActionButton("Me", ICONS.Me, () => this.changeScreen(this.meScreen)));
        app.append(footer.root);

        this.version_tag = new VersionTag(appConfig);
        app.append(this.version_tag.root);
        this.setVersionVisibility(this.showDebugVersionAnnotation);
    }

    cachedSplashScreen:HTMLElement|null = null;
    get splashScreen():HTMLElement {
        return this.cachedSplashScreen ??= Splash.render() 
    } 

    cachedJourneyScreen:HTMLElement|null = null;
    get journeyScreen():HTMLElement { 
        return this.cachedJourneyScreen ??= Journey.render() 
    } 

    cachedMyDayScreen:HTMLElement|null = null;
    get myDayScreen():HTMLElement { 
        return this.cachedMyDayScreen ??= MyDay.render() 
    } 

    cachedMeScreen:HTMLElement|null = null;
    get meScreen():HTMLElement { 
        return this.cachedMeScreen ??= Me.render() 
    } 

    async start() {
        if (this.splashEnabled) {
            const splash = this.splashScreen;
            document.body.append(splash);
        }
        
        await MyDay.mount(this.screenContainer); //Kinda hacky tbh
        await Me.mount(this.screenContainer);
        this.changeScreen(this.myDayScreen);

        // this.changeScreen(this.journeyScreen);
        
        if (this.splashEnabled) {
            await Splash.finish();
        }
    }

    changeScreen(newScreen:HTMLElement) {
        this.screenContainer.replaceChildren(newScreen)
    }

    setVersionVisibility(value:boolean) {
        this.showDebugVersionAnnotation = value;
        // TODO: actually disable it
    }
}