import { Component, ComponentModel } from "../components/Component";
import { ActionButton, ActionButtonModel } from "../components/ActionButton";
import { ICONS } from "../components/ICONS";

export class JourneyContextPopup extends Component<JourneyContextPopupModel> {

    private readonly editButton = new ActionButton();
    private readonly unpublishButton = new ActionButton();

    constructor() {
        super();

        this.root.className = "journey-context-popup";

        this.root.append(
            this.editButton.root,
            this.unpublishButton.root
        );
    }

    protected render(): void {
        this.editButton.update(this.model.editButton);
        this.unpublishButton.update(this.model.unpublishButton);

        if (this.model.visible) this.show();
        else this.hide();
    }

    show() {
        console.log("Hi");
        this.root.classList.add("visible");
    }

    hide() {
        console.log("There");
        this.root.classList.remove("visible");
    }
}

export class JourneyContextPopupModel
    extends ComponentModel<JourneyContextPopup> {

    readonly component = JourneyContextPopup;

    readonly editButton: ActionButtonModel;
    readonly unpublishButton: ActionButtonModel;

    visible = false;

    constructor(args: {
        onEdit: () => void;
        onUnpublish: () => void;
    }) {
        super();

        this.editButton = new ActionButtonModel({
            iconClass: ICONS.Edit,
            labelStr: "Edit",
            onClick: args.onEdit
        });

        this.unpublishButton = new ActionButtonModel({
            iconClass: ICONS.Delete,
            labelStr: "Unpublish",
            onClick: args.onUnpublish
        });
    }
}