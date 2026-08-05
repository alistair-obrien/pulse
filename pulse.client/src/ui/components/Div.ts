import { Component, ComponentModel } from "./Component";

export class DivModel extends ComponentModel<Div> {
    readonly component = Div;

    className = "";
    content:ComponentModel<any>[]

    constructor(args?: { className:string }) {
        super();
        this.className = args?.className ?? "";
        this.content = [];
    }
}

export class Div extends Component<DivModel> {
        
    protected render(): void { 
        
        const children: HTMLElement[] = [];

        this.className = this.model.className;
        
        this.model.content.forEach(element => {
            const comp = new element.component;
            comp.update(element);
            children.push(comp.root);
        });

        this.root.replaceChildren(...children);
    }
}