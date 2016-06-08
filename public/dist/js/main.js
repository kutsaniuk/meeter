(function () {
    'use strict';
    
    angular
        .module('main', [
            'user',
            'ui.router',
            'ui.bootstrap',
            'ngCookies',
            'ngAnimate',
            'ngDialog',
            'flow',
            'base64',
            'naif.base64',
            'ngScroller',
            'pascalprecht.translate',
            'customFilters'
        ])
        .config(configure)
        .run(run);

    configure.$inject = ['$stateProvider', '$urlRouterProvider', '$translateProvider'];
    function configure($stateProvider, $urlRouterProvider, $translateProvider) {

        $urlRouterProvider.otherwise(function ($injector) {
            var $state = $injector.get("$state");
            $state.go('main.auth');
        });

        $stateProvider
            .state('main', {
                url: '/',
                abstract: true,
                template: '<ui-view></ui-view>'
            })
            .state('main.auth', {
                url: '',
                templateUrl: 'app/modules/auth/auth.view.html',
                controller: 'AuthCtrl'
            });

        $translateProvider.useStaticFilesLoader({
            prefix: '/app/resources/lang/',
            suffix: '.json'
        });

    }

    run.$inject = ['$rootScope', '$cookieStore', '$state', '$translate', '$http', 'UserService'];
    function run($rootScope, $cookieStore, $state, $translate, $http, UserService) {
        // keep user logged in after page refresh
        $rootScope.globals = $cookieStore.get('globals') || {};

        var getUserById = function (id) {

            var getUserSuccess = function (response) {
                $translate.use(response.data.language);
            };

            var getUserFailed = function (response) {
                alert(response.status);
            };

            UserService.getById(id).then(getUserSuccess, getUserFailed);
        };

        if ($rootScope.globals.currentUser) {
            $http.defaults.headers.common['Authorization'] = 'Basic ' + $rootScope.globals.currentUser.authdata.id;
            $state.go('main.user.feed');
            getUserById($rootScope.globals.currentUser.id);
        }

        $rootScope.$on('$locationChangeStart', function (event, next, current) {
            // redirect to login page if not logged in
            if (!$state.is('main.auth') == false && $rootScope.globals.currentUser) {
                $state.go('main.auth');
            }
        });
    }


    angular
        .module('main')
        .directive('ngEnter', function () {
            return function (scope, element, attrs) {
                element.bind("keydown keypress", function (event) {
                    if (event.which === 13) {
                        scope.$apply(function () {
                            scope.$eval(attrs.ngEnter);
                        });

                        event.preventDefault();
                    }
                });
            };
        });

    angular.module('customFilters', []).
    filter('dateInMillis', function() {
        return function(dateString) {
            return Date.parse(dateString);
        };
    });

})();

(function () {
    'use strict';

    angular
        .module('main')
        .controller('AuthCtrl', AuthCtrl);

    function AuthCtrl($scope, $state, AuthService, $cookieStore, $translate, CredentialsService, EventService) {
        var sc = $scope;

        CredentialsService.ClearCredentials();

        sc.lang = 'uk';
        sc.langShow = true;
        $translate.use(sc.lang);

        sc.login = function (username, password) {
            AuthService.login(username, password)
                .then(function successCallback(response) {
                    $state.go('main.user.feed');
                    CredentialsService.SetCredentials(response.data.id, sc.username, sc.password);
                    sc.user = response.data;
                }, function errorCallback(response) {
                    sc.authFailed = true;
                });
        };

        sc.register = function () {
            sc.user.created = new Date().toISOString();
            sc.user.language = sc.lang;
            if (sc.registerForm.$valid && sc.usernameCheked) AuthService.register(sc.user)
                .then(function successCallback(response) {
                    sc.login(sc.user.username, sc.user.password);
                }, function errorCallback(response) {
                    alert('failed');
                });
        };
        
        sc.checkUsername = function (username) {
            AuthService.check(username)
                .then(function successCallback(response) {
                    sc.usernameCheked = true;
                }, function errorCallback(response) {
                    sc.usernameCheked = false;
                });
        };

        sc.getPageEvents = function (page, limit, type, name) {

            var getPageSuccess = function (response) {
                sc.events = response.data;
            };

            var getPageFailed = function (response) {
                alert(response.status);
            };

            EventService.getPage(page, limit, type, name).then(getPageSuccess, getPageFailed);
        };

        sc.setLang = function (lang) {
            $translate.use(lang);
            sc.lang = lang;
            sc.langShow = !sc.langShow;
        }
    }
})();

