(function () {
    'use strict';

    angular
        .module('main')
        .controller('UserFeedCtrl', UserFeedCtrl);

    function UserFeedCtrl($scope, EventService) {
        var sc = $scope;

        sc.getPageEvents = function (page, limit, type, name) {
            
            var getPageSuccess = function (response) {
                sc.events = response.data;
            };

            var getPageFailed = function (response) {
                alert(response.status);
            };

            EventService.getPage(page, limit, type, name).then(getPageSuccess, getPageFailed);
        }


    }
})();
