(function () {
    'use strict';

    angular
        .module('main')
        .controller('UserCtrl', UserCtrl);

    function UserCtrl($scope, $rootScope, $location, $cookieStore, EventService, CredentialsService, ngDialog) {
        var sc = $scope;

        sc.getEventsByName = function (page, limit, name) {

            var getPageSuccess = function (response) {
                sc.events = response.data;
            };

            var getPageFailed = function (response) {
                alert(response.status);
            };

            EventService.search(page, limit, name).then(getPageSuccess, getPageFailed);
        };

        sc.logout = function () {
            CredentialsService.ClearCredentials();
        };

        $rootScope.globals = $cookieStore.get('globals') || {};

        sc.userId = $rootScope.globals.currentUser.id;

        sc.createEvent = function () {
            ngDialog.open({
                template: 'app/modules/user/event/new/user.event.new.view.html',
                className: 'ngdialog-theme-event',
                showClose: false,
                controller: 'EventNewCtrl'
            });
        };

        sc.linkEvent = function (searchName) {
            if (searchName.id != null)
                $location.path('/' + searchName.type + '/' + id);

        }
    }
})();
