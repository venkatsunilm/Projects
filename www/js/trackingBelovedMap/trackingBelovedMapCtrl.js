
(function(angular){

  'use strict';

  angular.module('tracktech.trackingBelovedMap', [])
  .controller('trackingBelovedMapCtrl', trackingBelovedMapCtrl);

  trackingBelovedMapCtrl.$inject = ['$scope', '$state', '$cordovaGeolocation', 'liveTrackFactory', '$interval', 'getSetFactory', '$ionicPopup'];

  function trackingBelovedMapCtrl($scope, $state, $cordovaGeolocation, liveTrackFactory, $interval, getSetFactory, $ionicPopup){

    $scope.goBack = function() {
      removeInterval(instance);
      deleteMap();
      $state.go('menu.home');
    };

    var poll_delay = 100;
    var map = null, markers = [], instance = null;
    var myLatLng = {lat:  12.9208919, lng: 77.5724713};

    // get the preset lat and long from service of this user
    // var trackCode = getSetFactory.getUIDtrackCode();

    $scope.data = {};
    // User enterd track code
      var myPopup = $ionicPopup.show({
        template: '<input type="text" placeholder="Please enter track code" ng-model = "data.model">',
        title: 'Enter Track Code',
        subTitle: 'Please give us few seconds we will try to pull the track ccode from your SMS...',
        scope: $scope,
        buttons: [
          {
            text: 'Cancel',
            onTap: function(e){
              $state.go('menu.home');
            }
          },
          {
            text: '<b>Send</b>',
            type: 'button-royal',
            onTap: function(e) {
              if (!$scope.data.model) {
                  //don't allow the user to close unless he enters model...
                  e.preventDefault();
               } else {
                  return $scope.data.model;
               }
             }
          }
        ]
      });

      myPopup.then(function(trackCode) {
        console.log('trackCode!', trackCode);
        startBelovedTracking(trackCode);
      });

    function startBelovedTracking(trackCode) {
      liveTrackFactory.get(trackCode).
      then(function (response){
        // update the currentCoordinates
        myLatLng = {lat:  Number(response.data.lat), lng: Number(response.data.lng)};
        getSetFactory.setLatLng(myLatLng);
        // intialise the map
        map = initMap(myLatLng, document.getElementById('trackingBelovedMap'));
        // draw the marker
        drawMapMarker(map, getSetFactory.getLatLng(), 'Track Tech Location', 0);
        // start pooling to pull the latest data from the service
        startPollingMarkers(map, trackCode);
        // startPollingMarkers_test(map);

        // Register center and zoom level change events
        google.maps.event.addListener(map, 'center_changed', function() {
          drawMapMarker(map, getSetFactory.getLatLng(), 'Track Tech Location', 0);
        });

      });
    }
    // get the locations from the service to use saying
    function startPollingMarkers(map, trackCode){
      var prevLat = '';
      instance =  $interval(function(){
        liveTrackFactory.get(trackCode).
        then(function (response){
          // update the currentCoordinates
          myLatLng = {lat:  Number(response.data.lat), lng: Number(response.data.lng)};

          if (prevLat !== myLatLng.lat){
            prevLat = myLatLng.lat;
            getSetFactory.setLatLng(myLatLng);
            // map.setCenter(myLatLng); // The center change listener will be called...
            map.panTo(myLatLng);
            // map.setTilt(10);
          }
        });
      }, poll_delay);
    }

    function initMap(myLatLng, div){
      // inti the map options
      var mapOptions = {
        center: myLatLng,
        zoom: 16,
        mapTypeId: google.maps.MapTypeId.TERRAIN,
        scrollwheel: false
      };

      return new google.maps.Map(div, mapOptions);
    }

    var marker = null;
    function drawMapMarker(map, myLatLng, title, degree){
      if (marker !== null && marker !== undefined){
        // update the position of the marker
        marker.setPosition(myLatLng);
        markers.push(marker);
        return;
      }

      var markerOptions = {
        map: map,
        position: myLatLng,
        title: title,
        icon : "./img/car_steering.png",
        animation: google.maps.Animation.DROP
      };
      deleteMarkers();
      // update the marker
      marker = new google.maps.Marker(markerOptions);
      marker.setAnimation(null);
      // map.setCenter(myLatLng); // the center change listener will be called if there is a change
      markers.push(marker);
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
    }

    function deleteMap(){
      clearMarkers();
      if (map !== null && map !== undefined){
        map = null;
      }
    }

    function removeInterval(instance){
      $interval.cancel(instance);
    }

  var myLatLng_test = {
    val0: {lat: 12.92955, lng: 77.58015},
    val1: {lat: 12.92975, lng: 77.57995},
    val2: {lat: 12.92995, lng: 77.57975},
    val3: {lat: 12.93015, lng: 77.57955},
    val4: {lat: 12.93035, lng: 77.57935},
    val5: {lat: 12.93055, lng: 77.57915},
    val6: {lat: 12.93075, lng: 77.57895},
    val7: {lat: 12.93095, lng: 77.57875},
    val8: {lat: 12.93115, lng: 77.57855},
    val9: {lat: 12.93135, lng: 77.57835},
    val10: {lat: 12.93155, lng: 77.57815},
    val11: {lat: 12.93175, lng: 77.57795},
    val12: {lat: 12.93195, lng: 77.57775},
    val13: {lat: 12.93215, lng: 77.57755},
    val14: {lat: 12.93235, lng: 77.57735},
    val15: {lat: 12.93255, lng: 77.57715},
    val16: {lat: 12.93275, lng: 77.57695},
    val17: {lat: 12.93295, lng: 77.57675},
    val18: {lat: 12.93315, lng: 77.57655},
    val19: {lat: 12.93335, lng: 77.57635},
    val20: {lat: 12.93355, lng: 77.57615},
    val21: {lat: 12.93375, lng: 77.57595},
    val22: {lat: 12.93395, lng: 77.57575},
    val23: {lat: 12.93415, lng: 77.57555},
    val24: {lat: 12.93435, lng: 77.57535},
    val25: {lat: 12.93455, lng: 77.57515},
    val26: {lat: 12.93475, lng: 77.57495},
    val27: {lat: 12.93495, lng: 77.57475},
    val28: {lat: 12.93515, lng: 77.57455},
    val29: {lat: 12.93535, lng: 77.57435},
    val30: {lat: 12.93555, lng: 77.57415},
    val31: {lat: 12.93575, lng: 77.57395},
    val32: {lat: 12.93595, lng: 77.57375},
    val33: {lat: 12.93615, lng: 77.57355},
    val34: {lat: 12.93635, lng: 77.57335},
    val35: {lat: 12.93655, lng: 77.57315},
    val36: {lat: 12.93675, lng: 77.57295},
    val37: {lat: 12.93695, lng: 77.57275},
    val38: {lat: 12.93715, lng: 77.57255},
    val39: {lat: 12.93735, lng: 77.57235},
    val40: {lat: 12.93755, lng: 77.57215},
    val41: {lat: 12.93775, lng: 77.57195},
    val42: {lat: 12.93795, lng: 77.57175},
    val43: {lat: 12.93815, lng: 77.57155},
    val44: {lat: 12.93835, lng: 77.57135},
    val45: {lat: 12.93855, lng: 77.57115},
    val46: {lat: 12.93875, lng: 77.57095},
    val47: {lat: 12.93895, lng: 77.57075},
    val48: {lat: 12.93915, lng: 77.57055},
    val49: {lat: 12.93935, lng: 77.57035},
    val50: {lat: 12.93955, lng: 77.57015},
  };

    // get the locations from the service to use saying
    function startPollingMarkers_test(map){
      var imageIndex = -1;
      var index = -1;
      instance =  $interval(function(){
        if (index === 50) index = -1;
        index+=1;

        myLatLng = {lat:  myLatLng_test['val'+index].lat, lng: myLatLng_test['val'+index].lng};

        if (imageIndex === 1) imageIndex = -1;
        imageIndex+=1;
        var degree = 10;
        if (imageIndex === 1){
          degree = -10;
        }

        // The center change listener will be called if there is a change
        getSetFactory.setLatLng(myLatLng);
        // map.setCenter(myLatLng);
        map.panTo(myLatLng);
      }, poll_delay);
    }
  }

}(window.angular));
