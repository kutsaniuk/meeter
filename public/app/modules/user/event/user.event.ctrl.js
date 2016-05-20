(function () {
    'use strict';

    angular
        .module('main')
        .controller('EventCtrl', EventCtrl);

    function EventCtrl($scope, $stateParams, $rootScope, $cookieStore, EventService, UserService) {
        var sc = $scope;

        sc.eventId = $stateParams.id;
        $rootScope.globals = $cookieStore.get('globals') || {};
        sc.comment = null;

        sc.getUserById = function (id) {

            var getUserSuccess = function (response) {
                sc.user = response.data;
            };

            var getUserFailed = function (response) {
                alert(response.status);
            };

            UserService.getById(id).then(getUserSuccess, getUserFailed);
        };

        sc.getEventCommentsById = function (id, page, limit) {
            var getCommentsSuccess = function (response) {
                sc.comments = response.data;
            };

            var getCommentsFailed = function (response) {
                alert(response.status);
            };

            EventService.getComments(id, page, limit).then(getCommentsSuccess, getCommentsFailed);
        };

        sc.getEventById = function (id) {
            var getEventSuccess = function (response) {
                sc.event = response.data;
                sc.getUserById(response.data.user_id);
                sc.getEventCommentsById(id, 1, 10);
            };

            var getEventFailed = function (response) {
                // $location.path('app/modules/404.html');
                // alert();
            };

            EventService.getById(id).then(getEventSuccess, getEventFailed);
        };

        sc.createComment = function () {
            var getCommentsSuccess = function (response) {
                sc.getEventCommentsById(sc.eventId, 1, 100);
                sc.comment = null;
            };

            var getCommentsFailed = function (response) {
                alert(response.status);
            };

            var comment = {
                'username': $rootScope.globals.currentUser.username,
                'comment': sc.comment,
                'event_id': sc.eventId,
                'user_id': $rootScope.globals.currentUser.id
            };

            if (sc.comment != null) EventService.createComment(comment).then(getCommentsSuccess, getCommentsFailed);
        }

    }
})();
