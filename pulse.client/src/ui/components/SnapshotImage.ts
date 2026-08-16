import '../styles/snapshots.css';
import { Component, ComponentModel } from './Component';

const PLACEHOLDER_IMAGE = "https://picsum.photos/id/696/50/50";

export class SnapshotImage extends Component<SnapshotImageModel> {

    image: HTMLImageElement;

    constructor() {
        super();

        this.root.className = "snapshot";

        this.image = document.createElement("img");
        this.image.alt = "Snapshot";
        this.image.draggable = false;

        this.root.append(this.image);

        this.root.addEventListener("contextmenu", (event) => {
            event.preventDefault();
            this.model.onContextMenuRequest?.(event);
        });
    }

    protected render(): void {
        this.image.src = this.model.imageUrl;
    }
}

export class SnapshotImageModel extends ComponentModel<SnapshotImage> {
    readonly component = SnapshotImage;

    imageUrl: string;
    onContextMenuRequest?: (event: MouseEvent) => void;

    constructor(args: {
        imageUrl: string;
        onContextMenuRequest?: (event: MouseEvent) => void;
    }) {
        super();

        this.imageUrl = args.imageUrl || PLACEHOLDER_IMAGE;
        this.onContextMenuRequest = args.onContextMenuRequest;
    }
}
