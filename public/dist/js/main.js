(function () {
    'use strict';

    angular
        .module('main', [
            'user',
            'ui.router',
            'ui.bootstrap',
            'ngCookies',
            'ngAnimate',
            'ngDialog'
        ])
        .config(configure)
        .run(run);

    configure.$inject = ['$stateProvider', '$urlRouterProvider'];
    function configure($stateProvider, $urlRouterProvider) {

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

    }

    run.$inject = ['$rootScope', '$cookieStore', '$state', '$location', '$http'];
    function run($rootScope, $cookieStore, $state, $location, $http) {
        // keep user logged in after page refresh
        $rootScope.globals = $cookieStore.get('globals') || {};

        if ($rootScope.globals.currentUser) {
            $http.defaults.headers.common['Authorization'] = 'Basic ' + $rootScope.globals.currentUser.authdata.id;
            $state.go('main.user.feed');
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

})();

(function () {
    'use strict';

    angular
        .module('main')
        .controller('AuthCtrl', AuthCtrl);

    function AuthCtrl($scope, $state, AuthService, CredentialsService) {
        var sc = $scope;

        CredentialsService.ClearCredentials();

        sc.login = function () {
            AuthService.login(sc.username, sc.password)
                .then(function successCallback(response) {
                    $state.go('main.user.feed');
                    CredentialsService.SetCredentials(response.data.id, sc.username, sc.password);
                    sc.user = response.data;
                }, function errorCallback(response) {
                    sc.authFailed = true;
                });
        };

        sc.register = function () {
            AuthService.register(sc.user)
                .then(function successCallback(response) {
                    alert('success');
                }, function errorCallback(response) {
                    alert('failed');
                });
        };
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

            this.getLikes = function (id) {
                return $http.get(urlBase + '/likes/' + id);
            };

            this.like = function (like) {
                return $http.post(urlBase + '/like', like);
            };

            this.dislike = function (id) {
                return $http.delete(urlBase + '/dislike/' + id);
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
(function () {
    'use strict';

    angular
        .module('main')
        .controller('UserCtrl', UserCtrl);

    function UserCtrl($scope, $rootScope, $cookieStore, EventService, CredentialsService, ngDialog) {
        var sc = $scope;

        sc.getEventsByName = function (page, limit, name) {

            var getPageSuccess = function (response) {
                sc.events = response.data;
            };

            var getPageFailed = function (response) {
                alert(response.status);
            };

            EventService.search(page, limit, name).then(getPageSuccess, getPageFailed);
        }

        sc.logout = function () {
            CredentialsService.ClearCredentials();
        }

        $rootScope.globals = $cookieStore.get('globals') || {};

        sc.userId = $rootScope.globals.currentUser.id;

        sc.createEvent = function () {
            ngDialog.open({
                // template: 'popupTmpl.html',
                className: 'ngdialog-theme-plain'
            });
        }
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

        sc.getEventById = function (id) {
            var getEventSuccess = function (response) {
                sc.event = response.data;
                sc.getUserById(response.data.user_id);
                sc.getEventCommentsById(id, 1, 15);
                sc.getEventLikesById(id);
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

    function UserProfileCtrl($scope, $stateParams, $location, UserService) {
        var sc = $scope;

        sc.userId = $stateParams.id;

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
        }

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
                    }
                }
            })
            .state('main.user.edit', {
                url: 'user/edit/:id',
                views: {
                    '': {
                        templateUrl: 'app/modules/user/profile/edit/user.profile.edit.view.html',
                        controller: 'UserProfileEditCtrl'
                    }
                }
            });

    }
})();

(function () {
    'use strict';

    angular
        .module('main')
        .controller('UserProfileEditCtrl', UserProfileEditCtrl);

    function UserProfileEditCtrl($scope, $rootScope, $cookieStore, $stateParams, UserService, AuthService) {
        var sc = $scope;

        $rootScope.globals = $cookieStore.get('globals') || {};

        sc.userId = $rootScope.globals.currentUser.id;

        sc.getUserById = function (id) {

            var getUserSuccess = function (response) {
                sc.user = response.data;
            };

            var getUserFailed = function (response) {
                alert(response.status);
            };

            UserService.getById(id).then(getUserSuccess, getUserFailed);
        };

        sc.checkPassword = function () {
            return AuthService.login($rootScope.globals.currentUser.username, sc.oldPassword)
                .then(function successCallback(response) {
                    sc.changePassword();
                }, function errorCallback(response) {
                    
                });
        };

        sc.changePassword = function () {

            sc._user = {
                'id': $rootScope.globals.currentUser.id,
                'username': $rootScope.globals.currentUser.username,
                'password': sc.newPassword,
                'name': sc.user.name,
                'email': sc.user.email,
                'created': sc.user.created,
                'active': sc.user.active
            };

            var repeatPasswordChecked = angular.equals(sc.newPassword, sc.repeatNewPassword);

            if (repeatPasswordChecked) {
                UserService.update(sc._user);
                alert("Changed!");
            }
        };

        sc.updateUser = function () {

        }

    }
})();
