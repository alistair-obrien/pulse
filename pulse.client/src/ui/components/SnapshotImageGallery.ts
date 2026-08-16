import '../styles/snapshots.css';
import { Component, ComponentModel } from './Component';
import type { SnapshotImage, SnapshotImageModel } from './SnapshotImage';

export class ImageSlideGallery extends Component<ImageSlideGalleryModel> {

    imageComponents: SnapshotImage[] = [];

    private track: HTMLDivElement;
    private indicators: HTMLDivElement;

    private currentIndex = 0;

    constructor() {
        super();

        this.root.className = 'image-slide-gallery';

        this.track = document.createElement('div');
        this.track.className = 'image-slide-gallery-track';

        this.indicators = document.createElement('div');
        this.indicators.className = 'image-slide-gallery-indicators';

        this.root.append(
            this.track,
            this.indicators
        );

        this.setupSwipe();
    }

    protected render(): void {

        this.track.innerHTML = '';
        this.indicators.innerHTML = '';
        this.imageComponents = [];

        this.currentIndex = 0;

        for (const imageModel of this.model.imageUrls) {

            const image = new imageModel.component();
            image.update(imageModel);

            image.root.classList.add('image-slide');

            this.imageComponents.push(image);
            this.track.append(image.root);
        }

        for (let i = 0; i < this.imageComponents.length; i++) {

            const indicator = document.createElement('div');
            indicator.className = 'gallery-indicator';

            this.indicators.append(indicator);
        }

        this.refresh();
    }

    private goTo(index: number): void {

        if (this.imageComponents.length === 0)
            return;

        this.currentIndex = Math.max(
            0,
            Math.min(index, this.imageComponents.length - 1)
        );

        this.refresh();
    }

    private next(): void {
        this.goTo(this.currentIndex + 1);
    }

    private previous(): void {
        this.goTo(this.currentIndex - 1);
    }

    private refresh(): void {

        const offset = this.currentIndex * 100;

        this.track.style.transform = `translateX(-${offset}%)`;

        const indicators =
            this.indicators.querySelectorAll<HTMLButtonElement>(
                '.gallery-indicator'
            );

        indicators.forEach((indicator, index) => {
            indicator.classList.toggle(
                'active',
                index === this.currentIndex
            );
        });
    }

    private setupSwipe(): void {

        let startX = 0;
        let currentX = 0;
        let dragging = false;

        this.track.addEventListener('pointerdown', (event) => {

            dragging = true;
            startX = event.clientX;
            currentX = startX;

            this.track.style.transition = 'none';
            this.track.setPointerCapture(event.pointerId);
        });

        this.track.addEventListener('pointermove', (event) => {

            if (!dragging)
                return;

            currentX = event.clientX;

            const delta = currentX - startX;
            const width = this.root.clientWidth;

            if (width === 0)
                return;

            // Don't allow dragging past the first slide
            if (this.currentIndex === 0 && delta > 0)
                return;

            // Don't allow dragging past the last slide
            if (this.currentIndex === this.imageComponents.length - 1 && delta < 0)
                return;

            const percent = (delta / width) * 100;

            const offset = this.currentIndex * 100 - percent;

            this.track.style.transform = `translateX(-${offset}%)`;
        });

        const finishSwipe = () => {

            if (!dragging)
                return;

            dragging = false;

            this.track.style.transition = '';

            const delta = currentX - startX;
            const threshold = this.root.clientWidth * 0.2;
            
            if (Math.abs(delta) > threshold) {

                if (delta < 0)
                    this.next();
                else
                    this.previous();

            } else {
                this.refresh();
            }
        };

        this.track.addEventListener('pointerup', finishSwipe);
        this.track.addEventListener('pointercancel', finishSwipe);
    }
}

export class ImageSlideGalleryModel
    extends ComponentModel<ImageSlideGallery> {

    readonly component = ImageSlideGallery;

    imageUrls: SnapshotImageModel[];

    constructor(args: { snapshotModels: SnapshotImageModel[] }) {
        super();

        this.imageUrls = args.snapshotModels;
    }
}