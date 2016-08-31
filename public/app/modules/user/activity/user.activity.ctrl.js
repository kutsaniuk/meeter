(function () {
    'use strict';

    angular
        .module('main')
        .controller('UserActivityCtrl', UserActivityCtrl);

    function UserActivityCtrl($scope, $state, $rootScope, $cookieStore, EventService, UserService) {
        var sc = $scope;

        sc.currentUser = $rootScope.globals.currentUser;
        sc.currentPage = 1;
        sc.activityType = 'new';

        sc.getEventLikesById = function (id) {
            var success = function (response) {
                sc.likes = response.data;

                sc.findUser = function (user) {
                    return user.user_id === sc.currentUser.id;
                };

                if (sc.likes.find(sc.findUser) != null) {
                    sc.like = true;
                    sc.noLike = false;
                }
                else {
                    sc.like = false;
                    sc.noLike = true;
                }
            };

            var failed = function (response) {
                sc.likes = response.data;
                sc.like = false;
                sc.noLike = true;
            };

            EventService.getLikes(id).then(success, failed);
        };

        sc.createLike = function (id) {
            var success = function (response) {
                sc.getEventLikesById(id);
                sc.like = !sc.like;
                sc.noLike = !sc.noLike;
            };

            var failed = function (response) {
                sc.getEventLikesById(id);
                sc.like = !sc.like;
                sc.noLike = !sc.noLike;
            };

            var like = {
                'event_id': id,
                'user_id': sc.currentUser.id
            };

            if (sc.like != true) EventService.like(like).then(success, failed);
            else EventService.dislike(sc.likes.find(sc.findUser).id).then(success, failed);
        };

        sc.getUserById = function (id) {

            var getUserSuccess = function (response) {
                sc.user = response.data;
            };

            var getUserFailed = function (response) {
                alert(response.status);
            };

            UserService.getById(id).then(getUserSuccess, getUserFailed);
        };

        sc.getEventCommentsById = function (id) {
            var getCommentsSuccess = function (response) {
                sc.comments = response.data;
            };

            var getCommentsFailed = function (response) {
                alert(response.status);
            };

            EventService.getComments(id, 1, 1).then(getCommentsSuccess, getCommentsFailed);
        };

        sc.getPageUpdates = function () {
            $state.go('main.user.feed.updates');
        };
        
        sc.getActivity = function (page, limit, type) {
            var success = function (response) {
                sc.activities = response.data;
            };

            var failed = function (response) {
                alert(response.status);
            };

            UserService.activity(page, limit, type).then(success, failed);
        };

    }
})();
