import { Card } from "../components/Card";

export function render(): HTMLElement {
        const root = document.createElement("div");
    
        const card = new Card("API Settings");
        root.append(card.root);
    
        card.addContent(
            "Hello",
            "There",
            "Hehe"
        );
    
        return root;
}