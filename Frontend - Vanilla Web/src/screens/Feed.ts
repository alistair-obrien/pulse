export function render(): HTMLElement {
    const element = document.createElement("div");
    element.id = "Feed Screen"
    
    const output = document.createElement("pre");
    element.appendChild(output)

    const label = document.createElement("div")
    label.innerText = "HEJ HEJ HEJ"
    element.appendChild(label)

    return element;
}