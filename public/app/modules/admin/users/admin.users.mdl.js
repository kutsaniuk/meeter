(function () {
    'use strict';

    angular
        .module('admin.users',
            [
                'ui.router'
            ])
        .config(configure);

    configure.$inject = ['$stateProvider'];
    function configure($stateProvider) {

        $stateProvider
            .state('main.user.users', {
                url: 'users',
                views: {
                    '': {
                        templateUrl: 'app/modules/admin/users/admin.users.view.html',
                        controller: 'AdminUsersCtrl'
                    }
                },
                data: {
                    is_granted: ["ROLE_ADMIN"]
                }
            });
    }
})();
