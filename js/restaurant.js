import { DBHelper } from './dbhelper';
import { Utility } from './utility';
import GoogleMapsLoader from 'google-maps';
import Styles from '../css/responsive.css';
import 'lazysizes';

let _restaurant;
let _map;

if ('serviceWorker' in navigator) {
  // Use the window load event to keep the page load performant
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js');
  });
}

GoogleMapsLoader.KEY = WEBPACK_GDRIVE_API_KEY;
GoogleMapsLoader.LIBRARIES = ['places'];

/**
 * Get current restaurant from page URL.
 */
const fetchRestaurantFromURL = (callback) => {
  if (_restaurant) { // restaurant already fetched!
    callback(null, _restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      _restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
const fillRestaurantHTML = () => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = _restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = _restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img lazyload'
  const src = DBHelper.imageUrlForRestaurant(_restaurant);
  image.src = Utility.generateLowResSrc(src);
  image.setAttribute('data-src', image.src);
  image.setAttribute('data-srcset', Utility.generateSrcSet(src));
  image.setAttribute('data-sizes', 'auto');
  image.alt = 'Image of restaurant ' + _restaurant.name;

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = _restaurant.cuisine_type;

  // fill operating hours
  fillRestaurantHoursHTML();
  // fill reviews
  fillReviewsHTML();
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
const fillRestaurantHoursHTML = () => {
  if (!_restaurant.operating_hours) { return; }
  const operatingHours = _restaurant.operating_hours
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
const fillReviewsHTML = () => {
  const reviews = _restaurant.reviews
  const container = document.getElementById('reviews-container');
  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
 */
const createReviewHTML = (review) => {
  const li = document.createElement('li');
  const name = document.createElement('p');
  name.innerHTML = review.name;
  li.appendChild(name);

  const date = document.createElement('p');
  date.innerHTML = review.date;
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
const fillBreadcrumb = () => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = _restaurant.name;
  li.setAttribute('aria-current', 'page')
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
const getParameterByName = (name, url) => {
  if (!url) { url = window.location.href; }
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`);
  const results = regex.exec(url);
  if (!results) { return null; }
  if (!results[2]) { return ''; }
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

/**
 * Initialize Google map, called from HTML.
 */
fetchRestaurantFromURL((error, restaurant) => {
  if (error) { // Got an error!
    console.error(error);
    return;
  }
  fillBreadcrumb();
  GoogleMapsLoader.load(google => {
    const mapElement = document.getElementById('map');
    _map = new google.maps.Map(mapElement, {
      zoom: 16,
      center: restaurant.latlng,
      scrollwheel: false
    });
    DBHelper.mapMarkerForRestaurant(restaurant, _map);
  });
});