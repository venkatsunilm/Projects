angular.module('app.routes', [])

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider
 .state('menu.home', {
    url: '/home',
    views: {
      'side-menu21': {
        templateUrl: 'templates/home.html',
        controller: 'homeCtrl'
      }
    }
  })

  .state('menu', {
    url: '/menu',
    templateUrl: 'templates/menu.html',
    abstract:true
  })

  .state('register', {
    url: '/register',
    templateUrl: 'templates/register.html',
    controller: 'registerCtrl'
  })

  .state('trackingSchedule', {
    url: '/trackingSchedule',
    templateUrl: 'templates/trackingSchedule.html',
    controller: 'trackingScheduleCtrl'
  })

  .state('map', {
    url: '/map',
    templateUrl: 'templates/map.html',
    controller: 'mapCtrl'
  });

$urlRouterProvider.otherwise('/register');
});
