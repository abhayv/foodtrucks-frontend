/* Copyright (C) 2014 Abhay Vardhan. All Rights Reserved.
 *
 * Author: abhay.vardhan@gmail.com
 *
 */

// Assumes that maps.googleapis.com/maps/api/js?v=3 is available

(function () { // self-invoking, anonymous function for encapsulation

  var DEFAULT_LAT = 37.7833;
  var DEFAULT_LONG = -122.4167;
  var DEFAULT_ZOOM = 14;
  var DEFAULT_SEARCH = '';
  var DEFAULT_SQUARE_SIDE_MILES = 2; // find places in a square of 10 miles with the currect location in the center
  var DEBUG = false;

  /* Global map variable which holds the Google map object */
  var map;
  var spinner;

  // The current set of food trucks shown
  var currentFoodTrucks = [];

  var currentLocationMarker;
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
    search(currentQuery, lat, lng);

    console.log("Adding listener");

    google.maps.event.addListener(marker, 'dragend', function(evt) {
      console.log('Dragged to ' +  evt.latLng.lat() + ' ' + evt.latLng.lng());
      search(currentQuery, evt.latLng.lat(), evt.latLng.lng());
    });
  }

  /**
   * Get current location of the user using browser's geolocation support. If successful, display a home marker
   * for users location.
   */
  function getCurrentLocation() {
    // Check to see if this browser supports geolocation.
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
   * Search
   * @param query to search
   * @param nearLat Latitiude of location near which to search
   * @param nearLong Longitude of location near which to search
   */
  function search(query, nearLat, nearLong) {
    console.log("Searching " + query +  " " + nearLat + " " + nearLong);
    spinner.spin();

    // remove old markers
    for (var i = 0; i < currentFoodTrucks.length; i++ ) {
      currentFoodTrucks[i].setMap(null);
    }
    currentFoodTrucks = [];

    // Ideally, we should do a geospatial query for a circle around the target point. We approximate this
    // by a square.
    var dist = DEFAULT_SQUARE_SIDE_MILES / 2 * 1609.34; // convert miles to meters
    var point = new google.maps.LatLng(nearLat, nearLong);
    var eastPoint = google.maps.geometry.spherical.computeOffset(point, dist, 90.0);
    var westPoint = google.maps.geometry.spherical.computeOffset(point, dist, 270.0);
    var northPoint = google.maps.geometry.spherical.computeOffset(point, dist, 0.0);
    var southPoint = google.maps.geometry.spherical.computeOffset(point, dist, 180.0);

    if (DEBUG) {
      // show a rectangle to check
      var rectangle = new google.maps.Rectangle({
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#FF0000',
        fillOpacity: 0.35,
        map: map,
        bounds: new google.maps.LatLngBounds(
          new google.maps.LatLng(southPoint.lat(), westPoint.lng()),
          new google.maps.LatLng(northPoint.lat(), eastPoint.lng()))
      });
    }

    getFoodTrucksMatching(query, southPoint.lat(), westPoint.lng(), northPoint.lat(), eastPoint.lng(), function(data) {
      for (var i = 0, j = data.length; i < j; i++) {
        (function () { // self-invoking, anonymous function for encapsulation

          var contentString = data[i].applicant + '<br/>' + data[i].fooditems;
        var title = data[i].applicant;
        var latLng = new google.maps.LatLng(data[i].latitude, data[i].longitude);

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
        }());

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
    $('#search input').keypress(function (e) {
      if (e.which == 13) {
        currentQuery = $(this).val();
        console.log("query " + currentQuery);
        search(currentQuery, currentLocationMarker.getPosition().lat(), currentLocationMarker.getPosition().lng());
        e.preventDefault();
      }
    });
    $('.search-button').click(function (e) {
      currentQuery = $('#search input').val();
      console.log("query " + currentQuery);
      search(currentQuery, currentLocationMarker.getPosition().lat(), currentLocationMarker.getPosition().lng());
    });
  }

  google.maps.event.addDomListener(window, 'load', initialize);

}());
