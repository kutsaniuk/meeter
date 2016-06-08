(function () {
    'use strict';

    angular
        .module('admin',
            [
                'admin.dashboard',
                'ui.router'
            ])
        .config(configure); 

    configure.$inject = ['$stateProvider'];
    function configure($stateProvider) {

        $stateProvider
            .state('main.admin', {
                url: '',
                abstract: true,
                templateUrl: 'app/modules/admin/admin.view.html',
                controller: 'UserCtrl',
                data: {
                    is_granted: ["ROLE_ADMIN"]
                }
            });
    }
})();
