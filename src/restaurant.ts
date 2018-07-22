import { DB, Restaurant, Review } from './db';
import { Utility } from './utility';
import { Lock } from 'semaphore-async-await';
import '../css/responsive.css';
import 'lazysizes';

let _restaurant: Restaurant;
let _map: google.maps.Map;
const fetchLock = new Lock


// Use the window load event to keep the page load performant
window.addEventListener('load', async () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js');
  }
  // fill in restaurant id
  const restaurant = await fetchRestaurantFromURL();
  const review_id_input = document.getElementById('review-restaurant-id') as HTMLInputElement;
  review_id_input.value = String(restaurant.id);
  const reviewButton = document.getElementById('write-review-button');
  reviewButton.addEventListener('click', toggleReviewForm);
});

function toggleReviewForm() {
  const reviewForm = document.getElementById('review-form-container');
  reviewForm.classList.toggle('unfolded');
}


async function setRating(rating: number) {
  const stars = [
    document.getElementById('rating-1'),
    document.getElementById('rating-2'),
    document.getElementById('rating-3'),
    document.getElementById('rating-4'),
    document.getElementById('rating-5')
  ];
  for (let index = 0; index < stars.length; index++) {
    const star = stars[index];
    star.classList.remove('fontawesome-star');
    star.classList.remove('fontawesome-star-empty');
    star.classList.add((index < rating) ? 'fontawesome-star' : 'fontawesome-star-empty');
  }
};
window['setRating'] = setRating;

async function postReview() {
  const form = document.getElementById('review-form') as HTMLFormElement;
  const formData = new FormData(form);
  const review = await DB.postReviewForm(formData);
  const ul = document.getElementById('reviews-list') as HTMLUListElement;
  ul.insertBefore(createReviewHTML(review), ul.firstChild);
  toggleReviewForm();
}
window['postReview'] = () => {
  window.event.preventDefault();
  postReview();
};

/**
 * Get current restaurant from page URL.
 */
async function fetchRestaurantFromURL(): Promise<Restaurant> {
  await fetchLock.acquire();
  try {
    if (_restaurant) { return _restaurant; }
    const id = getParameterByName('id');
    if (!id) { throw new Error('No restaurant id in URL'); }
    _restaurant = await DB.fetchRestaurantById(id);
    if (!_restaurant) { throw new Error(`Restaurant with id ${id} not found`); }
    fillRestaurantHTML();
    return _restaurant;
  } finally {
    fetchLock.release();
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
function fillRestaurantHTML() {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = _restaurant.name;

  const star = document.getElementById('star');
  Utility.createStar(_restaurant, star);

  const address = document.getElementById('restaurant-address');
  address.innerHTML = _restaurant.address;

  const image = document.getElementById('restaurant-img') as HTMLImageElement;
  image.className = 'restaurant-img lazyload'
  const src = DB.imageUrlForRestaurant(_restaurant);
  const srcset = Utility.generateSrcSet(src).join(',');
  image.src = Utility.generateLowResSrc(src);
  image.setAttribute('data-src', image.src);
  image.setAttribute('data-srcset', srcset);
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
function fillRestaurantHoursHTML() {
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
async function fillReviewsHTML() {
  const reviews = await DB.fetchReviewsByRestaurantId(_restaurant.id);
  reviews.reverse();
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
function createReviewHTML(review: Review) {
  const li = document.createElement('li');
  const name = document.createElement('p');
  name.innerHTML = review.name;
  li.appendChild(name);

  const date = document.createElement('p');
  const dateString = new Date(review.createdAt).toDateString();
  date.innerHTML = dateString;
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
function fillBreadcrumb() {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  breadcrumb.appendChild(li);

  const a = document.createElement('a');
  a.href = '?id=' + _restaurant.id;
  a.innerText = _restaurant.name;
  a.tabIndex = 1;
  a.setAttribute('aria-current', 'page')
  li.appendChild(a);
}

/**
 * Get a parameter by name from page URL.
 */
function getParameterByName(name: string, url?: string) {
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
fetchRestaurantFromURL().then(fillBreadcrumb);

window['initMap'] = async function() {
  const restaurant = await fetchRestaurantFromURL();
  const mapElement = document.getElementById('map');
  _map = new google.maps.Map(mapElement, {
    zoom: 16,
    center: restaurant.latlng,
    scrollwheel: false
  });
  DB.mapMarkerForRestaurant(restaurant, _map);
};