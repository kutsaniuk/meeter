(function () {
    'use strict';

    angular
        .module('main')
        .controller('AdminDashboardCtrl', AdminDashboardCtrl);

    function AdminDashboardCtrl($scope, UserService, EventService) {
        var sc = $scope;
        sc.currentPage = 1;
        sc.name = '';

        sc.getUsers = function (page, limit) {

            var success = function (response) {
                sc.users = response.data;
            };

            var failed = function (response) {
                alert(response.status);
            };

            UserService.getPage(page, limit).then(success, failed);
        };

        sc.getEvents = function (page, limit) {

            var success = function (response) {
                sc.events = response.data;
            };

            var failed = function (response) {
                alert(response.status);
            };

            EventService.getPage(page, limit).then(success, failed);
        };

        sc.getComments = function (page, limit) {

            var success = function (response) {
                sc.comments = response.data;
            };

            var failed = function (response) {
                alert(response.status);
            };

            EventService.getComments('', page, limit).then(success, failed);
        };

        sc.getLikes = function (id) {

            var success = function (response) {
                sc.likes = response.data;
            };

            var failed = function (response) {
                alert(response.status);
            };

            EventService.getLikes('').then(success, failed);
        };

        sc.getUserByUsername = function (page, limit, username) {

            var getPageSuccess = function (response) {
                sc.users = response.data;
            };

            var getPageFailed = function (response) {
                // alert(response.status);
            };
            sc.usersLimit = limit;
            UserService.searchByUsername(page, limit, username).then(getPageSuccess, getPageFailed);
        }
    }
})();
