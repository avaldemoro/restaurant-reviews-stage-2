let restaurants,
neighborhoods,
cuisines
var newMap
var markers = []

/**
* Fetch neighborhoods and cuisines as soon as the page is loaded.
*/
document.addEventListener('DOMContentLoaded', (event) => {
    initMap(); // added
    fetchNeighborhoods();
    fetchCuisines();
});

/**
* Fetch all neighborhoods and set their HTML.
*/
fetchNeighborhoods = () => {
    DBHelper.fetchNeighborhoods((error, neighborhoods) => {
        if (error) { // Got an error
            console.error(error);
        } else {
            self.neighborhoods = neighborhoods;
            fillNeighborhoodsHTML();
        }
    });
}

/**
* Set neighborhoods HTML.
*/
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
    const select = document.getElementById('neighborhoods-select');
    neighborhoods.forEach(neighborhood => {
        const option = document.createElement('option');
        option.innerHTML = neighborhood;
        option.value = neighborhood;
        select.append(option);
    });
}

/**
* Fetch all cuisines and set their HTML.
*/
fetchCuisines = () => {
    DBHelper.fetchCuisines((error, cuisines) => {
        if (error) { // Got an error!
            console.error(error);
        } else {
            self.cuisines = cuisines;
            fillCuisinesHTML();
        }
    });
}

/**
* Set cuisines HTML.
*/
fillCuisinesHTML = (cuisines = self.cuisines) => {
    const select = document.getElementById('cuisines-select');

    cuisines.forEach(cuisine => {
        const option = document.createElement('option');
        option.innerHTML = cuisine;
        option.value = cuisine;
        select.append(option);
    });
}

/**
* Initialize leaflet map, called from HTML.
*/
initMap = () => {
    self.newMap = L.map('map', {
        center: [40.722216, -73.987501],
        zoom: 12,
        scrollWheelZoom: false
    });
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
        mapboxToken: 'pk.eyJ1IjoiYXN0ZXJ2IiwiYSI6ImNqaWR4a2sxODBnZnkzcXQ0a3R2aW5yenYifQ.VhIoWtMCcBzA6Y4RFelqTg',
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/" style="color: #4e342e">OpenStreetMap</a> contributors, ' +
        '<a href="https://creativecommons.org/licenses/by-sa/2.0/" style="color: #4e342e">CC-BY-SA</a>, ' +
        'Imagery © <a href="https://www.mapbox.com/" style="color: #4e342e">Mapbox</a>',
        id: 'mapbox.streets'
    }).addTo(newMap);

    updateRestaurants();
}

/**
* Update page and map for current restaurants.
*/
updateRestaurants = () => {
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

/**
* Clear current restaurants, their HTML and remove their map markers.
*/
resetRestaurants = (restaurants) => {
    // Remove all restaurants
    self.restaurants = [];
    const ul = document.getElementById('restaurants-list');
    ul.innerHTML = '';

    // Remove all map markers
    self.markers.forEach(m => m.setMap(null));
    self.markers = [];
    self.restaurants = restaurants;
}

/**
* Create all restaurants HTML and add them to the webpage.
*/
fillRestaurantsHTML = (restaurants = self.restaurants) => {
    const ul = document.getElementById('restaurants-list');
    restaurants.forEach(restaurant => {

        ul.append(createRestaurantHTML(restaurant));
    });
    addMarkersToMap();
}

/**
* Create restaurant HTML.
*/
createRestaurantHTML = (restaurant) => {
    const li = document.createElement('li');

    const image = document.createElement('img');
    image.className = 'restaurant-img';
    image.src = DBHelper.imageUrlForRestaurant(restaurant);

    const name = document.createElement('h2');
    name.innerHTML = restaurant.name;
    image.setAttribute("alt", "A photo of the \"" + restaurant.name + "\" restaurant");
    li.append(image);
    li.append(name);

    const address = document.createElement('p');
    address.innerHTML = restaurant.address;
    li.append(address);

    const neighborhood = document.createElement('p');
    neighborhood.className = 'neighborhood-type';
    neighborhood.innerHTML = restaurant.neighborhood;
    li.append(neighborhood);

    const more = document.createElement('a');
    more.className = "more-restaurant-details";
    more.innerHTML = 'View Details';
    more.tabIndex = 0;
    more.setAttribute('aria-label', 'View Details for ' + restaurant.name + ' Restaurant');
    more.href = DBHelper.urlForRestaurant(restaurant);
    li.append(more)

    return li
}

/**
* Add markers for current restaurants to the map.
*/
addMarkersToMap = (restaurants = self.restaurants) => {
    restaurants.forEach(restaurant => {
        // Add marker to the map
        const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.newMap);

        marker.on("click", onClick);

        function onClick() {
            window.location.href = marker.options.url;
        }
    });
}
