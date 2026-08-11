import '../styles/profile-thumbnail.css';
import { Component, ComponentModel } from './Component';

const PLACEHOLDER_IMAGE = "https://picsum.photos/id/696/50/50";

export class ProfileThumbnail extends Component<ProfileThumbnailModel> {
    
    image:HTMLImageElement;

    constructor() {
        super();

        // this.root = document.createElement("button");
        this.root.className = "profile-thumbnail";
        
        this.image = document.createElement("img");
        this.image.alt = "Profile";
        this.image.draggable = false;

        this.root.append(this.image);
    }
    
    protected render(): void {
        this.image.src = this.model.imageUrl;
    }
}

export class ProfileThumbnailModel extends ComponentModel<ProfileThumbnail> {
    readonly component =  ProfileThumbnail;
    
    imageUrl:string;

    constructor(args: { imageUrl:string }) {

        super();
        this.imageUrl = args.imageUrl || PLACEHOLDER_IMAGE;
    }
}
