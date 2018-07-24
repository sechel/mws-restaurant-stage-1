import { Restaurant, DB } from './db';
const RESPONSIVE_SIZES = WEBPACK_RESPONSIVE_SIZES;

export class Utility {

    public static generateSrcSet(imageName: string): string[] {
        const regExp = /(.*)\.([a-z]*)/
        const match = imageName.match(regExp);
        const name = match[1];
        const ext = match[2];
        return RESPONSIVE_SIZES.map(size => `${name}-${size}.${ext} ${size}w`);
    }

    public static generateLowResSrc(imageName: string): string {
        const regExp = /(.*)\.([a-z]*)/
        const match = imageName.match(regExp);
        const name = match[1];
        const ext = match[2];
        const lowResSize = RESPONSIVE_SIZES[0];
        return `${name}-${lowResSize}.${ext}`;
    }

    public static getSizes(): string[] {
        return RESPONSIVE_SIZES.map(size => `(max-width: ${size}px) ${size}px`)
    }

    public static createStar(restaurant: Restaurant, root: HTMLElement) {
        const star = document.createElement('button');
        star.setAttribute('aria-label', 'set favorite');
        star.classList.add('star');
        star.classList.add('fa-star');
        star.classList.add((restaurant.is_favorite === 'true') ? 'fas' : 'far');
        star.addEventListener('click', async () => {
            restaurant.is_favorite = (restaurant.is_favorite === 'true') ? 'false' : 'true';
            star.classList.remove('fas');
            star.classList.remove('far');
            star.classList.add((restaurant.is_favorite === 'true') ? 'fas' : 'far');
            await DB.setFavorite(restaurant.id, restaurant.is_favorite);
        });
        root.appendChild(star);
    }

}
