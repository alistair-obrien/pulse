import type { AppConfig } from "../../AppConfig";
import "../styles/version-tag.css";

const PlatformIcons: Record<string, string> = {
    web: "ri-global-line",
    android: "ri-android-fill",
    ios: "ri-apple-fill",
};

const EnvIcons: Record<string, string> = {
    LocalHost: "ri-computer-line",
    Development: "ri-code-line",
    Production: "ri-sparkling-2-fill"
};

const PlatformNames: Record<string, string> = {
    web: "Web",
    android: "Android",
    ios: "ios",
};

const EnvNames: Record<string, string> = {
    LocalHost: "Localhost",
    Development: "Development",
    Production: "Produsction",
};

export class VersionTag {

    readonly root: HTMLElement;

    constructor(versionData: AppConfig) {
        this.root = document.createElement("div");
        this.root.id = "version-tag";
        this.root.className = "version-annotation";

        const topRow = document.createElement("div");
        topRow.className = "row"
        topRow.append(
            this.createItem(
                PlatformNames[versionData.platform] ?? "???",
                PlatformIcons[versionData.platform] ?? "ri-question-line"
            ),
            this.createSeparator(),
            this.createItem(`v.${versionData.versionNumber}`),
            this.createSeparator(),
            this.createItem(
                EnvNames[versionData.environment] ?? "???",
                EnvIcons[versionData.environment] ?? "ri-question-line"
            ),
        );

        this.root.append(topRow);

        this.root.append(
            this.createItem(
                versionData.apiBase,
                "ri-server-fill"
            )
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