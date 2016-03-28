(function(angular){

  'use strict';

  angular.module('tracktech.trackingRequest', [])
  .controller('trackingRequestCtrl', trackingRequestCtrl);

  // created a module for trackingRequest and added controller

  trackingRequestCtrl.$inject = ['$scope', '$state', '$localstorageFactory', '$ionicPopup', 'smsFactory', 'getSetFactory'];

  function trackingRequestCtrl($scope, $state, $localstorageFactory, $ionicPopup, smsFactory, getSetFactory){

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
  }

}(window.angular));
