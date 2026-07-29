import '../styles/action-button.css';

export class ActionButton  {
    readonly root:HTMLElement;

    constructor(labelStr:string, iconClass:string, onClick: (this: GlobalEventHandlers, ev: PointerEvent) => any) {
        this.root = document.createElement("button");
        this.root.className = "action-button";

        const icon = document.createElement("i");
        icon.className = iconClass;

        const label = document.createElement("span");
        label.textContent = labelStr;

        this.root.onclick = onClick;

        this.root.append(icon, label);
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