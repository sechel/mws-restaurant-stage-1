import { DB, Restaurant } from './db';
import { Utility } from './utility';
import '../css/responsive.css';
import lazySizes = require('lazysizes');

lazySizesConfig.expand = 10;
lazySizes.init();

function requireAll(requireContext) {
  return requireContext.keys().forEach(requireContext);
}
requireAll(require.context('../img'));

let _restaurants: Restaurant[] = [];
let _neighborhoods: string[] = [];
let _cuisines: string[] = [];
let _map: google.maps.Map;
let _markers: google.maps.Marker[] = [];

if ('serviceWorker' in navigator) {
  // Use the window load event to keep the page load performant
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js');
  });
}

function initMap(): void{
  const loc = { lat: 40.722216, lng: -73.987501 };
  const mapElement = document.getElementById('map');
  _map = new google.maps.Map(mapElement, {
    zoom: 12,
    center: loc,
    scrollwheel: false
  });
  addMarkersToMap();
};

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', event => {
  updateRestaurants();
  fetchNeighborhoods();
  fetchCuisines();
});

/**
 * Fetch all neighborhoods and set their HTML.
 */
async function fetchNeighborhoods() {
  _neighborhoods = await DB.fetchNeighborhoods();
  fillNeighborhoodsHTML();
}

/**
 * Set neighborhoods HTML.
 */
function fillNeighborhoodsHTML() {
  const select = document.getElementById('neighborhoods-select');
  _neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.appendChild(option);
  });
}

/**
 * Fetch all cuisines and set their HTML.
 */
async function fetchCuisines() {
  _cuisines = await DB.fetchCuisines();
  fillCuisinesHTML();
}

/**
 * Set cuisines HTML.
 */
function fillCuisinesHTML() {
  const select = document.getElementById('cuisines-select');
  _cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.appendChild(option);
  });
}

/**
 * Update page and map for current restaurants.
 */
async function updateRestaurants() {
  const cSelect = document.getElementById('cuisines-select') as HTMLSelectElement;
  const nSelect = document.getElementById('neighborhoods-select') as HTMLSelectElement;

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  const restaurants = await DB.fetchRestaurantsByCuisineAndNeighborhood(cuisine, neighborhood);
  resetRestaurants(restaurants);
  fillRestaurantsHTML();
}

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
function resetRestaurants(restaurants) {
  // Remove all restaurants
  _restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  _markers.forEach(m => m.setMap(null));
  _markers = [];
  _restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
function fillRestaurantsHTML() {
  const ul = document.getElementById('restaurants-list');
  _restaurants.forEach(restaurant => {
    ul.appendChild(createRestaurantHTML(restaurant));
  });
  addMarkersToMap();
}

/**
 * Create restaurant HTML.
 */
function createRestaurantHTML(restaurant: Restaurant) {
  const details_id = 'restaurant_details_' + restaurant.id;
  const li = document.createElement('li');
  Utility.createStar(restaurant, li);

  const image = document.createElement('img');
  image.className = 'restaurant-img lazyload';
  const src = DB.imageUrlForRestaurant(restaurant);
  const srcset = Utility.generateSrcSet(src).join(',');
  image.src = Utility.generateLowResSrc(src);
  image.setAttribute('data-src', image.src);
  image.setAttribute('data-srcset', srcset);
  image.setAttribute('data-sizes', 'auto');
  image.alt = 'Image of restaurant ' + restaurant.name;
  li.appendChild(image);

  const name = document.createElement('h2');
  name.innerHTML = restaurant.name;
  li.appendChild(name);

  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  li.appendChild(neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  li.appendChild(address);

  const more = document.createElement('a');
  more.id = details_id;
  more.innerHTML = 'View Details';
  more.setAttribute('aria-label', 'view details for restaurant ' + restaurant.name);
  more.href = DB.urlForRestaurant(restaurant);
  more.tabIndex = 1;
  li.appendChild(more)

  return li
}

/**
 * Add markers for current restaurants to the map.
 */
function addMarkersToMap() {
  if (!('google' in window)) { return; }
  _restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DB.mapMarkerForRestaurant(restaurant, _map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = DB.urlForRestaurant(restaurant);
    });
    _markers.push(marker);
  });
}

// assign globals
const win = window as any;
win.initMap = initMap;
win.updateRestaurants = updateRestaurants;
