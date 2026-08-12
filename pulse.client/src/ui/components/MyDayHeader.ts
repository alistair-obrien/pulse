import { Component, ComponentModel } from "./Component";
import { DateRow, type DateRowModel } from "./DateRow";
import type { Div } from "./Div";
import { PublishButton, type PublishButtonModel } from "./PublishButton";

export class MyDayHeaderModel extends ComponentModel<MyDayHeader> {
    readonly component = MyDayHeader;

    date: Date;
    dateFadeThreshold:number;
    dateFadeDistance:number;
    heroAreaVisibleHeight:number;
    dateRowModel:DateRowModel;
    publishButtonModel: PublishButtonModel;

    constructor(args: { 
        date: Date;
        dateFadeThreshold:number;
        dateFadeDistance:number;
        heroAreaVisibleHeight:number;
        publishButtonModel:PublishButtonModel;
        dateRowModel:DateRowModel;
    }) {
        super();

        this.date = args.date;
        this.dateFadeThreshold = args.dateFadeThreshold;
        this.dateFadeDistance = args.dateFadeDistance;
        this.heroAreaVisibleHeight = args.heroAreaVisibleHeight
        this.publishButtonModel = args.publishButtonModel;
        this.dateRowModel = args.dateRowModel;
    }
}

export class MyDayHeader extends Component<MyDayHeaderModel> {
    dateRow: DateRow;
    publishButton: PublishButton;

    constructor() {
        super();
        this.root.className = "header";

        this.dateRow = new DateRow();
        this.root.append(this.dateRow.root);

        this.publishButton = new PublishButton();
        this.root.append(this.publishButton.root);
    }

    // HACKS
    setContentRoot(contentRoot: Div) {
        contentRoot.root.addEventListener("scroll", () => {
            const y = contentRoot.root.scrollTop;

            const opacity = 1 - ((y - this.model.dateFadeThreshold) / (this.model.dateFadeDistance));
            this.dateRow.style.opacity = `${opacity}`;
            this.root.style.height = `${this.model.heroAreaVisibleHeight - y}px`;
        }
        );

        // If we need a top header again we can use this to smooth fade it out when scrolling
        // contentRoot.addEventListener("scroll", () => {
        //     const y = contentRoot.scrollTop;
        //     const start = HEADER_FADE_THRESHOLD;
        //     const end = HEADER_FADE_THRESHOLD + HEADER_FADE_DIST;
        //     const opacity = 1 - ((y - start) / (end - start));
        //     headerInner.style.opacity = `${opacity}`;
        // });
    }

    protected render(): void {
        this.dateRow.update(this.model.dateRowModel);
        this.publishButton.update(this.model.publishButtonModel);
    }

    // Update Children too
}
