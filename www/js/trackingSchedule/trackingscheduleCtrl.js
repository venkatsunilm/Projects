(function (angular) {

  // "use strict"; only matters to new compilers that "understand" the meaning of it.
  // Strict mode makes it easier to write "secure" JavaScript.
  // Strict mode changes previously accepted "bad syntax" into real errors.
  'use strict';

  angular.module('tracktech.trackingSchedule', [])
  .controller('trackingScheduleCtrl', trackingScheduleCtrl);

  // module created and added controller

  trackingScheduleCtrl.$inject = ['$scope', '$localstorageFactory', 'getSetFactory'];

  function trackingScheduleCtrl($scope, $localstorageFactory, getSetFactory) {
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
  }

}(window.angular));
