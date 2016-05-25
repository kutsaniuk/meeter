(function () {
    'use strict';

    angular
        .module('main')
        .service('UserService', function ($http) {

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

            this.getById = function (id) {
                return $http.get(urlBase + '/profile/' + id);
            };

            this.getEventsById = function (id) {
                return $http.get(urlBase + '/events/' + id);
            };

            this.create = function (user) {
                return $http.post(urlBase + '/create', user);
            };

            this.update = function (user) {
                return $http.post(urlBase + '/update', user);
            };

            this.getFollowing = function (id) {
                return $http.get(urlBase + '/following/' + id);
            };

            this.follow = function (user) {
                return $http.post(urlBase + '/follow', user);
            };

            this.unFollow = function (id) {
                return $http.delete(urlBase + '/unfollow/' + id);
            };

        });
})();