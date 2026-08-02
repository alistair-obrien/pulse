import "../styles/card.css";

export class Card {
    readonly root: HTMLDivElement;

    constructor(...content: (Node | string)[]) {
        this.root = document.createElement("div");
        this.root.className = "card";

        if (content.length) {
            this.root.append(...content);
        }
    }

    append(...content: (Node | string)[]): this {
        this.root.append(...content);
        return this;
    }
}

export class CardHeader {
    readonly root: HTMLHeadingElement;

    constructor(title: string, iconClass = "") {
        this.root = document.createElement("h3");

        const row = document.createElement("span");
        row.className = "card-header";

        if (iconClass) {
            const icon = document.createElement("i");
            icon.className = iconClass;
            row.append(icon);
        }

        const text = document.createElement("span");
        text.textContent = title;
        row.append(text);

        this.root.append(row);
    }
}