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
}