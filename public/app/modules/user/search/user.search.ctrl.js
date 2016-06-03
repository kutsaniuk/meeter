(function () {
    'use strict';

    angular
        .module('main')
        .controller('UserSearchCtrl', UserSearchCtrl);

    function UserSearchCtrl($scope, $stateParams, $location, UserService, EventService, CredentialsService, ngDialog) {
        var sc = $scope;

        sc.name = $stateParams.name;
        sc.currentPage1 = 1;
        sc.currentPage2 = 1;


        sc.getEventsByName = function (page, limit, name) {

            var getPageSuccess = function (response) {
                sc.events = response.data;
            };

            var getPageFailed = function (response) {
                // alert(response.status);
            };
            sc.eventsLimit = limit;
            EventService.searchByName(page, limit, name).then(getPageSuccess, getPageFailed);
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
        };

        sc.linkSearch = function (searchName) {
            $location.path('/search/' + searchName);

        };

        sc.getUserById = function (id) {
 
            var getUserSuccess = function (response) {
                sc._user = response.data;
            };

            var getUserFailed = function (response) {
                alert(response.status);
            };

            UserService.getById(id).then(getUserSuccess, getUserFailed);
        };
        
        sc.search = function (searchName) {
            $location.path('/search/' + searchName);
        };

        sc.getEventsByName(1, 3, sc.name);
        
        sc.getUserByUsername(1, 4, sc.name);
        
        
    }
})();
