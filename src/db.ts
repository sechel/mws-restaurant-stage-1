import { Restaurant, Review } from './db';
import 'google-maps';

export interface OpeningHours {
  Monday: string;
  Tuesday: string;
  Wednesday: string;
  Thursday: string;
  Friday: string;
  Saturday:string;
  Sunday: string;
}

export interface LatitudeLongitude {
  lat: number;
  lng: number;
}

export type Favorite = 'true' | 'false';

export interface Restaurant {
  id: number;
  name: string;
  neighborhood: string;
  photograph: number;
  address: string;
  latlng: LatitudeLongitude,
  cuisine_type: string;
  operating_hours: OpeningHours;
  createdAt: number;
  updatedAt: string;
  is_favorite: Favorite;
}

export interface Review {
  id: number,
  restaurant_id: number,
  name: string,
  createdAt: number,
  updatedAt: number,
  rating: number,
  comments: string
}

/**
 * Common database helper functions.
 */
export class DB {

  /**
   * Database API.
   */
  public static get DATABASE_URL() {
    return WEBPACK_API_HOST;
  }

  /**
   * Fetch all restaurants.
   */
  public static async fetchRestaurants(): Promise<Array<Restaurant>> {
    const response = await fetch(DB.DATABASE_URL + 'restaurants');
    return response.json();
  }

  /**
   * Fetch a restaurant by its ID.
   */
  public static async fetchRestaurantById(id): Promise<Restaurant> {
    const response = await fetch(DB.DATABASE_URL + 'restaurants/' + id);
    return response.json();
  }

  public static async fetchReviewsByRestaurantId(id): Promise<Array<Review>> {
    const response = await fetch(DB.DATABASE_URL + `reviews/?restaurant_id=${id}`);
    return response.json();
  }

  public static async setFavorite(id: number, favorite: Favorite): Promise<Restaurant> {
    const response = await fetch(
      DB.DATABASE_URL + `restaurants/${id}/?is_favorite=${favorite}`,
      { method: 'PUT' }
    )
    return response.json();
  }

  public static async fetchRestaurantsByCuisine(cuisine): Promise<Array<Restaurant>> {
    const restaurants = await DB.fetchRestaurants()
    return restaurants.filter(r => r.cuisine_type == cuisine);
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  public static async fetchRestaurantsByNeighborhood(neighborhood): Promise<Array<Restaurant>> {
    const restaurants = await DB.fetchRestaurants()
    return restaurants.filter(r => r.neighborhood == neighborhood);
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  public static async fetchRestaurantsByCuisineAndNeighborhood(cuisine, neighborhood): Promise<Array<Restaurant>> {
    let restaurants = await DB.fetchRestaurants();
    if (cuisine !== 'all') { // filter by cuisine
      restaurants = restaurants.filter(r => r.cuisine_type == cuisine);
    }
    if (neighborhood !== 'all') { // filter by neighborhood
      restaurants = restaurants.filter(r => r.neighborhood == neighborhood);
    }
    return restaurants;
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  public static async fetchNeighborhoods(): Promise<Array<string>> {
    const restaurants = await DB.fetchRestaurants();
    const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
    return neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  public static async fetchCuisines(): Promise<Array<string>> {
    const restaurants = await DB.fetchRestaurants();
    const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type);
    return cuisines.filter((v, i) => cuisines.indexOf(v) == i);
  }

  /**
   * Restaurant page URL.
   */
  public static urlForRestaurant(restaurant): string {
    return `./restaurant.html?id=${restaurant.id}`;
  }

  /**
   * Restaurant image URL.
   */
  public static imageUrlForRestaurant(restaurant): string {
    if (restaurant.photograph) {
      return (`/img/${restaurant.photograph}.jpg`);
    } else {
      return 'img/default.jpg';
    }
  }

  /**
   * Map marker for a restaurant.
   */
  public static mapMarkerForRestaurant(restaurant: Restaurant, map: google.maps.Map) {
    return new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      map,
      animation: google.maps.Animation.DROP}
    );
  }

}
