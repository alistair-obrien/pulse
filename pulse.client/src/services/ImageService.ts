const imageIds = [
    11, 
    13, 
    17, 
    29, 
    27, 
    38, 
    49, 
    62, 
    66, 
    128, 
    179, 
    213, 
    222, 
    231, 
    327, 
    350,
    362,
    365,
    368,
    381,
    392,
    404,
    443
]

export class ImageService {

    getRandomImageUrl(seed:number):string {

        const index = seed % imageIds.length;
        const imageId = imageIds[index];

        return `https://picsum.photos/id/${imageId}/400/400.webp`
    }

    async selectImage(): Promise<string | null> {
        return new Promise(resolve => {
            const input = document.createElement("input");

            input.type = "file";
            input.accept = "image/*";

            input.onchange = async () => {
                const file = input.files?.[0];

                if (!file) {
                    resolve(null);
                    return;
                }

                try {
                    const image = await this.loadImage(file);

                    const size = 512;
                    const scale = Math.min(
                        size / image.width,
                        size / image.height,
                        1
                    );

                    const canvas = document.createElement("canvas");

                    canvas.width = image.width * scale;
                    canvas.height = image.height * scale;

                    const context = canvas.getContext("2d");

                    if (!context) {
                        resolve(null);
                        return;
                    }

                    context.drawImage(
                        image,
                        0,
                        0,
                        canvas.width,
                        canvas.height
                    );

                    resolve(
                        canvas.toDataURL("image/jpeg", 0.85)
                    );
                }
                catch {
                    resolve(null);
                }
            };

            input.click();
        });
    }

    private loadImage(file: File): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const image = new Image();

            image.onload = () => resolve(image);
            image.onerror = reject;

            image.src = URL.createObjectURL(file);
        });
    }
}