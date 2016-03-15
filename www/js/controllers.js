angular.module('app.controllers', ['ngCordova'])

.controller('homeCtrl', function($scope, $localstorageFactory, $cordovaGeolocation, $http, $ionicPopup,
  smsFactory, getSetFactory, $rootScope, $timeout, liveTrackFactory, RegisterTrackFactory) {
  // get the UID track code for this UserUid
  registerUser();

  // collect the schedule details to show in the home screen
  $scope.displayInfo = $localstorageFactory.getObject('trackSchedule');
  getSetFactory.setLocationAddress('Trying to get your location address...');
  getSetFactory.setEmergencyContact($scope.displayInfo.emergencyContact);
  $scope.info = {
    areaName : getSetFactory.getLocationAddress()
  };
  $scope.notification = {
    status: true
  };
  // show the current currentCoordinates
  var posOptions = {timeout: 300000, enableHighAccuracy: false};
  $cordovaGeolocation.getCurrentPosition(posOptions)
    .then(function (position) {
      var lat  = position.coords.latitude;
      var lng = position.coords.longitude;
      var altitude = position.coords.altitude;
      var accuracy = position.coords.accuracy;
      var altitudeAccuracy = position.coords.altitudeAccuracy;
      var heading = position.coords.heading;
      var speed = position.coords.speed;
      var timestamp = position.timestamp;

      console.log('Altitude: '           + position.coords.altitude              +
                            'Accuracy: '           + position.coords.accuracy              +
                            'Altitude Accuracy: '  + position.coords.altitudeAccuracy      +
                            'Heading: '            + position.coords.heading               +
                            'Speed: '              + position.coords.speed                 +
                            'Timestamp: '          +  position.timestamp  );

      var url = 'http://maps.googleapis.com/maps/api/geocode/json?latlng='+lat+','+lng+'&sensor=true';
      getSetFactory.setLocationURL('https://maps.google.com/?q='+lat+','+lng);
      $http.get(url)
      .then(function(data){
        getSetFactory.setLocationAddress(data.data.results[0].formatted_address);//you get the current location here
        $scope.info.areaName = getSetFactory.getLocationAddress();
      }, function(err) {
        // error
      });

    }, function(err) {
      // error
      alert('code: '    + err.code    + '\n' +
          'message: ' + err.message + '\n');
    });

    var watch;
    function watchGeolocationPosition(){
      // watch if the location is changed for the given time recurrance intervalHandle
      var watchOptions = {
        // maximumAge: 3000,
        timeout : 300000,
        enableHighAccuracy: false // may cause errors if true
      };

      var prevlat = '', prevLng = '';
      watch = $cordovaGeolocation.watchPosition(watchOptions);
      watch.then(
        null,
        function(err) {
          // error
        },
        function(position) {
          var lat  = position.coords.latitude;
          var lng = position.coords.longitude;

          // START: store the real time data for beloved tracking....
          var data = {
            "UserUid": getSetFactory.getUIDtrackCode(),
            "lat": lat,
            "lng": lng
          };

          // check if the lat or lng is same as previous, do not push to server
          if (prevlat !== lat){
            prevlat = lat;
            liveTrackFactory.post(data);

            var url = 'http://maps.googleapis.com/maps/api/geocode/json?latlng='+lat+','+lng+'&sensor=true';
            getSetFactory.setLocationURL('https://maps.google.com/?q='+lat+','+lng);
            $http.get(url)
            .then(function(data){
              getSetFactory.setLocationAddress(data.data.results[0].formatted_address);//you get the current location here
              $scope.info.areaName = getSetFactory.getLocationAddress();
            }, function(err) {
              // error
            });
          }
      });
    }

  function clearWatchGeolocation(){
    if (watch !== null && watch !== undefined){
      // watch.clearWatch();
      $cordovaGeolocation.clearWatch(watch);
      // alert('Clear watch....... '+ watch);
      watch = null;
    }
  }

  $rootScope.$on('TimeoutResetAll', function () {
    resetAll();
  });

  function resetAll(){
    clearWatchGeolocation();
    $scope.notification.status = true;
    smsFactory.stopSMS();
  }

  // stop sending sms messages...
   $scope.showStopSMSPopup = function() {
     var alertPopup = $ionicPopup.alert({
       title: 'Alert!!! Stop Message Notification',
       template: 'No more message notifications will be sent to the emergency contact',
     });

     alertPopup.then(function(res) {
       resetAll();
     });
   };

  // Show a popup with instructions saying to whom the sms is going to be sent on what time intervals.
  $scope.showSendSMSPopup  = function(displayInfo) {
    console.log("sendSMS..................");
    $scope.data = {};
    var myPopup = $ionicPopup.show({
        // template: '<input type="text" placeholder="Hi!!!, this is my present location">',
        title: 'Alert!!! Start Message notification',
        subTitle: 'Location: ' + getSetFactory.getLocationAddress() + '. Message charges may apply as per the operator!!',
        scope: $scope,
        buttons: [
          { text: 'Cancel' },
          {
            text: '<b>Send</b>',
            type: 'button-royal',
            onTap: function(e) {
              // start the sms schedule
              clearWatchGeolocation();
              watchGeolocationPosition();
              $scope.notification.status = false;
              return displayInfo;
            }
          }
        ]
      });

      myPopup.then(function(displayInfo) {
        console.log('Tapped!', displayInfo);
        smsFactory.triggerSMS(displayInfo);
      });
  };

  function registerUser(){
    var data = {
      "name": 'venkat',
      "mobileno": '9986266682',
      "trackcode": 'venkat@1430'
    };
    RegisterTrackFactory.post(data).
    then(function (response){
      getSetFactory.setUIDtrackCode(response.data);
    });
  }
})

