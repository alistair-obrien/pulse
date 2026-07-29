export class TextLine {

    readonly root: HTMLElement;

    private readonly textArea: HTMLTextAreaElement;
    private readonly setter?: (value: string) => void;
    private readonly getter?: () => string;

    constructor(
        label: string,
        setter?: (value: string) => void,
        getter?: () => string
    ) {
        this.setter = setter;
        this.getter = getter;

        this.root = document.createElement("span");

        const labelElement = document.createElement("label");
        labelElement.textContent = label;
        this.root.append(labelElement);

        this.textArea = document.createElement("textarea");
        this.root.append(this.textArea);

        this.refresh();

        this.textArea.addEventListener("input", () => {
            this.setter?.(this.textArea.value);
        });
    }

    refresh(): void {
        if (this.getter) {
            this.textArea.value = this.getter();
        }
    }

    get value(): string {
        return this.textArea.value;
    }

    set value(value: string) {
        this.textArea.value = value;
        this.setter?.(value);
    }
}