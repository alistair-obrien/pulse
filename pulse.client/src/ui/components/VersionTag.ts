import type { AppConfig } from "../../AppConfig";
import "../styles/version-tag.css";

// App Source
const AppSourceIcons: Record<string, string> = {
    LocalDeploy: "ri-u-disk-fill",
    LiveReload: "ri-terminal-box-line",
    development_android: "ri-google-play-line",
    production_android: "ri-google-play-line",
    development_ios: "ri-app-store-fill",
    production_ios: "ri-app-store-fill",
    development_web: "ri-server-fill",
    production_web: "ri-server-fill"
}

const AppSourceNames: Record<string, string> = {
    LocalDeploy: "Local Deploy",
    LiveReload: "Live Reload",
    development_android: "Play Store - Internal",
    production_android: "Play Store",
    development_ios: "App Store - Testflight",
    production_ios: "App Store",
    development_web: "https://dev.pulse-flow.app/", // TODO: Should use appsettings instead I think
    production_web: "https://pulse-flow.app/"
};

// Platform
const PlatformNames: Record<string, string> = {
    web: "Web",
    android: "Android",
    ios: "iOS",
};
const PlatformIcons: Record<string, string> = {
    web: "ri-global-line",
    android: "ri-android-fill",
    ios: "ri-apple-fill",
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

    constructor(versionData: AppConfig) {
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

        this.root.append(
            apiRow
        )
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