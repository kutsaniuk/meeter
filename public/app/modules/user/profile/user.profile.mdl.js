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
                        controller: 'UserProfileCtrl as userProfileCtrl'
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
