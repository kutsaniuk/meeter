(function () {
    'use strict';

    angular
        .module('user.event',
            [
                'ui.router'
            ])
        .config(configure);

    configure.$inject = ['$stateProvider'];
    function configure($stateProvider) {

        $stateProvider
            .state('main.user.event', {
                url: 'event/:id',
                templateUrl: 'app/modules/user/event/user.event.view.html',
                controller: 'EventCtrl',
                data: {
                    is_granted: ["ROLE_USER"]
                }
            });
    }
})();
