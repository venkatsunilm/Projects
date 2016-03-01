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

  var getSetFactory = {
    setLocationAddress: setLocationAddress,
    getLocationAddress: getLocationAddress,
    setLocationURL: setLocationURL,
    getLocationURL: getLocationURL
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
    alert('removed clock timer called .......... '+ clockInstance);
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

.factory('smsFactory', function ($cordovaSms, clockFactory, getSetFactory, $rootScope, $timeout) {

  var smsFactory = {
    triggerSMS: triggerSMS,
    stopSMS: stopSMS
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

  function callBroadcastToResetAllInController(){
    $rootScope.$broadcast('TimeoutResetAll');
  }

})

.service('BlankService', [function(){

}]);
