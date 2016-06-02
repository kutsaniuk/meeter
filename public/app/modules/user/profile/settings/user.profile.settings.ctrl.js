(function () {
    'use strict';

    angular
        .module('main')
        .controller('UserProfileSettingsCtrl', UserProfileSettingsCtrl);

    function UserProfileSettingsCtrl($scope, $rootScope, $cookieStore, CredentialsService, UserService, AuthService, $state) {
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

        sc.checkPassword = function (user) {
            AuthService.login($rootScope.globals.currentUser.username, user.oldPassword)
                .then(function successCallback(response) {
                    sc.failedPassword = false;
                }, function errorCallback(response) {
                    sc.failedPassword = true;
                });
        };
        
        sc.repeatPasswordCheck = function (user) {
            sc.repeatPasswordChecked = angular.equals(user.newPassword, user.repeatNewPassword);
            if (!sc.repeatPasswordChecked) sc.passwordRepeatFailed = true;
            else sc.passwordRepeatFailed = false;
        };

        sc.changePassword = function (user) {

            sc._user = {
                'id': $rootScope.globals.currentUser.id,
                'password': user.newPassword
            };

            sc.repeatPasswordCheck(user);

            if (!sc.failedPassword && sc.repeatPasswordChecked && user.newPassword != null && user.repeatNewPassword != null) {
                UserService.update(sc._user, 'password'); 
                alert("Changed!");
            }
        };

        sc.updateUser = function (user) {
            var success = function (response) {
                CredentialsService.SetCredentials(sc.userId, response.data.username, response.data.password);
                sc.getUserById(sc.userId);
            };
            var failed = function () {

            };
            UserService.update(user, 'general').then(success, failed);
        };

        sc.getTab = function (tab) {
            if (tab !== undefined)
            {
                $state.go('main.user.profile.settings.' + tab);
                sc.tab = tab;
            }
            else $state.go('main.user.profile.settings');
        };

        sc.updateAvatar = function (_avatar) {
            var avatar = {
                'id': sc.userId,
                'image': _avatar.base64,
                'type': _avatar.filetype,
                'user_id': sc.userId
            };

            var success = function (response) {
                sc.avatarUpload = true;
            };
            var failed = function () {

            };
            UserService.updateAvatar(avatar).then(success, failed);
        };

        sc.updateBackground = function (_background) {
            var background = {
                'id': sc.userId,
                'image': _background.base64,
                'type': _background.filetype,
                'user_id': sc.userId
            };

            var success = function (response) {
                sc.avatarBackground = true;
            };
            var failed = function () {

            };
            UserService.updateBackground(background).then(success, failed);
        }

    }
})();
