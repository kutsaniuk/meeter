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
                },
                data: {
                    is_granted: ["ROLE_USER"]
                }
            }) ;

    }
})();