.controller('trackingRequestCtrl', function($scope, $state, $localstorageFactory, $ionicPopup, smsFactory, getSetFactory) {

  $scope.goBack = function() {
    $state.go('menu.home');
  };

  $scope.register = {
    firstname: '',
    lastname: '',
    trackCode: getSetFactory.getUIDtrackCode()
  };

  $scope.saveandSendData = function (){

    // $scope.register.trackCode = getSetFactory.getUIDtrackCode();
    $localstorageFactory.setObject('NameTrackCodeData', {
      firstname: $scope.register.firstname,
      lastname: $scope.register.lastname,
      trackCode: $scope.register.trackCode
    });
    sendMessageToEMC();
  };

  function sendMessageToEMC() {
    var myPopup = $ionicPopup.show({
        // template: '<input type="text" placeholder="Hi!!!, this is my present location">',
        title: 'Alert!!! Track Code',
        subTitle: 'Track Code will be sent to the Emergency Contact provided in the settings, for live tracking. Message charges may apply as per the operator!!',
        scope: $scope,
        buttons: [
          { text: 'Cancel' },
          {
            text: '<b>Send</b>',
            type: 'button-royal',
            onTap: function(e) {
              // start the sms schedule
              return $localstorageFactory.getObject('NameTrackCodeData');
            }
          }
        ]
      });

      myPopup.then(function(nameTrackCode) {
        console.log('nameTrackCode!', nameTrackCode);
        nameTrackCode.emergencyContact = getSetFactory.getEmergencyContact();
        smsFactory.triggerTrackCode(nameTrackCode);
      });
  }

})

.controller('trackingScheduleCtrl', function($scope, $localstorageFactory, getSetFactory) {
  $scope.trackSchedule = {
    emergencyContact: '',
    recurrance: '',
    totalDuration: ''
  };

  $scope.saveTrackSchedules = function (){
    $localstorageFactory.setObject('trackSchedule', {
      emergencyContact: $scope.trackSchedule.emergencyContact,
      recurrance: $scope.trackSchedule.recurrance,
      totalDuration: $scope.trackSchedule.totalDuration
    });
  };

})

.controller('trackingYourselfMapCtrl', function($cordovaGeolocation, $scope, $state){

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
})

.controller('trackingBelovedMapCtrl', function($scope, $state, $cordovaGeolocation, liveTrackFactory, $interval, getSetFactory, $ionicPopup){

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
})
.controller("pathMapCtrl", function($scope, $state){

  $scope.goBack = function() {
    // removeInterval(instance);
    // deleteMap();
    $state.go('menu.home');
  };

  var marker1, marker2;
  var poly, geodesicPoly;

  initMap();

  function initMap() {
    var map = new google.maps.Map(document.getElementById('pathMap'), {
      zoom: 16,
      center: {lat: 12.930217, lng: 77.579651}
    });

    map.controls[google.maps.ControlPosition.TOP_CENTER].push(
        document.getElementById('info'));

    marker1 = new google.maps.Marker({
      map: map,
      draggable: true,
      position: {lat: 12.931279, lng: 77.577654}
    });

    marker2 = new google.maps.Marker({
      map: map,
      draggable: true,
      position: {lat: 12.929594, lng: 77.578838}
    });

    var bounds = new google.maps.LatLngBounds(
        marker1.getPosition(), marker2.getPosition());
    map.fitBounds(bounds);

    google.maps.event.addListener(marker1, 'position_changed', update);
    google.maps.event.addListener(marker2, 'position_changed', update);

    poly = new google.maps.Polyline({
      strokeColor: '#FF0000',
      strokeOpacity: 1.0,
      strokeWeight: 3,
      map: map,
    });

    geodesicPoly = new google.maps.Polyline({
      strokeColor: '#CC0099',
      strokeOpacity: 1.0,
      strokeWeight: 3,
      geodesic: true,
      map: map
    });

    update();
  }

  function update() {
    var path = [marker1.getPosition(), marker2.getPosition()];
    poly.setPath(path);
    geodesicPoly.setPath(path);
    // var heading = google.maps.geometry.spherical.computeHeading(path[0], path[1]);
    // document.getElementById('heading').value = heading;
    // document.getElementById('origin').value = path[0].toString();
    // document.getElementById('destination').value = path[1].toString();
  }
});
