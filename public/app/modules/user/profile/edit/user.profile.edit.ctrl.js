(function () {
    'use strict';

    angular
        .module('main')
        .controller('UserProfileEditCtrl', UserProfileEditCtrl);

    function UserProfileEditCtrl($scope, $rootScope, $cookieStore, $stateParams, UserService, AuthService) {
        var sc = $scope;

        $rootScope.globals = $cookieStore.get('globals') || {};

        sc.userId = $rootScope.globals.currentUser.id;

        sc.getUserById = function (id) {

            var getUserSuccess = function (response) {
                sc.user = response.data;
            };

            var getUserFailed = function (response) {
                alert(response.status);
            };

            UserService.getById(id).then(getUserSuccess, getUserFailed);
        };

        sc.checkPassword = function () {
            return AuthService.login($rootScope.globals.currentUser.username, sc.oldPassword)
                .then(function successCallback(response) {
                    sc.changePassword();
                }, function errorCallback(response) {
                    
                });
        };

        sc.changePassword = function () {

            sc._user = {
                'id': $rootScope.globals.currentUser.id,
                'username': $rootScope.globals.currentUser.username,
                'password': sc.newPassword,
                'name': sc.user.name,
                'email': sc.user.email,
                'created': sc.user.created,
                'active': sc.user.active
            };

            var repeatPasswordChecked = angular.equals(sc.newPassword, sc.repeatNewPassword);

            if (repeatPasswordChecked) {
                UserService.update(sc._user);
                alert("Changed!");
            }
        };

        sc.updateUser = function () {

        }

    }
})();
