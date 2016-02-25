angular.module('app.directives', [])

.directive('blankDirective', [function(){

}])

.directive('map', function() {
    return {
        restrict: 'A',
        link:function(scope, element, attrs){
          var zValue = scope.$eval(attrs.zoom);
          var lat = scope.$eval(attrs.lat);
          var lng = scope.$eval(attrs.lng);

          var myLatlng = new google.maps.LatLng(lat,lng),
          mapOptions = {
                zoom: zValue,
                center: myLatlng
            },
          map = new google.maps.Map(element[0], mapOptions),
          marker = new google.maps.Marker({
                position: myLatlng,
                map: map,
                draggable:true
          });

          google.maps.event.addListener(marker, 'dragend', function(evt){
    		    scope.$parent.user.latitude = evt.latLng.lat();
    		    scope.$parent.user.longitude = evt.latLng.lng();
    		    scope.$apply();
    		  });
          
        }
    };
});
