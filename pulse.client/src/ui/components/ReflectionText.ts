import { Component, ComponentModel } from "./Component";


export class ReflectionTextModel extends ComponentModel<ReflectionText> {
    readonly component = ReflectionText;

    text: string;

    constructor(args: { text: string; }) {
        super();
        this.text = args.text;
    }
}

export class ReflectionText extends Component<ReflectionTextModel> {
    
    constructor() {
        super();
        this.root.className = "reflections-text";
    }

    protected render(): void {
        this.root.textContent = this.model.text ? `"${this.model.text}"` : "";
    }
}