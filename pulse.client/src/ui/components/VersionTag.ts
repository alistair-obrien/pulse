import type { PulseAppConfig } from "../../PulseAppConfig";
import "../styles/version-tag.css";
import { ICONS } from "./ICONS";

// App Source
const AppSourceIcons: Record<string, string> = {
    LocalDeploy: ICONS.LocalDeploy,
    LiveReload: ICONS.LiveReload,
    development_android: ICONS.GooglePlayStore,
    production_android: ICONS.GooglePlayStore,
    development_ios: ICONS.AppleAppStore,
    production_ios: ICONS.AppleAppStore,
    development_web: ICONS.Server,
    production_web: ICONS.Server
}

const AppSourceNames: Record<string, string> = {
    LocalDeploy: "Local Deploy",
    LiveReload: "Live Reload",
    development_android: "Play Store - Internal",
    production_android: "Play Store",
    development_ios: "App Store - Testflight",
    production_ios: "App Store",
    development_web: "https://dev.pulse-flow.app/", // TODO: Should use appsettings instead I think
    production_web: "https://pulse-flow.app/" // 
};

// Platform
const PlatformNames: Record<string, string> = {
    web: "Web",
    android: "Android",
    ios: "iOS",
};
const PlatformIcons: Record<string, string> = {
    web: ICONS.Web,
    android: ICONS.Android,
    ios: ICONS.iOS,
};

// Env
const EnvIcons: Record<string, string> = {
    localhost: "ri-terminal-box-line",
    development: "ri-code-line",
    production: "ri-sparkling-2-fill"
};
const EnvHostIcons: Record<string, string> = {
    localHost: "ri-computer-line",
    development: "ri-server-fill",
    production: "ri-server-fill"
};

export class VersionTag {

    readonly root: HTMLElement;

    constructor(versionData: PulseAppConfig) {
        this.root = document.createElement("div");
        this.root.id = "version-tag";
        this.root.className = "version-annotation";

        const clientRow = document.createElement("div");
        clientRow.className = "row";
        clientRow.classList.add("client");
        clientRow.append(
            this.createItem(
                PlatformNames[versionData.platform] ?? versionData.platform,
                PlatformIcons[versionData.platform] ?? "ri-question-line"
            ),
            this.createSeparator(),
            this.createItem(
                AppSourceNames[versionData.appSource] ?? versionData.appSource,
                AppSourceIcons[versionData.appSource] ?? "ri-question-line"
            ),
            this.createSeparator(),
            this.createItem(`v.${versionData.versionNumber}`),
        );

        this.root.append(clientRow);

        const apiRow = document.createElement("div");
        apiRow.className = "row";
        apiRow.classList.add("api");
        apiRow.append(
            this.createItem(
                versionData.environment,
                EnvIcons[versionData.environment] ?? "ri-question-line"
            ),
            this.createSeparator(),
            this.createItem(
                versionData.apiBase,
                EnvHostIcons[versionData.environment]
            )
            // TODO: Should show the version of the server too
        );

        this.root.append(apiRow)

        // const googleAuthRow = document.createElement("div")
        // googleAuthRow.className = "row";
        // googleAuthRow.classList.add("api");
        // googleAuthRow.append(
        //     this.createItem(
        //         versionData.socialLoginIds.googleWebClientId,
        //     ),
        // );

        // this.root.append(googleAuthRow)
    }

    private createSeparator(): HTMLElement {
        const span = document.createElement("span");
        span.className = "version-separator";
        span.textContent = "|";
        return span;
    }

    private createItem(text: string, icon: string = ""): HTMLElement {
        const container = document.createElement("span");
        container.className = "version-item";

        if (icon) {
            const i = document.createElement("i");
            i.className = icon;
            container.append(i);
        }

        const label = document.createElement("span");
        label.textContent = text;

        container.append(label);
        return container;
    }
}