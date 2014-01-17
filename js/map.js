/* Copyright (C) 2014 Abhay Vardhan. All Rights Reserved.
 *
 * Author: abhay.vardhan@gmail.com
 *
 * Main js file which populates the map with food truck markers.
 */

var mapExports = (function () { // self-invoking, anonymous function for encapsulation

  var DEFAULT_LAT = 37.7833;
  var DEFAULT_LONG = -122.4167;
  var DEFAULT_ZOOM = 14;
  var DEFAULT_SEARCH = '';
  var DEFAULT_SQUARE_SIDE_MILES = 1; // find places in a square of 1 mile with the currect location in the center

  /* Global map variable which holds the Google map object */
  var map;

  // Spinner to show while waiting for loads
  var spinner = {stop: function(){}, spin: function(){}}; // no op value to allow testing.

  // The current set of food trucks shown
  var currentFoodTrucks = [];

  // Current user location
  var currentLocationMarker;

  // Current query set by the user
  var currentQuery = DEFAULT_SEARCH;

  /**
   * Set the current location and do a search for food trucks around that.
   * @param lat
   * @param lng
   */
  function setLocation(lat, lng) {
    var contentString = '<div>Drag this to your location</div>';
    var myLatlng = new google.maps.LatLng(lat, lng);

    var infowindow = new google.maps.InfoWindow({
      content: contentString
    });

    var myLocationIcon = {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 6
    };

    var marker = new google.maps.Marker({
      position: myLatlng,
      map: map,
      icon: myLocationIcon,
      draggable: true,
      title: 'Position your location'
    });

    setTimeout(function(){
      infowindow.open(map, marker);
    }, 1000);

    google.maps.event.addListener(marker, 'click', function() {
      infowindow.open(map, marker);
    });
    currentLocationMarker = marker;

    spinner.stop();
    search(currentQuery, lat, lng, processDataItem);

    // Watch for the change in location by the user
    google.maps.event.addListener(marker, 'dragend', function(evt) {
      search(currentQuery, evt.latLng.lat(), evt.latLng.lng(), processDataItem);
    });
  }

  /**
   * Get current location of the user using browser's geolocation support. If successful, display a home marker
   * for users location and do search.
   */
  function getCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function (position) {
          setLocation(position.coords.latitude, position.coords.longitude);
        },
        function (error) {
          console.log("Something went wrong: ", error);
          setLocation(DEFAULT_LAT, DEFAULT_LONG);
        },
        {
          timeout:(5 * 1000),
          maximumAge:(1000 * 60 * 15),
          enableHighAccuracy:true
        }
      );
    }
  }

  /**
   * Calculates a square area around a point with 'edge'. Returns an array
   * [southPoint Lat, westPoint Long, northPoint Lat, eastPoint Long]
   * @param nearLat
   * @param nearLong
   */
  function squareAroundPoint(nearLat, nearLong, edge) {
    // Ideally, we should do a geospatial query for a circle around the target point. We approximate this
    // by a square.
    var dist = edge / 2 * 1609.34; // convert miles to meters
    var point = new google.maps.LatLng(nearLat, nearLong);
    var eastPoint = google.maps.geometry.spherical.computeOffset(point, dist, 90.0);
    var westPoint = google.maps.geometry.spherical.computeOffset(point, dist, 270.0);
    var northPoint = google.maps.geometry.spherical.computeOffset(point, dist, 0.0);
    var southPoint = google.maps.geometry.spherical.computeOffset(point, dist, 180.0);
    console.log([nearLat, nearLong, edge]);
    return [southPoint.lat(), westPoint.lng(), northPoint.lat(), eastPoint.lng()];
  }

  /**
   * Given a particular json result for a food truck, process it and add it to the map
   * @param dataI
   */
  function processDataItem(dataI) {
    // We could add various bits of information about the food truck here.
    var contentString = dataI.applicant + '<br/>' + dataI.fooditems;
    var title = dataI.applicant;
    var latLng = new google.maps.LatLng(dataI.latitude, dataI.longitude);

    var infowindow = new google.maps.InfoWindow({
      content: contentString,
      maxWidth: 200
    });

    var marker = new google.maps.Marker({
      position: latLng,
      map: map,
      title: title
    });
    currentFoodTrucks.push(marker);

    google.maps.event.addListener(marker, 'click', function () {
      infowindow.open(map, marker);
    });
  }

  /**
   * Search
   * @param query to search
   * @param nearLat Latitiude of location near which to search
   * @param nearLong Longitude of location near which to search
   * @param processor: function to call to process a json item representing a food truck
   */
  function search(query, nearLat, nearLong, processor) {
    console.log("Searching " + query +  " " + nearLat + " " + nearLong);
    spinner.spin();

    // remove old markers
    for (var i = 0; i < currentFoodTrucks.length; i++ ) {
      currentFoodTrucks[i].setMap(null);
    }
    currentFoodTrucks = [];

    var squareArea = squareAroundPoint(nearLat, nearLong, DEFAULT_SQUARE_SIDE_MILES);

    getFoodTrucksMatching(query, squareArea[0], squareArea[1], squareArea[2], squareArea[3], function(data) {
      for (var i = 0, j = data.length; i < j; i++) {
        processor(data[i])
      }
      spinner.stop();
    });
  }

  /**
   * Main initialize function called on document load
   */
  function initialize() {
    var target = document.getElementById('spin');
    spinner = new Spinner({}).spin(target);

    google.maps.visualRefresh = true;
    var myLatlng = new google.maps.LatLng(DEFAULT_LAT, DEFAULT_LONG);
    var mapOptions = {
      zoom: DEFAULT_ZOOM,
      center: myLatlng
    };

    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

    getCurrentLocation();

    // setup up event listeners for search box
    $('#search input').keypress(function (e) {
      if (e.which == 13) {
        currentQuery = $(this).val();
        console.log("query " + currentQuery);
        search(currentQuery, currentLocationMarker.getPosition().lat(),
          currentLocationMarker.getPosition().lng(), processDataItem);
        e.preventDefault();
      }
    });
    $('.search-button').click(function (e) {
      currentQuery = $('#search input').val();
      console.log("query " + currentQuery);
      search(currentQuery, currentLocationMarker.getPosition().lat(),
        currentLocationMarker.getPosition().lng(), processDataItem);
    });
  }

  google.maps.event.addDomListener(window, 'load', initialize);

  return {
    search: search,
    squareAroundPoint: squareAroundPoint
  };
}());
