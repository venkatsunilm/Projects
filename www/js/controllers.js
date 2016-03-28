angular.module('app.controllers', [])

.controller("pathMapCtrl", function($scope, $state){

  $scope.goBack = function() {
    // removeInterval(instance);
    // deleteMap();
    $state.go('menu.home');
  };

  var marker1, marker2;
  var poly, geodesicPoly;

  initMap();

  function initMap() {
    var map = new google.maps.Map(document.getElementById('pathMap'), {
      zoom: 16,
      center: {lat: 12.930217, lng: 77.579651}
    });

    map.controls[google.maps.ControlPosition.TOP_CENTER].push(
        document.getElementById('info'));

    marker1 = new google.maps.Marker({
      map: map,
      draggable: true,
      position: {lat: 12.931279, lng: 77.577654}
    });

    marker2 = new google.maps.Marker({
      map: map,
      draggable: true,
      position: {lat: 12.929594, lng: 77.578838}
    });

    var bounds = new google.maps.LatLngBounds(
        marker1.getPosition(), marker2.getPosition());
    map.fitBounds(bounds);

    google.maps.event.addListener(marker1, 'position_changed', update);
    google.maps.event.addListener(marker2, 'position_changed', update);

    poly = new google.maps.Polyline({
      strokeColor: '#FF0000',
      strokeOpacity: 1.0,
      strokeWeight: 3,
      map: map,
    });

    geodesicPoly = new google.maps.Polyline({
      strokeColor: '#CC0099',
      strokeOpacity: 1.0,
      strokeWeight: 3,
      geodesic: true,
      map: map
    });

    update();
  }

  function update() {
    var path = [marker1.getPosition(), marker2.getPosition()];
    poly.setPath(path);
    geodesicPoly.setPath(path);
    // var heading = google.maps.geometry.spherical.computeHeading(path[0], path[1]);
    // document.getElementById('heading').value = heading;
    // document.getElementById('origin').value = path[0].toString();
    // document.getElementById('destination').value = path[1].toString();
  }
});
