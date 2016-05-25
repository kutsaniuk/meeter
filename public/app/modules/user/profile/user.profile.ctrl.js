(function () {
    'use strict';

    angular
        .module('main')
        .controller('UserProfileCtrl', UserProfileCtrl);

    function UserProfileCtrl($scope, $stateParams, $rootScope, $cookieStore, $location, UserService, EventService) {
        var sc = $scope;

        sc.userId = $stateParams.id;
        $rootScope.globals = $cookieStore.get('globals') || {};
        sc.currentUser = $rootScope.globals.currentUser;

        sc.getUserById = function (id) {

            var getUserSuccess = function (response) {
                sc.user = response.data;
            };

            var getUserFailed = function (response) {
                alert(response.status);
            };

            UserService.getById(id).then(getUserSuccess, getUserFailed);
        };

        sc.getUserEventsById = function (id) {
            var getEventsSuccess = function (response) {
                sc.events = response.data;
            };

            var getEventsFailed = function (response) {
                sc.getEventsFailed = true;
            };

            UserService.getEventsById(id).then(getEventsSuccess, getEventsFailed);
        };

        sc.editUserProfile = function (id) {
            $location.path('/user/edit/' + id);
        };

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

        sc.getEventCommentsById = function (id) {
            var getCommentsSuccess = function (response) {
                sc.comments = response.data;
            };

            var getCommentsFailed = function (response) {
                alert(response.status);
            };

            EventService.getComments(id, 1, 1).then(getCommentsSuccess, getCommentsFailed);
        }

    }
})();
