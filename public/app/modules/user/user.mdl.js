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