(function () {
    'use strict';

    angular
    .module('main')
    .service('AuthService', function ($http) {

        var urlBase = '/auth';

        this.login = function (username, password, callback) {
            return $http.post(urlBase + '/login', { username: username, password: password });
        };

        this.register = function (user) {
            return $http.post(urlBase + '/register', user);
        };

        this.check = function (username) {
            return $http.get(urlBase + '/check', {
                params: {
                    username: username
                }
            });
        };

    });

    angular
    .module('main')
    .factory('CredentialsService',
    function (Base64, $http, $cookieStore, $rootScope) {
        var service = {};
 
        service.SetCredentials = function (id, username, password) {
            var authdata = Base64.encode(username + ':' + password);
 
            $rootScope.globals = {
                currentUser: {
                    id: id,
                    username: username,
                    authdata: authdata
                }
            };
 
            $http.defaults.headers.common['Authorization'] = 'Basic ' + authdata; // jshint ignore:line
            $cookieStore.put('globals', $rootScope.globals);
        };
 
        service.ClearCredentials = function () {
            $rootScope.globals = {};
            $cookieStore.remove('globals');
            $http.defaults.headers.common.Authorization = 'Basic ';
        };
 
        return service;
    });

    angular
    .module('main')
    .factory('Base64', function () {
    /* jshint ignore:start */

    var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

    return {
    encode: function (input) {
        var output = "";
        var chr1, chr2, chr3 = "";
        var enc1, enc2, enc3, enc4 = "";
        var i = 0;

        do {
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }

            output = output +
                keyStr.charAt(enc1) +
                keyStr.charAt(enc2) +
                keyStr.charAt(enc3) +
                keyStr.charAt(enc4);
            chr1 = chr2 = chr3 = "";
            enc1 = enc2 = enc3 = enc4 = "";
        } while (i < input.length);

        return output;
    },

    decode: function (input) {
        var output = "";
        var chr1, chr2, chr3 = "";
        var enc1, enc2, enc3, enc4 = "";
        var i = 0;

        // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
        var base64test = /[^A-Za-z0-9\+\/\=]/g;
        if (base64test.exec(input)) {
            window.alert("There were invalid base64 characters in the input text.\n" +
                "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
                "Expect errors in decoding.");
        }
        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

        do {
            enc1 = keyStr.indexOf(input.charAt(i++));
            enc2 = keyStr.indexOf(input.charAt(i++));
            enc3 = keyStr.indexOf(input.charAt(i++));
            enc4 = keyStr.indexOf(input.charAt(i++));

            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;

            output = output + String.fromCharCode(chr1);

            if (enc3 != 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
                output = output + String.fromCharCode(chr3);
            }

            chr1 = chr2 = chr3 = "";
            enc1 = enc2 = enc3 = enc4 = "";

        } while (i < input.length);

        return output;
    }
    };

    /* jshint ignore:end */
    });
})();
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
(function () {
    'use strict';

    angular
        .module('main')
        .controller('UserCtrl', UserCtrl);

    function UserCtrl($scope, $rootScope, $location, $cookieStore, $translate, EventService, CredentialsService, ngDialog) {
        var sc = $scope;

        sc.getEventsByName = function (page, limit, name) {

            var getPageSuccess = function (response) {
                sc.events = response.data;
            };

            var getPageFailed = function (response) {
                // alert(response.status);
            };

            EventService.search(page, limit, name).then(getPageSuccess, getPageFailed);
        };

        sc.logout = function () {
            CredentialsService.ClearCredentials();
        };

        // $rootScope.globals = $cookieStore.get('globals') || {};

        sc.userId = $rootScope.globals.currentUser.id;

        sc.createEvent = function () {
            ngDialog.open({
                template: 'app/modules/user/event/new/user.event.new.view.html',
                className: 'ngdialog-theme-event',
                showClose: false,
                controller: 'EventNewCtrl'
            });
        };  

        sc.linkSearch = function (searchName) {
            $location.path('/search/' + searchName);
        };

    }
})();

