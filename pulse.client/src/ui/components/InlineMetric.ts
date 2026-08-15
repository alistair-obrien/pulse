import { Component, ComponentModel } from "./Component";
import { Div } from "./Div";

export class InlineMetricModel extends ComponentModel<InlineMetric> {
    readonly component = InlineMetric;

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

export class InlineMetric extends Component<InlineMetricModel> {

    private metricValue: Component<any>;
    private icon: HTMLElement;

    constructor() {
        super();
        this.root.className = "inline-metric";

        this.metricValue = new Div();
        
        this.icon = document.createElement("i");
        
        this.root.append(
            this.icon, 
            this.metricValue.root
        );
    }

    render() {

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