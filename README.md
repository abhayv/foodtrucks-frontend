foodtrucks-frontend
===================

Frontend for browsing food trucks in San Francisco.

The user interface is very simple. The map fills the browser screen and shows the current location of the user if possible.
The user can drag this location to any point on the map to see food trucks within a one mile square area of that location.

The user can also filter the results by any query.

The data pulled is from https://data.sfgov.org/Permitting/Mobile-Food-Facility-Permit/rqzj-sfat which shows what food truck permits have been issued by the city of San Francisco.

The corresponding backend to be used is at abhayv/foodtrucks-backend.

Future UI improvements:

1) Add a drop down for miles to look from the current location.
2) Allow a search box to set the current location in addition to dragging the marker.

Testing
-------

run:
nosetests

Browser testing:
The app has been mostly tested with Chrome and Safari on Mac OS X and Chrome on Android. In future, we can test other
browsers. We use some CSS3 but most modern browsers should be supported.
