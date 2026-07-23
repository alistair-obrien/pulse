export function render(error:string): HTMLElement {
    const element = document.createElement("div");
    element.id = "Error Screen"
    
    const output = document.createElement("pre");
    element.appendChild(output)

    const label = document.createElement("div")
    label.innerText = "Error: " + error
    element.appendChild(label)

    return element;
}