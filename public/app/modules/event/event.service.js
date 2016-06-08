(function () {
    'use strict';

    angular
        .module('main')
        .service('EventService', function ($http) {

            var urlBase = '/event';

            this.getPage = function (page, limit, type, name, id) {
                return $http.get(urlBase, {
                    params : {
                        page: page,
                        limit: limit,
                        type: type,
                        name: name,
                        id: id
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

            this.getLikes = function (id) {
                return $http.get(urlBase + '/likes/' + id);
            };

            this.like = function (like) {
                return $http.post(urlBase + '/like', like);
            };

            this.dislike = function (id) {
                return $http.delete(urlBase + '/dislike/' + id);
            };

            this.getMembers = function (id) {
                return $http.get(urlBase + '/members/' + id);
            };

            this.join = function (join) {
                return $http.post(urlBase + '/join', join);
            };

            this.unJoin = function (id) {
                return $http.delete(urlBase + '/unjoin/' + id);
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

            this.searchByName = function (page, limit, name) {
                return $http.get(urlBase + '/name/' + name, {
                    params : {
                        page: page,
                        limit: limit
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

            this.delete = function (event) {
                return $http.post(urlBase + '/delete', event);
            };

        });
})();