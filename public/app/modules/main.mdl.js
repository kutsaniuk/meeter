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
            'pascalprecht.translate',
            'customFilters',
            'cr.acl'
        ])
        .config(configure)
        .run(run);

    configure.$inject = ['$stateProvider', '$urlRouterProvider', '$translateProvider'];
    function configure($stateProvider, $urlRouterProvider, $translateProvider) {

        $urlRouterProvider.otherwise(function ($injector) {
            var $state = $injector.get("$state");
            $state.go('main.user.feed');
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
                controller: 'AuthCtrl',
                data: {
                    is_granted: ["ROLE_GUEST"]
                }
            });

        $translateProvider.useStaticFilesLoader({
            prefix: '/app/resources/lang/',
            suffix: '.json'
        });

    }

    run.$inject = ['$rootScope', '$cookieStore', '$state', '$translate', '$http', 'UserService', 'crAcl'];
    function run($rootScope, $cookieStore, $state, $translate, $http, UserService, crAcl) {
        // keep user logged in after page refresh
        $rootScope.globals = $cookieStore.get('globals') || {};

        crAcl.setInheritanceRoles({
            "ROLE_USER": ["ROLE_USER"],
            "ROLE_ADMIN": ["ROLE_ADMIN", "ROLE_USER"],
            "ROLE_GUEST": ["ROLE_GUEST"]
        });

        crAcl.setRedirect('main.auth');

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
            getUserById($rootScope.globals.currentUser.id);
            crAcl.setRole($rootScope.globals.currentUser.role);
        }
        else crAcl.setRole("ROLE_GUEST");

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

    angular.module('customFilters', []).filter('dateInMillis', function () {
        return function (dateString) {
            return Date.parse(dateString);
        };
    });

})();
