(function () {
    'use strict';

    angular
        .module('main')
        .controller('UserProfileCtrl', UserProfileCtrl);

    function UserProfileCtrl($scope, $stateParams, $location, UserService) {
        var sc = $scope;

        sc.userId = $stateParams.id;

        sc.getUserById = function (id) {

            var getUserSuccess = function (response) {
                sc.user = response.data;
            };

            var getUserFailed = function (response) {
                alert(response.status);
            };

            UserService.getById(id).then(getUserSuccess, getUserFailed);
        };

        sc.getUserEventsById = function (id) {
            var getEventsSuccess = function (response) {
                sc.events = response.data;
            };

            var getEventsFailed = function (response) {
                sc.getEventsFailed = true;
            };

            UserService.getEventsById(id).then(getEventsSuccess, getEventsFailed);
        };

        sc.editUserProfile = function (id) {
            $location.path('/user/edit/' + id);
        }

    }
})();
