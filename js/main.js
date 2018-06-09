import { DBHelper } from './dbhelper';
import { Utility } from './utility';
import GoogleMapsLoader from 'google-maps';
import Styles from '../css/responsive.css';

import 'lazysizes';
function requireAll(requireContext) {
  return requireContext.keys().forEach(requireContext);
}
requireAll(require.context('../img'));

let _restaurants = [];
let _neighborhoods = [];
let _cuisines = [];
let _map;
let _markers = [];

if ('serviceWorker' in navigator) {
  // Use the window load event to keep the page load performant
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js');
  });
}

GoogleMapsLoader.KEY = WEBPACK_GDRIVE_API_KEY;
GoogleMapsLoader.LIBRARIES = ['places'];
GoogleMapsLoader.load(google => {
  let loc = {
    lat: 40.722216,
    lng: -73.987501
  };
  const mapElement = document.getElementById('map');
  _map = new google.maps.Map(mapElement, {
    zoom: 12,
    center: loc,
    scrollwheel: false
  });
  Utility.removeFromTabOrder(_map, mapElement);
  updateRestaurants();
});

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', event => {
  fetchNeighborhoods();
  fetchCuisines();
});

/**
 * Fetch all neighborhoods and set their HTML.
 */
const fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) { // Got an error
      console.error(error);
    } else {
      _neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
}

/**
 * Set neighborhoods HTML.
 */
const fillNeighborhoodsHTML = () => {
  const select = document.getElementById('neighborhoods-select');
  _neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
}

/**
 * Fetch all cuisines and set their HTML.
 */
const fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      _cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
}

/**
 * Set cuisines HTML.
 */
const fillCuisinesHTML = () => {
  const select = document.getElementById('cuisines-select');

  _cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
}

/**
 * Update page and map for current restaurants.
 */
const updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    }
  })
}
window.updateRestaurants = updateRestaurants;

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
const resetRestaurants = (restaurants) => {
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
const fillRestaurantsHTML = () => {
  const ul = document.getElementById('restaurants-list');
  _restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
  });
  addMarkersToMap();
}

/**
 * Create restaurant HTML.
 */
const createRestaurantHTML = (restaurant) => {
  const details_id = 'restaurant_details_' + restaurant.id;
  const li = document.createElement('li');

  const image = document.createElement('img');
  image.className = 'restaurant-img lazyload';
  const src = DBHelper.imageUrlForRestaurant(restaurant);
  image.src = Utility.generateLowResSrc(src);
  image.setAttribute('data-src', image.src);
  image.setAttribute('data-srcset', Utility.generateSrcSet(src));
  image.setAttribute('data-sizes', 'auto');
  image.alt = 'Image of restaurant ' + restaurant.name;
  image.setAttribute('aria-details', details_id);
  li.append(image);

  const name = document.createElement('h1');
  name.innerHTML = restaurant.name;
  li.append(name);

  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  li.append(neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  li.append(address);

  const more = document.createElement('a');
  more.id = details_id;
  more.innerHTML = 'View Details';
  more.setAttribute('aria-label', 'view details for restaurant ' + restaurant.name);
  more.href = DBHelper.urlForRestaurant(restaurant);
  li.append(more)

  return li
}

/**
 * Add markers for current restaurants to the map.
 */
const addMarkersToMap = () => {
  _restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, _map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url
    });
    _markers.push(marker);
  });
}
