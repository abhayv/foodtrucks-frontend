/* Copyright (C) 2014 Abhay Vardhan. All Rights Reserved.
 *
 * Author: abhay.vardhan@gmail.com
 *
 * Functions to abstract API calls to the server
 */

/* In a larger project, one would use Javascript modules to encapsulate the API properly, but keep it simple for now */

function getFoodTrucksMatching(query, callback) {
  var random = Math.floor((Math.random() * 100) + 1);
  callback(sampleFoodTrucksData.slice(random, random + 2));
}