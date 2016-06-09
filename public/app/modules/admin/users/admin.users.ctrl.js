(function () {
    'use strict';

    angular
        .module('main')
        .controller('AdminUsersCtrl', AdminUsersCtrl);

    function AdminUsersCtrl($scope, $state, UserService, crAcl, $translate, CredentialsService, EventService) {
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

        sc.setActiveUser = function (id, active) {

            var user = {
                'id': id,
                'active': !active
            };

            var success = function (response) {
                sc.getUsers(sc.currentPage, 9);
            };

            var failed = function (response) {
                alert(response.status);
            };

            UserService.active(user).then(success, failed);


        };

        sc.setRoleUser = function (id, role) {

            var user = {
                'id': id,
                'role': role
            };

            var success = function (response) {
                // sc.getUsers(1, 9);
            };

            var failed = function (response) {
                alert(response.status);
            };

            UserService.role(user).then(success, failed);


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
