import type { AppConfig } from "../../AppConfig";
import "../styles/version-tag.css";

const PlatformIcons: Record<string, string> = {
    web: "ri-global-line",
    android: "ri-android-line",
    ios: "ri-apple-line",
};

const EnvIcons: Record<string, string> = {
    LocalHost: "ri-computer-line",
    Development: "ri-test-tube-line",
    Production: "ri-rocket-line",
};

export class VersionTag {

    readonly root: HTMLElement;

    constructor(versionData: AppConfig) {
        this.root = document.createElement("div");
        this.root.id = "version-tag";
        this.root.className = "version-annotation";

        this.root.append(
            this.createItem(
                versionData.platform,
                PlatformIcons[versionData.platform] ?? "ri-question-line"
            ),
            this.createSeparator(),
            this.createItem(
                versionData.environment,
                EnvIcons[versionData.environment] ?? "ri-question-line"
            ),
            this.createSeparator(),
            this.createItem(
                versionData.apiBase,
            ),
        );
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