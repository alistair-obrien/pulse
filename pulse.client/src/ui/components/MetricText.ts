import { Component, ComponentModel } from "./Component";

export class MetricTextModel extends ComponentModel<MetricText> {
    component = MetricText;
    value: string;
    unit?: string;

    constructor(args: { 
        value: string;
        unit?: string;
     }) {
        super();
        this.value = args.value;
        this.unit = args.unit;
    }
}

export class MetricText extends Component<MetricTextModel> {
    unitSpan: HTMLSpanElement;
    valueSpan: HTMLSpanElement;
    
    constructor() {
        super();
        this.root.className = "metric-value";

        this.valueSpan = document.createElement("span");
        // this.valueSpan = document.createElement("textarea");
        this.valueSpan.className = "metric-value";
        this.root.append(this.valueSpan);
        
        this.unitSpan = document.createElement("span");
        this.unitSpan.className = "metric-unit";
        this.root.append(this.unitSpan);
    }
    
    render() {
        this.valueSpan.textContent = this.model.value;
        this.unitSpan.textContent = this.model.unit?.toString()??" ";
    }
}
