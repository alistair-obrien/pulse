import '../styles/profile-thumbnail.css';

const PLACEHOLDER_IMAGE = "https://picsum.photos/id/696/50/50";

export class ProfileThumbnail {
    readonly root: HTMLButtonElement;

    constructor(
        imageUrl: string,
        onClick: (this: GlobalEventHandlers, ev: PointerEvent) => any
    ) {
        this.root = document.createElement("button");
        this.root.className = "profile-thumbnail";
        this.root.onclick = onClick;
        this.root.type = "button";

        const image = document.createElement("img");
        image.src = imageUrl || PLACEHOLDER_IMAGE;
        image.alt = "Profile";
        image.draggable = false;

        this.root.append(image);
    }
}

