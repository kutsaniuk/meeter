(function () {
    'use strict';

    angular
        .module('main')
        .controller('UserProfileCtrl', UserProfileCtrl);

    function UserProfileCtrl($scope, $stateParams, $rootScope, $cookieStore, $location, UserService, EventService, ngDialog) {
        var sc = $scope;

        sc.userId = $stateParams.id;
        $rootScope.globals = $cookieStore.get('globals') || {};
        sc.currentUser = $rootScope.globals.currentUser;

        sc.getUserById = function (id) {

            sc.findFollowingUser = function (following) {
                return following.user_id === id;
            };

            var getUserSuccess = function (response) {
                sc.user = response.data;
                sc.getFollowingById(sc.currentUser.id);
                sc.followShow = sc.user.id != sc.currentUser.id;
                sc.editShow = sc.user.id == sc.currentUser.id;
            };

            var getUserFailed = function (response) {
                alert(response.status);
            };

            UserService.getById(id).then(getUserSuccess, getUserFailed);
        };

        sc.getUserEventsById = function (id, type) {
            var getEventsSuccess = function (response) {
                sc.events = response.data;
            };

            var getEventsFailed = function (response) {
                sc.events = response.data;
                sc.getEventsFailed = true;
            };

            EventService.getPage(1, 100, type, null, id).then(getEventsSuccess, getEventsFailed);
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
        };

        sc.getUserFollowingById = function (id) {
            var success = function (response) {
                sc.userFollowing = response.data;
            };

            var failed = function (response) {
                sc.userFollowing = response.data;
            };

            UserService.getFollowing(id).then(success, failed);
        };

        sc.getFollowingById = function (id) {
            var success = function (response) {
                sc.following = response.data;

                if (sc.following.items.find(sc.findFollowingUser) != null) {
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

        sc.getFollowersById = function (id) {
            var success = function (response) {
                sc.followers = response.data;
            };

            var failed = function (response) {
                sc.followers = response.data;
            };

            UserService.getFollowers(id).then(success, failed);
        };

        sc.followOnUser = function (id) {
            var success = function (response) {
                sc.getFollowingById(sc.currentUser.id);
                sc.getFollowersById(sc.userId);
                sc.follow = !sc.follow;
                sc.noFollow = !sc.noFollow;
            };

            var failed = function (response) {
                sc.getFollowingById(sc.currentUser.id);
                sc.getFollowersById(sc.userId);
                sc.follow = !sc.follow;
                sc.noFollow = !sc.noFollow;
            };

            var user = {
                'user_id': parseInt(id),
                'current_user': parseInt(sc.currentUser.id)
            };

            if (sc.follow != true) UserService.follow(user).then(success, failed);
            else UserService.unFollow(sc.following.items.find(sc.findFollowingUser).id).then(success, failed);
        };

        sc.openFollowers = function () {
            ngDialog.open({
                template: 'app/modules/user/profile/followers/user.profile.followers.view.html',
                className: 'ngdialog-theme-default',
                showClose: true,
                scope: $scope
            });
        };

        sc.openFollowing = function () {
            ngDialog.open({
                template: 'app/modules/user/profile/following/user.profile.following.view.html',
                className: 'ngdialog-theme-default',
                showClose: true,
                scope: $scope
            });
        };

    }
})();
