(function(angular){

  'use strict';

  angular.module('tracktech.trackingYourselfMap', [])
  .controller('trackingYourselfMapCtrl', trackingYourselfMapCtrl);

  trackingYourselfMapCtrl.$inject = ['$cordovaGeolocation', '$scope', '$state'];

  function trackingYourselfMapCtrl($cordovaGeolocation, $scope, $state){

    $scope.goBack = function() {
      clearWatchGeolocation();
      deleteMap();
      $state.go('menu.home');
    };

    var posOptions = { enableHighAccuracy: false};
    var map = null, marker = null;
    $cordovaGeolocation.getCurrentPosition(posOptions)
      .then(function (position) {

        var myLatLng = {lat: position.coords.latitude, lng: position.coords.longitude};

        var mapOptions = {
          center: myLatLng,
          zoom: 16,
          mapTypeId: google.maps.MapTypeId.TERRAIN,
          scrollwheel: false
        };

        var div = document.getElementById('map');
        map = new google.maps.Map(div, mapOptions);
        $scope.map = map;

        var markerOptions = {
          map: map,
          position: myLatLng,
          title: 'You are here',
          icon : "./img/car_steering.png",
          animation: google.maps.Animation.DROP
        };

        // set the marker on the map according to the lat & lng
        marker = new google.maps.Marker(markerOptions);
        marker.setAnimation(null);
        watchGeolocationPosition();

      }, function(err) {
          // error
          alert('code: '    + err.code    + '\n' +
          'message: ' + err.message + '\n');
        });

      var watch = null;
      var markers = [];
      function watchGeolocationPosition(){

        // watch if the location is changed for the given time recurrance intervalHandle
        var watchOptions = {
          // maximumAge:120000,
          timeout : 300000,
          enableHighAccuracy: false // may cause errors if true
        };

        watch = $cordovaGeolocation.watchPosition(watchOptions);
        watch.then(
          null,
          function(err) {
            // error
          },
          function(position) {
            var myLatLng = {lat: position.coords.latitude, lng: position.coords.longitude};
            if (map !== null && map !== undefined) {
              map.panTo(myLatLng);
            }
            // update the position of the marker
            if (marker !== null && marker !== undefined) {
              marker.setPosition(myLatLng);
            }
        });
      }

      // Sets the map on all markers in the array.
      function setMapOnAll(map) {
        for (var i = 0; i < markers.length; i++) {
          markers[i].setMap(map);
        }
      }

      // Removes the markers from the map, but keeps them in the array.
      function clearMarkers() {
        setMapOnAll(null);
      }

      // Deletes all markers in the array by removing references to them.
      function deleteMarkers() {
        clearMarkers();
        markers = [];
        marker = null;
      }

      function clearWatchGeolocation(){
        if (watch !== null && watch !== undefined){
          $cordovaGeolocation.clearWatch(watch);
          watch = null;
        }
      }

      function deleteMap(){
        deleteMarkers();
        if (map !== null && map !== undefined){
          map = null;
        }
      }
  }

}(window.angular));
