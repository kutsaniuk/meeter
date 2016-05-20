(function () {
    'use strict';

    angular
        .module('main')
        .service('EventService', function ($http) {

            var urlBase = '/event';

            this.getPage = function (page, limit, type, name) {
                return $http.get(urlBase, {
                    params : {
                        page: page,
                        limit: limit,
                        type: type,
                        name: name
                    }
                });
            };

            this.getComments = function (id, page, limit) {
                return $http.get(urlBase + '/comments/' + id, {
                    params : {
                        page: page,
                        limit: limit
                    }
                });
            };

            this.createComment = function (comment) {
                return $http.post(urlBase + '/comment', comment);
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
            
            this.create = function (event) {
                return $http.post(urlBase + '/create', event);
            };

            this.update = function (event) {
                return $http.post(urlBase + '/update', event);
            };

        });
})();