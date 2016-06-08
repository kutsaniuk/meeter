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
                },
                data: {
                    is_granted: ["ROLE_USER"]
                }
            });

    }
})();
