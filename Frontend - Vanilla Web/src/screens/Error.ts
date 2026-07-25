let root!: HTMLElement;
let _error :string;

export function set_error(error:string) {
    _error = error;
    rerender();
}

export async function mount(container: HTMLElement) {
    root = container;

    rerender();
}

export function rerender() {
    root.replaceChildren(render());
}

export function render(): HTMLElement {
    const element = document.createElement("div");
    element.id = "Error Screen"
    
    const output = document.createElement("pre");
    element.appendChild(output)

    const label = document.createElement("div")
    label.innerText = "Error: " + _error
    element.appendChild(label)

    return element;
}