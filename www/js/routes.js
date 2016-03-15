angular.module('app.routes', [])

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider
   .state('menu', {
    url: '/menu',
    templateUrl: 'templates/menu.html',
    abstract:true
  })

  .state('menu.home', {
     url: '/home',
     views: {
       'side-menu': {
         templateUrl: 'templates/home.html',
         controller: 'homeCtrl'
       }
     }
   })

  // .state('register', {
  //   url: '/register',
  //   templateUrl: 'templates/register.html',
  //   controller: 'registerCtrl'
  // })

  .state('trackingSchedule', {
    url: '/trackingSchedule',
    templateUrl: 'templates/trackingSchedule.html',
    controller: 'trackingScheduleCtrl'
  })

  .state('trackingYourselfMap', {
    cache: false,
    url: '/trackingYourselfMap',
    templateUrl: 'templates/trackingYourselfMap.html',
    controller: 'trackingYourselfMapCtrl'
  })

  .state('trackingRequest', {
    url: '/trackingRequest',
    templateUrl: 'templates/trackingRequest.html',
    controller: 'trackingRequestCtrl'
  })

  .state('trackingBelovedMap', {
    cache: false,
    url: '/trackingBelovedMap',
    templateUrl: 'templates/trackingBelovedMap.html',
    controller: 'trackingBelovedMapCtrl'
  })
  .state('pathMap', {
    url: '/pathMap',
    templateUrl: 'templates/pathMap.html',
    controller: 'pathMapCtrl'
  });

$urlRouterProvider.otherwise('/trackingSchedule');
});
