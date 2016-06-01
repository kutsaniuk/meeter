(function () {
    'use strict';

    angular
        .module('main')
        .controller('EventNewCtrl', EventNewCtrl);

    function EventNewCtrl($scope, $http, $locale, $stateParams, $rootScope, $cookieStore, EventService, UserService) {
        var sc = $scope;

        sc.eventId = $stateParams.id;
        $rootScope.globals = $cookieStore.get('globals') || {};
        sc.currentUser = $rootScope.globals.currentUser;

        sc.event = {
            'date': new Date(),
            'time': new Date().setHours(0, 0)
        };

        sc.getLocation = function (val) {
            return $http.get('//maps.googleapis.com/maps/api/geocode/json', {
                params: {
                    address: val,
                    sensor: false
                },
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                }
            }).then(function (response) {
                return response.data.results.map(function (item) {
                    return item.formatted_address;
                });
            });
        };

        sc.createEvent = function (event) {

            var _event = {
                'name': event.name,
                'date': event.date.toISOString(),
                'time': event.time.getHours() + ":" + event.time.getMinutes(),
                'description': event.description,
                'type': event.type,
                'user_id': parseInt(sc.currentUser.id),
                'image': event.image.base64,
                'location': event.location
            };
            EventService.create(_event);
            sc.closeThisDialog(true);
        };

    }
})();
