
angular.module('app', ['ionic', 'app.controllers', 'app.routes', 'app.services', 'app.directives'])

.run(function($ionicPlatform, $ionicPopup, $ionicHistory, $rootScope) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }

    if(window.cordova && window.cordova.plugins.backgroundMode) {
        // Android customization
        cordova.plugins.backgroundMode.setDefaults({ title:'Track Tech', ticker: 'Message notifications', text:'Will send locations till timeout reaches...'});
        // Enable background mode
        cordova.plugins.backgroundMode.enable();

        // Called when background mode has been activated
        cordova.plugins.backgroundMode.onactivate = function () {
            setTimeout(function () {
                // Modify the currently displayed notification
                cordova.plugins.backgroundMode.configure({
                    text:'Track Tech running in background for more than 5s now...'
                });
                // alert('backgroundMode.onactivate');
            }, 5000);
        };
      }

      $ionicPlatform.registerBackButtonAction(function (event) {
        // do the prevent and stop as app was on exiting on press of OK in the popup
        event.preventDefault();
        event.stopPropagation();

        if ($ionicHistory.currentStateName() === 'menu.home' || $ionicHistory.currentStateName() === 'trackingSchedule'){
           var confirmPopup = $ionicPopup.confirm({
             title: 'Exit Alert!!!',
             template: 'Are you sure to exit?. To send message notifications, please keep the app in background!!!'
           });

           confirmPopup.then(function(res) {
             if(res) {
               $rootScope.$broadcast('TimeoutResetAll');
               if(ionic && ionic.Platform) {
                 ionic.Platform.exitApp();
               }
             }
           });
         }
      }, 100);
  });
});
