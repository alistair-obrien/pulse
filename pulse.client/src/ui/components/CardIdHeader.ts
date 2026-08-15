import { Component, ComponentModel } from "./Component";
import { ProfileThumbnail, ProfileThumbnailModel } from "./ProfileThumbnail";

// O User Name
export class CardIdHeader extends Component<CardIdHeaderModel> {

    readonly userName: HTMLElement;
    readonly userImage: ProfileThumbnail;

    constructor() {
        super("h3");

        const row = document.createElement("span");
        row.className = "card-header";
        row.classList.add("id-header");

        this.userImage = new ProfileThumbnail();
        row.append(this.userImage.root);

        this.userName = document.createElement("span");
        row.append(this.userName);

        this.root.append(row);
    }

    protected render(): void {
        this.userName.textContent = this.model.userName;
        this.userImage.update(this.model.userImage);
    }
}

export class CardIdHeaderModel extends ComponentModel<CardIdHeader> {
    readonly component = CardIdHeader;
    
    userName:string;
    userImage:ProfileThumbnailModel;

    constructor(args: { userName:string, userImage:ProfileThumbnailModel }) {
        super();

        this.userName = args.userName;
        this.userImage = args.userImage;
    }
}