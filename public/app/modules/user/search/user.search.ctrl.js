(function () {
    'use strict';

    angular
        .module('main')
        .controller('UserSearchCtrl', UserSearchCtrl);

    function UserSearchCtrl($scope, $stateParams, $location, UserService, EventService, CredentialsService, ngDialog) {
        var sc = $scope;

        sc.name = $stateParams.name;

        sc.getResultsByName = function (name) {

            var getPageSuccess = function (response) {
                sc.results = response.data;
            };

            var getPageFailed = function (response) {
                alert(response.status);
            };

            EventService.search(1, 100, name).then(getPageSuccess, getPageFailed);
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
            sc.getResultsByName(sc.name);
        };

        sc.getResultsByName(sc.name);
        
        
    }
})();
