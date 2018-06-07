const RESPONSIVE_SIZES = WEBPACK_RESPONSIVE_SIZES;

export class Utility {

    static generateSrcSet(imageName) {
        const regExp = /(.*)\.([a-z]*)/
        const match = imageName.match(regExp);
        const name = match[1];
        const ext = match[2];
        return RESPONSIVE_SIZES.map(size => `${name}-${size}.${ext} ${size}w`);
    }

    static generateLowResSrc(imageName) {
        const regExp = /(.*)\.([a-z]*)/
        const match = imageName.match(regExp);
        const name = match[1];
        const ext = match[2];
        const lowResSize = RESPONSIVE_SIZES[0];
        return `${name}-${lowResSize}.${ext}`;
    }

    static getSizes() {
        return RESPONSIVE_SIZES.map(size => `(max-width: ${size}px) ${size}px`)
    }

}
