import '../styles/footer.css';

import { ActionButton } from "./ActionButton";

export class Footer {

    private readonly footerInner:HTMLElement;
    readonly root:HTMLElement;

    constructor() {
        this.root = document.createElement("div");
        this.root.className = "footer";

        this.footerInner = document.createElement("div");
        this.footerInner.className = "footer-inner";
        this.root.append(this.footerInner);
    }

    appendButton(button:ActionButton) {

        this.footerInner.append(button.root);
    }
}