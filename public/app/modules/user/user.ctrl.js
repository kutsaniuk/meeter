(function () {
    'use strict';

    angular
        .module('main')
        .controller('UserCtrl', UserCtrl);

    function UserCtrl($scope, $rootScope, $cookieStore, EventService, CredentialsService, ngDialog) {
        var sc = $scope;

        sc.getEventsByName = function (page, limit, name) {

            var getPageSuccess = function (response) {
                sc.events = response.data;
            };

            var getPageFailed = function (response) {
                alert(response.status);
            };

            EventService.search(page, limit, name).then(getPageSuccess, getPageFailed);
        }

        sc.logout = function () {
            CredentialsService.ClearCredentials();
        }

        $rootScope.globals = $cookieStore.get('globals') || {};

        sc.userId = $rootScope.globals.currentUser.id;

        sc.createEvent = function () {
            ngDialog.open({
                // template: 'popupTmpl.html',
                className: 'ngdialog-theme-plain'
            });
        }
    }
})();
