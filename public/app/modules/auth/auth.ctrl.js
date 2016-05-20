(function () {
    'use strict';

    angular
        .module('main')
        .controller('AuthCtrl', AuthCtrl);

    function AuthCtrl($scope, $state, AuthService, CredentialsService) {
        var sc = $scope;

        CredentialsService.ClearCredentials();

        sc.login = function () {
            AuthService.login(sc.username, sc.password)
                .then(function successCallback(response) {
                    $state.go('main.user.feed');
                    CredentialsService.SetCredentials(response.data.id, sc.username, sc.password);
                    sc.user = response.data;
                }, function errorCallback(response) {
                    sc.authFailed = true;
                });
        };

        sc.register = function () {
            AuthService.register(sc.user)
                .then(function successCallback(response) {
                    alert('success');
                }, function errorCallback(response) {
                    alert('failed');
                });
        };
    }
})();
