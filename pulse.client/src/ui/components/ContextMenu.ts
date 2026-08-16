import '../styles/context-menu.css';
import { ActionButton, ActionButtonModel } from './ActionButton';
import { Card, CardModel } from './Card';
import { Component, ComponentModel } from "./Component";

export class ContextMenu extends Component<ContextMenuModel> {

    private readonly card:Card;

    constructor() {
        super();

        this.root.className = "context-menu-backdrop";
        this.card = new Card();
        this.root.append(this.card.root);
    }

    protected render(): void {
        
        if (this.model.isOpen) {
            this.root.classList.add("visible")
        } else {
            this.root.classList.remove("visible")
        }
        this.root.onclick = () => { 
            this.model.close();
            this.update(this.model);
        }


        const cardModel = new CardModel({
            content: []
        });

        for (const item of this.model.items) {
            const actBtn = new ActionButtonModel({
                labelStr: item.label, 
                iconClass: item.iconClass ?? "", 
                onClick: () => { 
                    this.model.close(),
                    item.onClick(); 
                }});

            cardModel.content.push(actBtn);
        }

        console.log(JSON.stringify(cardModel));
        this.card.update(cardModel);
    }
}

export interface ContextMenuItem {
    label: string;
    iconClass?: string;
    onClick: () => void;
}

export class ContextMenuModel extends ComponentModel<ContextMenu> {
    readonly component = ContextMenu;
    items: ContextMenuItem[];
    isOpen: boolean;

    constructor(args: {
        items: ContextMenuItem[];
        isOpen: boolean;
    }) {
        super();
        this.items = args.items;
        this.isOpen = args.isOpen;
    }

    close() {
        this.isOpen = false;
    }
}