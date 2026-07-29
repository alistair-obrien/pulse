import '../styles/card.css'

export class Card {

    readonly root:HTMLElement;
    private readonly header:HTMLElement;

    constructor(title:string = "", iconClass: string = "") {
        this.root = document.createElement("div");
        this.root.className = "card";
        this.header = document.createElement("h3");
        this.root.append(this.header);
        
        if (title || iconClass) {
            this.setHeader(title, iconClass);
        }
    }

    setHeader(title: string, iconClass: string) {
        this.header.innerHTML = 
        `<span class="card-header">
            <i class=${iconClass}></i>
            <span>${title}</span>
        </span>`;
    }

    addContent(...nodes: (Node | string)[]) {
        this.root.append(...nodes);
    }
}