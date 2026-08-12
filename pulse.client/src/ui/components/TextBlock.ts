

export class TextBlock {
    readonly root: HTMLElement;

    constructor(text: string) {
        this.root = document.createElement("div");
        this.root.className = "text-block";
        this.root.textContent = text;
    }
}