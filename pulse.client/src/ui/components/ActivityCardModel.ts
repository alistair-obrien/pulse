import { Component, ComponentModel } from "./Component";
import { TimeSpan, TimeSpanModel } from "./TimeSpan";

export class ActivityCardModel extends ComponentModel<ActivityCard> {
    readonly component = ActivityCard;

    readonly name: string;
    readonly duration: TimeSpanModel;
    readonly activityType: string;

    constructor(args: {
        name: string;
        duration: TimeSpanModel;
        activityType: string;
    }) {
        super();

        this.name = args.name;
        this.duration = args.duration;
        this.activityType = args.activityType;
    }
}

export class ActivityCard extends Component<ActivityCardModel> {

    private name: HTMLElement;
    private duration: TimeSpan;
    private image: HTMLImageElement;

    constructor() {
        super();
        this.root.className = "activity-card";

        this.image = document.createElement("img");
        this.image.className = "activity-icon";

        this.name = document.createElement("div");
        this.name.className = "activity-name";

        this.duration = new TimeSpan();

        this.root.append(
            this.name,
            this.image,
            this.duration.root
        );
    }

    render() {
        this.name.textContent = this.getActivityHumanName(this.model.name);

        this.image.onerror = () => {
            this.image.onerror = null;
            this.image.src = "/images/activity icons/other.png";
        };

        this.image.src = this.getActivityImage(this.model.activityType);
        this.image.alt = this.model.name;

        this.duration.update(this.model.duration);
    }

    private getActivityImage(activityType: string): string {
        return `/images/activity icons/${activityType}.png`;
    }

    private getActivityHumanName(activityType: string): string {
        return activityType
            .replace(/([a-z])([A-Z])/g, "$1 $2")
            .replace(/^./, char => char.toUpperCase());
    }
}