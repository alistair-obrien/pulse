import { Component, ComponentModel } from "./Component";
import { MetricText, MetricTextModel } from "./MetricText";

//01:51:00
//13.933333333333334
export class TimeSpanModel extends ComponentModel<TimeSpan> {
    readonly component = TimeSpan;

    time: number | string

    constructor(args: { time: number | string }) {
        super();

        this.time = args.time;
    }
}

export class TimeSpan extends Component<TimeSpanModel> {
    hours: MetricText;
    minutes: MetricText;
    // seconds: MetricText;

    constructor() {
        super();
        this.root.className = "metric-time-span";

        this.hours = new MetricText();
        this.append(this.hours);
        
        this.minutes = new MetricText();
        this.append(this.minutes);

        // this.seconds = new MetricText();
        // this.append(this.seconds);
    }

    protected render(): void {
        let hours: number;
        let minutes: number;

        if (typeof this.model.time === "number") {
            hours = Math.floor(this.model.time);
            minutes = Math.round((this.model.time - hours) * 60);
        } else {
            const [h, m] = this.model.time.split(":").map(Number);
            hours = h;
            minutes = m;
        }

        if (hours > 0) {
            this.hours.update(new MetricTextModel( { value: hours.toString(), unit: "h" }));
        }

        this.minutes.update(new MetricTextModel({ value: minutes.toString(), unit: "m" }));
    }
}