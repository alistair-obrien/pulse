import { Card } from "../components/Card";
import { TextLine } from "../components/TextLine";
import * as HEVY from "../../platform/hevy";

export function render(): HTMLElement {
    const root = document.createElement("div");

    const card = new Card("API Settings");
    root.append(card.root);

    const textLine = new TextLine(
        "Hevy API Key",
        HEVY.setAPIKey,
        HEVY.getAPIKey
    );

    card.addContent(textLine.root);

    return root;
}