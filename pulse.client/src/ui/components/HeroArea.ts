import { Component, ComponentModel } from "./Component";
import type { Div } from "./Div";

//RandomImageController.getImageUrl(this.model.date.getDay())
export class HeroAreaModel extends ComponentModel<HeroArea> {
    readonly component = HeroArea;

    imageUrl:string;

    constructor(args: {     
        imageUrl:string; }) {
        super();

        this.imageUrl = args.imageUrl;
    }
}
export class HeroArea extends Component<HeroAreaModel> {
    heroImage: HTMLImageElement;

    constructor() {
        super();
        this.root.className = "hero";
        
        this.heroImage = document.createElement("img");

        this.root.append(
            this.heroImage,
        );
    }

    setContentRoot(contentRoot: Div) {
        contentRoot.root.addEventListener("scroll", () => {
        const y = contentRoot.root.scrollTop;

        this.root.style.transform =
            `translateY(${-y * 0.5}px)`;
        });
    }
    
    protected render(): void {
        this.heroImage.src = this.model.imageUrl;
    }
}
