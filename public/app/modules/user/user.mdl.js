(function () {
    'use strict';

    angular
        .module('user',
            [
                'user.feed',
                'user.profile',
                'user.event',
                'user.search',
                'user.activity',
                'ui.router',
                'admin.dashboard',
                'admin.users'
            ])
        .config(configure); 

    configure.$inject = ['$stateProvider'];
    function configure($stateProvider) {

        $stateProvider
            .state('main.user', {
                url: '',
                abstract: true,
                templateUrl: 'app/modules/user/user.view.html',
                controller: 'UserCtrl',
                data: {
                    is_granted: ["ROLE_USER"]
                }
            });        
    }
})();
