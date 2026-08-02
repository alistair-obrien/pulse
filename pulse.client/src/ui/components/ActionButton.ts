import '../styles/action-button.css';

export class ActionButton {
    readonly root:HTMLElement;

    private readonly icon;

    constructor(labelStr:string, iconClass:string, onClick: (this: GlobalEventHandlers, ev: PointerEvent) => any) {
        this.root = document.createElement("button");
        this.root.className = "action-button";

        this.icon = document.createElement("i");
        this.icon.className = iconClass;

        const label = document.createElement("span");
        label.textContent = labelStr;

        this.root.onclick = onClick;

        this.root.append(this.icon, label);
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