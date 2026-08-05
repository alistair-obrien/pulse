import { Component, ComponentModel } from "./Component";
import { Div } from "./Div";

export class MetricCardModel extends ComponentModel<MetricCard> {
    readonly component = MetricCard;

    readonly name: string;
    readonly metricValue: ComponentModel<any>;
    readonly iconClass: string;

    constructor(args: {
        name: string;
        metricValue: ComponentModel<any>;
        iconClass: string;
    }) {
        super();

        this.name = args.name;
        this.metricValue = args.metricValue;
        this.iconClass = args.iconClass;
    }
}

export class MetricCard extends Component<MetricCardModel> {

    private name: HTMLElement;
    private metricValue: Component<any>;
    private icon: HTMLElement;

    constructor() {
        super();
        this.root.className = "metric-card";

        this.metricValue = new Div();
        
        this.icon = document.createElement("i");
        
        this.name = document.createElement("div");
        this.name.className = "metric-label-text";
        
        this.root.append(
            this.icon, 
            this.name, 
            this.metricValue.root
        );
    }

    render() {

        this.name.textContent = this.model.name;
        this.icon.className = this.model.iconClass;
        
        if (!(this.metricValue instanceof this.model.metricValue.component)) {
            const comp = new this.model.metricValue.component();
            this.root.replaceChild(comp.root, this.metricValue.root);
            this.metricValue = comp;
        }

        if (this.metricValue instanceof Component)
            this.metricValue.update(this.model.metricValue);
    }
}
