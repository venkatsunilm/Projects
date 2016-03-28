(function(angular){
  'use strict';

  angular.module('tracktech')
  .factory('applicationLoadingInterceptor', applicationLoadingInterceptor);

  applicationLoadingInterceptor.$inject = ['$q', '$injector'];

  function applicationLoadingInterceptor($q, $injector){
    var  loadingIdMap = {
      'GET' : 'Loading...',
      'POST': 'Saving...',
      'PATCH': 'Updating...',
      'PUT': 'Updating...',
      'DELETE': 'Saving...'
    };

    return {
      'request': function (config){
        var loadingId = loadingIdMap[config.method] || 'LOADING';
        $injector.get('$ionicLoading').show ({
            template: '<div>' + loadingId +
            '</div><div><ion-spinner icon="android" class="spinner spinner-android"></ion-spinner></div>'
        });
        return config;
      },
      'response': function(response){
        $injector.get('$ionicLoading').hide();
        return response;
      },
      'responseError': function (rejection) {
        if (rejection.config) {
          $injector.get('$ionicLoading').hide();
        }
        alert('rejection' + rejection);
        return $q.reject(rejection);
      }
    };

  }

}(window.angular));
