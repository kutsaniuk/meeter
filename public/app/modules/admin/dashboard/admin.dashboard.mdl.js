(function () {
    'use strict';

    angular
        .module('admin.dashboard',
            [
                'ui.router'
            ])
        .config(configure);

    configure.$inject = ['$stateProvider'];
    function configure($stateProvider) {

        $stateProvider
            .state('main.admin.dashboard', {
                url: 'dashboard',
                views: {
                    '': {
                        templateUrl: 'app/modules/admin/dashboard/admin.dashboard.view.html',
                        controller: 'UserProfileCtrl'
                    }
                },
                data: {
                    is_granted: ["ROLE_ADMIN"]
                }
            });
    }
})();
