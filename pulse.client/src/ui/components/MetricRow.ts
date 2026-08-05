
export class MetricRow {
    readonly root: HTMLElement;

    constructor(metricName: string, metricValue: HTMLElement, metricIconClass: string | null = null) {
        this.root = document.createElement("div");
        this.root.className = "metric-row";

        const labelContainer = document.createElement("div");
        labelContainer.className = "metric-label-container";

        const icon = document.createElement("i");
        if (metricIconClass != null) {
            icon.className = metricIconClass!;
            labelContainer.append(icon);
        }

        const label = document.createElement("div");
        label.className = "metric-label-text";
        label.textContent = metricName;
        labelContainer.append(label);

        this.root.append(labelContainer, metricValue);
    }
}
