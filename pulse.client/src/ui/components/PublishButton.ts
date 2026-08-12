import { Component, ComponentModel } from './Component';
import { ICONS } from './ICONS';

export class PublishButtonModel extends ComponentModel<PublishButton> {

    readonly component = PublishButton;

    published: boolean;
    onClick: ((this: GlobalEventHandlers, ev: PointerEvent) => any) | null;

    constructor(args: {
        published: boolean;
        onClick: ((this: GlobalEventHandlers, ev: PointerEvent) => any) | null;
    }) {
        super();

        this.published = args.published;
        this.onClick = args.onClick;
    }
}

export class PublishButton extends Component<PublishButtonModel> {

    private readonly icon: HTMLElement;
    private readonly label: HTMLSpanElement;

    constructor() {
        super("button");

        this.root.className = "publish-button";

        this.icon = document.createElement("i");
        this.label = document.createElement("span");

        this.root.append(this.icon, this.label);
    }

    protected render(): void {
        this.root.onclick = this.model.onClick;

        if (this.model.published) {
            this.root.classList.add("published");
            this.icon.className = ICONS.PublishedToServer;
            this.label.textContent = "Published";
        }
        else {
            this.root.classList.remove("published");
            this.icon.className = ICONS.PublishToServer;
            this.label.textContent = "Publish";
        }
    }
}
