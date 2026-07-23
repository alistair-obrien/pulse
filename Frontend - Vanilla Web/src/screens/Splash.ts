export function render(): HTMLElement {
    const element = document.createElement("div");
    element.id = "Feed Screen"
    
    const output = document.createElement("pre");
    element.appendChild(output)

    const label = document.createElement("div")
    label.innerText = "PULSE BABY"
    element.appendChild(label)

    return element;
}