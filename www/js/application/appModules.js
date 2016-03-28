(function (angular) {
    'use strict';

    angular.module('tracktech', [
      'ionic',
      'ngCordova',
      'tracktech.trackingSchedule',
      'tracktech.home',
      'tracktech.trackingRequest',
      'tracktech.trackingYourselfMap',
      'tracktech.trackingBelovedMap',
      // 'app.controllers',
      'app.routes',
      'app.services',
      'app.directives'
    ]);

})(window.angular);
