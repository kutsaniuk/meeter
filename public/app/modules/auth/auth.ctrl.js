(function () {
    'use strict';

    angular
        .module('main')
        .controller('AuthCtrl', AuthCtrl);

    function AuthCtrl($scope, $state, AuthService, $cookieStore, $translate, CredentialsService, EventService) {
        var sc = $scope;

        CredentialsService.ClearCredentials();

        sc.lang = 'uk';
        sc.langShow = true;
        $translate.use(sc.lang);

        sc.login = function (username, password) {
            AuthService.login(username, password)
                .then(function successCallback(response) {
                    $state.go('main.user.feed');
                    CredentialsService.SetCredentials(response.data.id, sc.username, sc.password);
                    sc.user = response.data;
                }, function errorCallback(response) {
                    sc.authFailed = true;
                });
        };

        sc.register = function () {
            sc.user.created = new Date().toISOString();
            sc.user.language = sc.lang;
            if (sc.registerForm.$valid && sc.usernameCheked) AuthService.register(sc.user)
                .then(function successCallback(response) {
                    sc.login(sc.user.username, sc.user.password);
                }, function errorCallback(response) {
                    alert('failed');
                });
        };
        
        sc.checkUsername = function (username) {
            AuthService.check(username)
                .then(function successCallback(response) {
                    sc.usernameCheked = true;
                }, function errorCallback(response) {
                    sc.usernameCheked = false;
                });
        };

        sc.getPageEvents = function (page, limit, type, name) {

            var getPageSuccess = function (response) {
                sc.events = response.data;
            };

            var getPageFailed = function (response) {
                alert(response.status);
            };

            EventService.getPage(page, limit, type, name).then(getPageSuccess, getPageFailed);
        };

        sc.setLang = function (lang) {
            $translate.use(lang);
            sc.lang = lang;
            sc.langShow = !sc.langShow;
        }
    }
})();
