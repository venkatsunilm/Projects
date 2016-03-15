angular.module('app.services', [])

.factory('BlankFactory', [function(){

}])

.factory('$localstorageFactory', ['$window', function($window) {
  return {
    setObject: function(key, value) {
      $window.localStorage[key] = JSON.stringify(value);
    },
    getObject: function(key) {
      return JSON.parse($window.localStorage[key] || '{}');
    }
  };
}])

.factory('getSetFactory', function () {

  var address = '', url_location = '';
  var latLng = '', emergencyContact = '', UIDtrackCode = '';

  var getSetFactory = {
    setLocationAddress: setLocationAddress,
    getLocationAddress: getLocationAddress,
    setLocationURL: setLocationURL,
    getLocationURL: getLocationURL,
    setLatLng: setLatLng,
    getLatLng: getLatLng,
    setEmergencyContact: setEmergencyContact,
    getEmergencyContact: getEmergencyContact,
    setUIDtrackCode: setUIDtrackCode,
    getUIDtrackCode: getUIDtrackCode
  };

  return getSetFactory;
  /////////////////////

  function setLocationAddress(value){
    address = value;
  }

  function getLocationAddress(){
    return address;
  }

  function setLocationURL(value){
    url_location = value;
  }

  function getLocationURL(){
    return url_location;
  }

  function setLatLng(value){
    latLng = value;
  }

  function getLatLng(){
    return latLng;
  }

  function setEmergencyContact(value){
    emergencyContact = value;
  }

  function getEmergencyContact(){
    return emergencyContact;
  }

  function setUIDtrackCode(value){
    UIDtrackCode = value;
  }

  function getUIDtrackCode(){
    return UIDtrackCode;
  }

})

.factory('clockFactory', function ($interval, getSetFactory, $cordovaSms) {

  var clockInstance = '';
  var clock = {
    startClock: addClock,
    stopClock: removeClock
  };

  return clock;
  /////////////////////

  function addClock(displayInfo){
    // alert('addClock called .......... ');
    clockInstance =  $interval(function(){
      // alert('Timer sms started........... ');
      sendSMSonClockTrigger(displayInfo);
    }, displayInfo.recurrance * 60 * 1000);
  }

  function removeClock(){
    $interval.cancel(clockInstance);
  }

  function sendSMSonClockTrigger(displayInfo){
    $cordovaSms
      .send(displayInfo.emergencyContact, 'My location: ' +
      getSetFactory.getLocationAddress() + '.  Map: ' +
      getSetFactory.getLocationURL())
      .then(function() {
        // Success! SMS was sent
        // alert('sendSMSonClockTrigger sucess');
      }, function(error) {
        alert('Error  sendSMSonClockTrigger');
        // An error occurred
      });
  }

})

.factory('smsFactory', function ($cordovaSms, clockFactory, getSetFactory, $rootScope, $timeout, $ionicPopup) {

  var smsFactory = {
    triggerSMS: triggerSMS,
    stopSMS: stopSMS,
    triggerTrackCode: triggerTrackCode
  };

  return smsFactory;
  /////////////////////

  function stopSMS(){
    clockFactory.stopClock();
  }

  function triggerSMS(displayInfo){

    $cordovaSms
      .send(displayInfo.emergencyContact, 'My location: ' +
      getSetFactory.getLocationAddress() + '.  Map: ' +
      getSetFactory.getLocationURL())
      .then(function() {
       // Start the clock to send the sms on a given schedules.
       clockFactory.startClock(displayInfo);
       // Stop sending the sms when it reaches the timeout
       $timeout(callBroadcastToResetAllInController, displayInfo.totalDuration * 60 * 1000);
      }, function(error) {
        alert('Error triggerSMS');
        // An error occurred
      });
  }

  function triggerTrackCode(nameTrackCode){

    $cordovaSms
      .send(nameTrackCode.emergencyContact, nameTrackCode.firstname + ' ' + nameTrackCode.lastname + ' has sent you a track code: '+
      nameTrackCode.trackCode + '. Please download iTrack from android or iPhone stores for live tracking...')
      .then(function() {
          var alertPopup = $ionicPopup.alert({
           title: 'SMS Notification Status',
           template: 'Track Code ' + nameTrackCode.trackCode + ' sent'
        });
      }, function(error) {
        alert('Error triggerTrackCode');
        // An error occurred
      });
  }

  function callBroadcastToResetAllInController(){
    $rootScope.$broadcast('TimeoutResetAll');
  }

})

.factory('liveTrackFactory', function ($http) {

  // var baseURL = 'http://10.12.200.241:8889/api/User';
  var baseURL = 'http://testtracktech-001-site1.ctempurl.com/api/User';
  var service = {
    post: post,
    get: get
  };

  return service;

  ////////////////////////

  function get(trackCode) {
    var url = baseURL + '/Location/'+trackCode;
    return $http.get(url);
  }

  function post(dataObject) {
    var url = baseURL + '/PollLocation';
    return $http.post(url, dataObject);
  }
})

.factory('RegisterTrackFactory', function ($http) {

  // var baseURL = 'http://10.12.200.241:8889/api/User';
  var baseURL = 'http://testtracktech-001-site1.ctempurl.com/api/User';
  var service = {
    post: post
  };

  return service;

  ////////////////////////

  function post(dataObject) {
    var url = baseURL;
    return $http.post(url, dataObject);
  }
})

.service('BlankService', [function(){

}]);
