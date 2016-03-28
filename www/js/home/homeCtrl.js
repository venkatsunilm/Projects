(function(angular){

  'use strict';

  angular.module('tracktech.home',[])
  .controller('homeCtrl', homeCtrl);

  // created a module for home and added controller

  homeCtrl.$inject = ['$scope', '$localstorageFactory', '$cordovaGeolocation', '$http', '$ionicPopup',
    'smsFactory', 'getSetFactory', '$rootScope', '$timeout', 'liveTrackFactory', 'RegisterTrackFactory'];

  function homeCtrl($scope, $localstorageFactory, $cordovaGeolocation, $http, $ionicPopup,
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

        // start the loading bar
        var url = 'http://maps.googleapis.com/maps/api/geocode/json?latlng='+lat+','+lng+'&sensor=true';
        getSetFactory.setLocationURL('https://maps.google.com/?q='+lat+','+lng);
        $http.get(url, {method: 'GET'})
        .then(function(data){
          getSetFactory.setLocationAddress(data.data.results[0].formatted_address);//you get the current location here
          $scope.info.areaName = getSetFactory.getLocationAddress();
          // end the loading bar
        }, function(err) {
          // end the loading bar
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
}

}(window.angular));