(function () {
    'use strict';

    angular
        .module('user',
            [
                'user.feed',
                'user.profile',
                'user.event',
                'user.search',
                'ui.router'
            ])
        .config(configure); 

    configure.$inject = ['$stateProvider'];
    function configure($stateProvider) {

        $stateProvider
            .state('main.user', {
                url: '',
                abstract: true,
                templateUrl: 'app/modules/user/user.view.html',
                controller: 'UserCtrl'
            });
    }
})();

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

        });
})();
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
            sc.findFollowingUser = function (following) {
                return following.user_id === id;
            };

            var getUserSuccess = function (response) {
                sc.user = response.data;
                sc.followShow = sc.user.id != sc.currentUser.id;
                sc.joinShow = sc.user.id != sc.currentUser.id;
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
                sc.getEventCommentsById(id, 1, 100);
                sc.getEventLikesById(id);
                sc.getFollowingById(sc.currentUser.id);
                sc.getEventMembersById(id);
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
                'user_id': sc.currentUser.id,
                'created': new Date().toISOString()
            };

            if (sc.like != true) EventService.like(like).then(success, failed);
            else EventService.dislike(sc.likes.find(sc.findUser).id).then(success, failed);
        };

        sc.getEventMembersById = function (id) {
            var success = function (response) {
                sc.members = response.data;

                sc.findUser = function (user) {
                    return user.user_id === sc.currentUser.id;
                };

                if (sc.members.find(sc.findUser) != null) {
                    sc.join = true;
                    sc.unJoin = false;
                }
                else {
                    sc.join = false;
                    sc.unJoin = true;
                }
            };

            var failed = function (response) {
                sc.members = response.data;
                sc.join = false;
                sc.unJoin = true;
            };

            EventService.getMembers(id).then(success, failed);
        };

        sc.joinToEvent = function () {
            var success = function (response) {
                sc.getEventMembersById(sc.eventId);
                sc.join = !sc.join;
                sc.unJoin = !sc.unJoin;
            };

            var failed = function (response) {
                sc.getEventLikesById(sc.eventId);
                sc.join = !sc.join;
                sc.unJoin = !sc.unJoin;
            };

            var join = {
                'event_id': sc.eventId,
                'user_id': sc.currentUser.id
            };

            if (sc.join != true) EventService.join(join).then(success, failed);
            else EventService.unJoin(sc.members.find(sc.findUser).id).then(success, failed);
        };

        sc.getFollowingById = function (id) {
            var success = function (response) {
                sc.following = response.data.items;
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

(function () {
    'use strict';

    angular
        .module('user.event',
            [
                'ui.router'
            ])
        .config(configure);

    configure.$inject = ['$stateProvider'];
    function configure($stateProvider) {

        $stateProvider
            .state('main.user.event', {
                url: 'event/:id',
                templateUrl: 'app/modules/user/event/user.event.view.html',
                controller: 'EventCtrl'
            });
    }
})();

(function () {
    'use strict';

    angular
        .module('main')
        .controller('UserFeedCtrl', UserFeedCtrl);

    function UserFeedCtrl($scope, $rootScope, $cookieStore, EventService, UserService) {
        var sc = $scope;

        $rootScope.globals = $cookieStore.get('globals') || {};
        sc.currentUser = $rootScope.globals.currentUser;

        sc.getPageEvents = function (page, limit, type, name) {
            
            var getPageSuccess = function (response) {
                sc.events = response.data;  
            };

            var getPageFailed = function (response) {
                alert(response.status);
            };

            EventService.getPage(page, limit, type, name).then(getPageSuccess, getPageFailed);
        };

        sc.getEventLikesById = function (id) {
            var success = function (response) {
                sc.likes = response.data;

                sc.findUser = function (user) {
                    return user.user_id === sc.currentUser.id;
                }

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


    }
})();

(function () {
    'use strict';

    angular
        .module('user.feed', ['ui.router'])
        .config(configure);

    configure.$inject = ['$stateProvider', '$urlRouterProvider'];
    function configure($stateProvider, $urlRouterProvider) {

        $stateProvider
            .state('main.user.feed', {
                url: 'feed',
                views: {
                    '': {
                        templateUrl: 'app/modules/user/feed/user.feed.view.html',
                        controller: 'UserFeedCtrl'
                    }
                }
            });
        
    }
})();

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
        sc.currentPage = 1;

        sc.getUserById = function (id) {

            sc.findFollowingUser = function (following) {
                return following.user_id === id;
            };

            var getUserSuccess = function (response) {
                sc.user = response.data;
                sc.getFollowingById(sc.currentUser.id);
                sc.followShow = sc.user.id != sc.currentUser.id;
                sc.editShow = sc.user.id == sc.currentUser.id;
                sc.removeShow = sc.user.id == sc.currentUser.id;
            };

            var getUserFailed = function (response) {
                alert(response.status);
            };

            UserService.getById(id).then(getUserSuccess, getUserFailed);
        };

        sc.getUserEventsById = function (id, type, page) {
            var getEventsSuccess = function (response) {
                sc.events = response.data;
            };

            var getEventsFailed = function (response) {
                sc.events = response.data;
                sc.getEventsFailed = true;
            };

            EventService.getPage(page, 9, type, null, id).then(getEventsSuccess, getEventsFailed);
        };

        sc.editUserProfile = function (id) {
            $location.path('/user/' + id + '/settings');
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
        
        sc.removeEvent = function (id) {
            
            var event = {
                'id': id,
                'user_id': sc.userId
            };

            var getEventsSuccess = function (response) {
                sc.getUserEventsById(sc.userId, null, sc.currentPage);
            };

            var getEventsFailed = function (response) {

            };

            EventService.delete(event).then(getEventsSuccess, getEventsFailed);
        };

        sc.getUserById(sc.userId);

    }
})();

(function () {
    'use strict';

    angular
        .module('user.profile', [
            'ui.router'
        ])
        .config(configure);

    configure.$inject = ['$stateProvider'];
    function configure($stateProvider) {

        $stateProvider
            .state('main.user.profile', {
                url: 'user/:id',
                views: {
                    '': {
                        templateUrl: 'app/modules/user/profile/user.profile.view.html',
                        controller: 'UserProfileCtrl'
                    },
                    '@main.user.profile': {
                        templateUrl: 'app/modules/user/profile/main/user.profile.main.view.html'
                    }
                }
            })  
            .state('main.user.profile.events', {
                url: '/events',
                views: {
                    '': {
                        templateUrl: 'app/modules/user/profile/events/user.profile.events.view.html'
                    }
                }
            })
            .state('main.user.profile.settings', {
                url: '/settings',
                views: {
                    '': {
                        templateUrl: 'app/modules/user/profile/settings/user.profile.settings.view.html',
                        controller: 'UserProfileSettingsCtrl'
                    },
                    '@main.user.profile.settings': {
                        templateUrl: 'app/modules/user/profile/settings/edit/user.profile.settings.edit.view.html',
                        controller: 'UserProfileSettingsCtrl'
                    }
                }
            })
            .state('main.user.profile.settings.password', {
                url: '/password',
                views: {
                    '': {
                        templateUrl: 'app/modules/user/profile/settings/password/user.profile.settings.password.view.html',
                        controller: 'UserProfileSettingsCtrl'
                    }
                }
            });

    }
})();

(function () {
    'use strict';

    angular
        .module('main')
        .controller('UserSearchCtrl', UserSearchCtrl);

    function UserSearchCtrl($scope, $stateParams, $location, UserService, EventService, CredentialsService, ngDialog) {
        var sc = $scope;

        sc.name = $stateParams.name;
        sc.currentPage1 = 1;
        sc.currentPage2 = 1;


        sc.getEventsByName = function (page, limit, name) {

            var getPageSuccess = function (response) {
                sc.events = response.data;
            };

            var getPageFailed = function (response) {
                // alert(response.status);
            };
            sc.eventsLimit = limit;
            EventService.searchByName(page, limit, name).then(getPageSuccess, getPageFailed);
        };

        sc.getUserByUsername = function (page, limit, username) {

            var getPageSuccess = function (response) {
                sc.users = response.data;
            };

            var getPageFailed = function (response) {
                // alert(response.status);
            };
            sc.usersLimit = limit;
            UserService.searchByUsername(page, limit, username).then(getPageSuccess, getPageFailed);
        };

        sc.linkSearch = function (searchName) {
            $location.path('/search/' + searchName);

        };

        sc.getUserById = function (id) {
 
            var getUserSuccess = function (response) {
                sc._user = response.data;
            };

            var getUserFailed = function (response) {
                alert(response.status);
            };

            UserService.getById(id).then(getUserSuccess, getUserFailed);
        };
        
        sc.search = function (searchName) {
            $location.path('/search/' + searchName);
        };

        sc.getEventsByName(1, 3, sc.name);
        
        sc.getUserByUsername(1, 4, sc.name);
        
        
    }
})();

(function () {
    'use strict';

    angular
        .module('user.search', [
            'ui.router'
        ])
        .config(configure);
 
    configure.$inject = ['$stateProvider'];
    function configure($stateProvider) {

        $stateProvider
            .state('main.user.search', {
                url: 'search/:name',
                views: {
                    '': {
                        templateUrl: 'app/modules/user/search/user.search.view.html',
                        controller: 'UserSearchCtrl'
                    }
                }
            }) ;

    }
})();

(function () {
    'use strict';

    angular
        .module('main')
        .controller('EventNewCtrl', EventNewCtrl);

    function EventNewCtrl($scope, $http, $locale, $stateParams, $rootScope, $cookieStore, EventService, UserService) {
        var sc = $scope;

        sc.eventId = $stateParams.id;
        $rootScope.globals = $cookieStore.get('globals') || {};
        sc.currentUser = $rootScope.globals.currentUser;

        sc.event = {
            'date': new Date(),
            'time': new Date(),
            'type': 'entertainment'
        };

        sc.dateOptions = {
            formatYear: 'yy',
            maxDate: new Date(2020, 5, 22),
            minDate: new Date(),
            startingDay: 1
        };

        sc.createEvent = function (event) {
            event.date.setHours(event.time.getHours() + 3, event.time.getMinutes());

            if (event.name != ''
                && event.description != ''
                && event.image != null
                && event.location != ''
                && sc.eventForm.$valid) {
                var _event = {
                    'name': event.name,
                    'date': event.date,
                    'description': event.description,
                    'type': event.type,
                    'user_id': parseInt(sc.currentUser.id),
                    'image': event.image.base64,
                    'location': event.location,
                    'created': new Date().toISOString()
                };
                
                EventService.create(_event);
                sc.closeThisDialog(true);
            }
        };

    }
})();

(function () {
    'use strict';

    angular
        .module('main')
        .controller('UserProfileSettingsCtrl', UserProfileSettingsCtrl);

    function UserProfileSettingsCtrl($scope, $rootScope, $cookieStore, $translate, CredentialsService, UserService, AuthService, $state) {
        var sc = $scope;

        // $rootScope.globals = $cookieStore.get('globals') || {};

        sc.userId = $rootScope.globals.currentUser.id;

        sc.checkUsernameShow = false;

        sc.getUserById = function (id) {

            var getUserSuccess = function (response) {
                sc.user = response.data;
            };

            var getUserFailed = function (response) {
                alert(response.status);
            };

            UserService.getById(id).then(getUserSuccess, getUserFailed);
        };

        sc.checkPassword = function (user) {
            AuthService.login($rootScope.globals.currentUser.username, user.oldPassword)
                .then(function successCallback(response) {
                    sc.failedPassword = false;
                }, function errorCallback(response) {
                    sc.failedPassword = true;
                });
        };
        
        sc.repeatPasswordCheck = function (user) {
            sc.repeatPasswordChecked = angular.equals(user.newPassword, user.repeatNewPassword);
            if (!sc.repeatPasswordChecked) sc.passwordRepeatFailed = true;
            else sc.passwordRepeatFailed = false;
        };

        sc.changePassword = function (user) {

            sc._user = {
                'id': $rootScope.globals.currentUser.id,
                'password': user.newPassword
            };

            sc.repeatPasswordCheck(user);

            if (sc.passwordForm.$valid && !sc.failedPassword && sc.repeatPasswordChecked && user.newPassword != null && user.repeatNewPassword != null) {
                UserService.update(sc._user, 'password'); 
                alert("Changed!");
            }
        };

        sc.updateUser = function (user) {
            var success = function (response) {
                CredentialsService.SetCredentials(sc.userId, response.data.username, response.data.password);
                sc.getUserById(sc.userId);
            };
            var failed = function () {

            };
            if (sc.userProfileEditForm.$valid && sc.usernameCheked) UserService.update(user, 'general').then(success, failed);
        };

        sc.getTab = function (tab) {
            if (tab !== undefined)
            {
                $state.go('main.user.profile.settings.' + tab);
                sc.tab = tab;
            }
            else $state.go('main.user.profile.settings');
        };

        sc.updateAvatar = function (_avatar) {
            var avatar = {
                'id': sc.userId,
                'image': _avatar.base64,
                'type': _avatar.filetype,
                'user_id': sc.userId
            };

            var success = function (response) {
                sc.avatarUpload = true;
            };
            var failed = function () {

            };
            UserService.updateAvatar(avatar).then(success, failed);
        };

        sc.updateBackground = function (_background) {
            var background = {
                'id': sc.userId,
                'image': _background.base64,
                'type': _background.filetype,
                'user_id': sc.userId
            };

            var success = function (response) {
                sc.avatarBackground = true;
            };
            var failed = function () {

            };
            UserService.updateBackground(background).then(success, failed);
        };

        sc.checkUsername = function (username) {
            sc.checkUsernameShow = true;
            AuthService.check(username)
                .then(function successCallback(response) {
                    sc.usernameCheked = true;
                }, function errorCallback(response) {
                    sc.usernameCheked = false;
                });
        };
        
        sc.setLang = function (lang) {
            var success = function (response) {
                $translate.use(response.data.language);
            };
            var failed = function () {

            };

            var _lang = {
                'id': sc.userId,
                'language': sc.user.language
            };
            UserService.update(_lang, 'lang').then(success, failed);
        }

    }
})();
