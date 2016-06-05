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

        sc.dateOptions = {
            formatYear: 'yy',
            maxDate: new Date(2020, 5, 22),
            minDate: new Date(),
            startingDay: 1
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
            event.date.setHours(event.time.getHours() + 3, event.time.getMinutes());

            var _event = {
                'name': event.name,
                'date': event.date,
                'description': event.description,
                'type': event.type,
                'user_id': parseInt(sc.currentUser.id),
                'image': event.image.base64,
                'location': event.location,
                'created': new Date().toISOString()
            };
            EventService.create(_event);
            sc.closeThisDialog(true);
        };

    }
})();
