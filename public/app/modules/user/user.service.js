(function () {
    'use strict';

    angular
        .module('main')
        .service('UserService', function ($http, $filter) {

            var urlBase = '/user';

            this.getPage = function (page, limit) {
                return $http.get(urlBase, {
                    params : {
                        page: page,
                        limit: limit
                    }
                });
            };

            this.search = function (page, limit, name) {
                return $http.get(urlBase + '/search', {
                    params : {
                        page: page,
                        limit: limit,
                        name: name
                    }
                });
            };

            this.searchByUsername = function (page, limit, username) {
                return $http.get(urlBase + '/username/' + username, {
                    params : {
                        page: page,
                        limit: limit
                    }
                });
            };

            this.getById = function (id) {
                return $http.get(urlBase + '/profile/' + id);
            };

            this.getEventsById = function (id) {
                return $http.get(urlBase + '/events/' + id);
            };

            this.create = function (user) {
                return $http.post(urlBase + '/create', user);
            };

            this.active = function (user) {
                return $http.post(urlBase + '/active', user);
            };

            this.role = function (user) {
                return $http.post(urlBase + '/role', user);
            };

            this.update = function (user, type) {
                return $http.put(urlBase + '/update/' + type, user);
            };

            this.getFollowing = function (id) {
                return $http.get(urlBase + '/following/' + id);
            };

            this.getFollowers = function (id) {
                return $http.get(urlBase + '/followers/' + id);
            };

            this.follow = function (user) {
                return $http.post(urlBase + '/follow', user);
            };

            this.unFollow = function (id) {
                return $http.delete(urlBase + '/unfollow/' + id);
            };

            this.updateAvatar = function (avatar) {
                return $http.post(urlBase + '/setavatar', avatar);
            };

            this.updateBackground = function (background) {
                return $http.post(urlBase + '/setbackground', background);
            };

            this.activity = function (page, limit, type) {
                var currentDate = new Date();
                currentDate.setHours(0);
                return $http.get('/activity/' + type, {
                    params: {
                        page: page,
                        limit: limit,
                        date: $filter("date")(currentDate.toISOString(),'yyyy-MM-dd HH:MM:ss')
                    }
                });
            };

        });
})();