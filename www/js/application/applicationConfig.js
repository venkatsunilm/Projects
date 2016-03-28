(function(angular){

  'use strict';

  angular.module('tracktech')
  .config(config);

  config.$inject = ['$httpProvider'];

  function config($httpProvider){

    $httpProvider.interceptors.push('applicationLoadingInterceptor');

  }

}(window.angular));
