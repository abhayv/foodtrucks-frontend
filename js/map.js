/* Copyright (C) 2014 Abhay Vardhan. All Rights Reserved.
 *
 * Author: abhay.vardhan@gmail.com
 *
 */

// Assumes that maps.googleapis.com/maps/api/js?v=3 is available

(function () { // self-invoking, anonymous function for encapsulation

  /* Global map variable which holds the Google map object */
  var map;
  var spinner;

  // The current set of food trucks shown
  var currentFoodTrucks = [];

  var currentLocationMarker;

  var DEFAULT_LAT = 37.7833;
  var DEFAULT_LONG = -122.4167;
  var DEFAULT_ZOOM = 14;
  var DEFAULT_SEARCH = '';

  /**
   * Set the current location and do a search for food trucks around that.
   * @param lat
   * @param lng
   */
  function setLocation(lat, lng) {
    var contentString = 'Drag this to your location';
    var myLatlng = new google.maps.LatLng(lat, lng);

    var infowindow = new google.maps.InfoWindow({
      content:contentString,
      maxWidth:200
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
    infowindow.open(map, marker);
    google.maps.event.addListener(marker, 'click', function() {
      infowindow.open(map, marker);
    });
    currentLocationMarker = marker;

    spinner.stop();
    search(DEFAULT_SEARCH, lat, lng);

    console.log("Adding listener");

    google.maps.event.addListener(marker, 'dragend', function(evt) {
      console.log('Dragged to ' +  evt.latLng.lat() + ' ' + evt.latLng.lng());
      search(DEFAULT_SEARCH, evt.latLng.lat(), evt.latLng.lng());
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
   * Set zoom level so all markers are visible. This is a very simple implementation that simply goes up
   * a level to try including the markers. A more sophisticated version would actually calculate the exact zoom level
   * that would be needed.
   */
  function setZoomLevelForBounds(bounds) {
    try {
      console.log("Map " +  map);
      if (typeof map.getBounds == "undefined") {
        return;
      }
      var mapBounds = map.getBounds();
      if (!mapBounds.contains(bounds)) {
        var zoomLevel = map.getZoom();
        console.log("Resetting zoom level " +  zoomLevel);
        if (zoomLevel > 1) {
          map.setZoom(zoomLevel - 1);
        }
      }
    } catch(err) {
      console.log("Error in setZoomLevelForBounds " + err);
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

    var bounds = new google.maps.LatLngBounds();
    bounds.extend(currentLocationMarker.getPosition());

    getFoodTrucksMatching('', function(data) {
      for (var i = 0, j = data.length; i < j; i++) {
        var contentString = 'test';
        var title = 'test title';
        var latLng = new google.maps.LatLng(data[i].latitude, data[i].longitude);

        bounds.extend(latLng);

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

      setZoomLevelForBounds(bounds);

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
  }

  google.maps.event.addDomListener(window, 'load', initialize);

}());
