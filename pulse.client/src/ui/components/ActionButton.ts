import '../styles/action-button.css';
import { Component, ComponentModel } from './Component';

export class ActionButtonModel extends ComponentModel<ActionButton> {

    readonly component = ActionButton;

    iconClass:string;
    labelStr:string;
    onClick: ((this: GlobalEventHandlers, ev: PointerEvent) => any) | null;

    constructor(args: {
        iconClass:string;
        labelStr:string;
        onClick: ((this: GlobalEventHandlers, ev: PointerEvent) => any) | null;
    }) {
        super();

        this.iconClass = args.iconClass;
        this.labelStr = args.labelStr;
        this.onClick = args.onClick;
    }
}

export class ActionButton extends Component<ActionButtonModel> {

    private readonly label: HTMLSpanElement;
    private readonly icon: HTMLElement;

    //labelStr:string, iconClass:string, onClick: (this: GlobalEventHandlers, ev: PointerEvent) => any

    constructor() {
    
        super("button");
        this.root.className = "action-button";

        this.icon = document.createElement("i");
        
        this.label = document.createElement("span");

        this.root.append(this.icon, this.label);
    }
    
    protected render(): void {
        this.root.onclick = this.model.onClick;
        this.icon.className = this.model.iconClass;
        this.label.textContent = this.model.labelStr;
    }

    changeIcon(icon: string) {
        this.icon.className = icon;
    }

    markSelected(value:boolean) {
        if (value) {
            this.root.classList.add("selected");
        }
        else
        {
            this.root.classList.remove("selected");
        }
    }
}