(function () {
    'use strict';

    angular
        .module('user.activity', ['ui.router'])
        .config(configure);

    configure.$inject = ['$stateProvider', '$urlRouterProvider'];
    function configure($stateProvider) {

        $stateProvider
            .state('main.user.activity', {
                url: 'activity',
                views: {
                    '': {
                        templateUrl: 'app/modules/user/activity/user.activity.view.html',
                        controller: 'UserActivityCtrl'
                    }
                },
                data: {
                    is_granted: ["ROLE_USER"]
                }
            });

    }
})();
