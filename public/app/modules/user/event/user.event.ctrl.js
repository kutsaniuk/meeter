(function () {
    'use strict';

    angular
        .module('main')
        .controller('EventCtrl', EventCtrl);

    function EventCtrl($scope, $stateParams, $rootScope, $cookieStore, EventService, UserService) {
        var sc = $scope;

        sc.eventId = $stateParams.id;
        $rootScope.globals = $cookieStore.get('globals') || {};
        sc.currentUser = $rootScope.globals.currentUser;

        sc.comment = null;

        sc.getUserById = function (id) {

            var getUserSuccess = function (response) {
                sc.user = response.data;
                sc.followShow = sc.user.id != sc.currentUser.id;
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

        sc.getEventById = function (id) {
            var getEventSuccess = function (response) {
                sc.event = response.data;
                sc.getUserById(response.data.user_id);
                sc.getEventCommentsById(id, 1, 15);
                sc.getEventLikesById(id);
                sc.getFollowingById(sc.currentUser.id);
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
                sc.viewAllCommentsShow = false;
                sc.comment = null;
            };

            var getCommentsFailed = function (response) {
                alert(response.status);
            };

            var comment = {
                'comment': sc.comment,
                'event_id': sc.eventId,
                'user_id': $rootScope.globals.currentUser.id,
                'date': new Date().toISOString()
            };

            if (sc.comment != null) EventService.createComment(comment).then(getCommentsSuccess, getCommentsFailed);
        };

        sc.createLike = function () {
            var success = function (response) {
                sc.getEventLikesById(sc.eventId);
                sc.like = !sc.like;
                sc.noLike = !sc.noLike;
            };

            var failed = function (response) {
                sc.getEventLikesById(sc.eventId);
                sc.like = !sc.like;
                sc.noLike = !sc.noLike;
            };

            var like = {
                'event_id': sc.eventId,
                'user_id': sc.currentUser.id
            };

            if (sc.like != true) EventService.like(like).then(success, failed);
            else EventService.dislike(sc.likes.find(sc.findUser).id).then(success, failed);
        };

        sc.getFollowingById = function (id) {
            var success = function (response) {
                sc.following = response.data;

                sc.findFollowingUser = function (following) {
                    return following.current_user === sc.currentUser.id;
                };

                if (sc.following.find(sc.findFollowingUser) != null) {
                    sc.follow = true;
                    sc.noFollow = false;
                }
                else {
                    sc.follow = false;
                    sc.noFollow = true;
                }
            };

            var failed = function (response) {
                sc.following = response.data;
                sc.follow = false;
                sc.noFollow = true;
            };

            UserService.getFollowing(id).then(success, failed);
        };

        sc.followOnUser = function (id) {
            var success = function (response) {
                sc.getFollowingById(sc.currentUser.id);
                sc.follow = !sc.follow;
                sc.noFollow = !sc.noFollow;
            };

            var failed = function (response) {
                sc.getFollowingById(sc.currentUser.id);
                sc.follow = !sc.follow;
                sc.noFollow = !sc.noFollow;
            };

            var user = {
                'user_id': parseInt(id),
                'current_user': parseInt(sc.currentUser.id)
            };

            if (sc.follow != true) UserService.follow(user).then(success, failed);
            else UserService.unFollow(sc.following.find(sc.findFollowingUser).id).then(success, failed);
        }
    }
})();
