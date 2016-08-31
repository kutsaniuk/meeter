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
            'time': new Date(),
            'type': 'entertainment'
        };

        sc.dateOptions = {
            formatYear: 'yy',
            maxDate: new Date(2020, 5, 22),
            minDate: new Date(),
            startingDay: 1
        };

        sc.createEvent = function (event) {
            event.date.setHours(event.time.getHours() + 3, event.time.getMinutes());
            var created = new Date();
            created.setHours(created.getHours() + 3);

            if (event.name != ''
                && event.description != ''
                && event.image != null
                && event.location != ''
                && sc.eventForm.$valid) {
                var _event = {
                    'name': event.name,
                    'date': event.date,
                    'description': event.description,
                    'type': event.type,
                    'user_id': parseInt(sc.currentUser.id),
                    'image': event.image.base64,
                    'location': event.location,
                    'created': created.toISOString()
                };
                
                EventService.create(_event);
                sc.closeThisDialog(true);
            }
        };

    }
})();
