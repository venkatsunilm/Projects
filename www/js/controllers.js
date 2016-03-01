angular.module('app.controllers', ['ngCordova'])

.controller('homeCtrl', function($scope, $localstorageFactory, $cordovaGeolocation, $http, $ionicPopup, smsFactory, getSetFactory, $rootScope, $timeout) {

  // collect the schedule details to show in the home screen
  $scope.displayInfo = $localstorageFactory.getObject('trackSchedule');
  getSetFactory.setLocationAddress('Trying to get your location address...');
  $scope.info = {
    areaName : getSetFactory.getLocationAddress()
  };
  $scope.notification = {
    status: true
  };
  // show the current currentCoordinates
  var posOptions = {timeout: 10000, enableHighAccuracy: false};
  $cordovaGeolocation.getCurrentPosition(posOptions)
    .then(function (position) {
      var lat  = position.coords.latitude;
      var long = position.coords.longitude;
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

      var url = 'http://maps.googleapis.com/maps/api/geocode/json?latlng='+lat+','+long+'&sensor=true';
      getSetFactory.setLocationURL('https://maps.google.com/?q='+lat+','+long);
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
        timeout : 1 * 60 * 1000,
        enableHighAccuracy: false // may cause errors if true
      };

      watch = $cordovaGeolocation.watchPosition(watchOptions);
      watch.then(
        null,
        function(err) {
          // error
        },
        function(position) {
          var lat  = position.coords.latitude;
          var long = position.coords.longitude;

          var url = 'http://maps.googleapis.com/maps/api/geocode/json?latlng='+lat+','+long+'&sensor=true';
          getSetFactory.setLocationURL('https://maps.google.com/?q='+lat+','+long);
          $http.get(url)
          .then(function(data){
            getSetFactory.setLocationAddress(data.data.results[0].formatted_address);//you get the current location here
            $scope.info.areaName = getSetFactory.getLocationAddress();
          }, function(err) {
            // error
          });

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
})

.controller('registerCtrl', function($scope, $localstorageFactory) {
  $scope.register = {
    firstname: '',
    lastname: '',
    trackCode: ''
  };

  $scope.saveRegisterData = function (){
    $localstorageFactory.setObject('registerData', {
      firstname: $scope.register.firstname,
      lastname: $scope.register.lastname,
      trackCode: $scope.register.trackCode
    });
  };
})

.controller('trackingScheduleCtrl', function($scope, $localstorageFactory) {
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
    $state.go('menu.home');
  };

// listen if the dom is ready
google.maps.event.addDomListener(window, 'load', function(){

    var posOptions = {timeout: 10000, enableHighAccuracy: false};
    var map = null;
    $cordovaGeolocation.getCurrentPosition(posOptions)
      .then(function (position) {

        var myLatLng = {lat: position.coords.latitude, lng: position.coords.longitude};

        var mapOptions = {
          center: myLatLng,
          zoom: 16,
          // mapTypeId: google.maps.MapTypeId.ROADMAP,
          scrollwheel: false
        };

        var div = document.getElementById('map');
        map = new google.maps.Map(div, mapOptions);
        $scope.map = map;

        var markerOptions = {
          map: map,
          position: myLatLng,
          title: 'Track Tech Location',
          draggable: true,
          animation: google.maps.Animation.DROP
        };

        // set the marker on the map according to the lat & lng
        var marker = new google.maps.Marker(markerOptions);

        watchGeolocationPosition(marker);

    }, function(err) {
      // error
      alert('code: '    + err.code    + '\n' +
          'message: ' + err.message + '\n');
    });

  });


    var watch, previousMarker;
    function watchGeolocationPosition(marker){

      // assign the previous marker here so make the map view null
      // previousMarker = marker;

      // watch if the location is changed for the given time recurrance intervalHandle
      var watchOptions = {
        // maximumAge: 3000,
        timeout : 10000,
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

          // map.setCenter(myLatLng);

          var markerOptions = {
            map: map,
            position: myLatLng,
            title: 'Track Tech Location',
          };

          if (previousMarker !== null && previousMarker !== undefined){
            previousMarker.setMap(null);
            previousMarker = null;
          }

          // update the marker
          previousMarker = google.maps.Marker(markerOptions);
          $scope.map = map;
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

// });

});

// .controller('trackingBelovedMapCtrl', function($scope, $state, $cordovaGeolocation){
//
//   $scope.goBack = function() {
//     $state.go('menu.home');
//   };
//
// // google.maps.event.addDomListener(window, 'load', function(){
//   var posOptions = {timeout: 10000, enableHighAccuracy: false};
//   var map = null;
//   $cordovaGeolocation.getCurrentPosition(posOptions)
//     .then(function (position) {
//
//       var myLatLng = {lat: position.coords.latitude, lng: position.coords.longitude};
//
//       var mapOptions = {
//         center: myLatLng,
//         zoom: 16,
//         // mapTypeId: google.maps.MapTypeId.ROADMAP,
//         scrollwheel: false
//       };
//
//       var div = document.getElementById('trackingBelovedMap');
//
//       map = new google.maps.Map(div, mapOptions);
//
//       var markerOptions = {
//         map: map,
//         position: myLatLng,
//         title: 'iTrack',
//         draggable: true,
//         animation: google.maps.Animation.DROP
//       };
//
//       // set the marker on the map according to the lat & lng
//       var marker = new google.maps.Marker(markerOptions);
//   });

// });
