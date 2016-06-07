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
