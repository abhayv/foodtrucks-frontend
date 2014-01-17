/* Copyright (C) 2014 Abhay Vardhan. All Rights Reserved.
 *
 * Author: abhay.vardhan@gmail.com
 *
 * Functions to abstract API calls to the server
 */

/* In a larger project, one would use Javascript modules to encapsulate the API properly, but keep it simple for now */

var HOSTNAME = "sf-abhay.appspot.com";
//var HOSTNAME = "localhost:8080";
/**
 * Call the server API to get the food trucks information. In real world, there will be an API token but we ignore
 * that for now.
 * @param query
 * @param nearLat
 * @param nearLong
 * @param callback
 */
function getFoodTrucksMatching(query, southWestLat, southWestLng, northEastLat, northEastLng, callback) {
  var searchAPI = "http://" + HOSTNAME + "/search?jsoncallback=?";

  // In production code, we will also handle the error cases here.
  $.getJSON(searchAPI, {
    query: query,
    southWestLat: southWestLat,
    southWestLng: southWestLng,
    northEastLat: northEastLat,
    northEastLng: northEastLng
  }).done(function (data) {
      callback(data);
    });
}
