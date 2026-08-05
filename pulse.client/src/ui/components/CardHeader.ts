import { Component, ComponentModel} from "./Component"; 

export class CardHeaderModel extends ComponentModel<CardHeader> {

    readonly component = CardHeader;

    readonly title: string;
    readonly iconClass: string;

    constructor(args: {
        title: string;
        iconClass: string;
    }) {
        super();

        this.title = args.title;
        this.iconClass = args.iconClass;
    }
}

export class CardHeader extends Component<CardHeaderModel> {
    private readonly icon: HTMLElement;
    private readonly text: HTMLSpanElement;

    constructor() {
        super("h3");

        const row = document.createElement("span");
        row.className = "card-header";

        this.icon = document.createElement("i");
        row.append(this.icon);
        
        this.text = document.createElement("span");
        row.append(this.text);
        
        this.root.append(row);
    }
    
    protected render(): void {
        if (this.model.iconClass) {
            this.icon.className = this.model.iconClass;
        }
        this.text.textContent = this.model.title;
    }
}