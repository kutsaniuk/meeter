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
