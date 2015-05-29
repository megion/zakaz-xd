angular.module('auth')

    .run(['$rootScope', '$state', 'AuthService', function ($rootScope, $state, AuthService) {
        $rootScope.$on("$stateChangeStart", function (event, toState, toParams, fromState, fromParams) {
            if (toState.data && toState.data.userRoles && toState.data.userRoles.length>0) {
            	
            	if(!AuthService.isLoggedIn()) {
            		$rootScope.fromState = fromState.name;
            		// user is not logged in
            		AuthService.notAuthenticated(event);
            		return;
            	}
            	
                if(!AuthService.authorize(toState.data.userRoles)) {
                	$rootScope.fromState = fromState.name;
                	// user is not allowed
                	AuthService.notAuthorized(event);
            	}
            }
        });
    }])

    .factory('AuthInterceptor', ['$q', '$cookies', 'AuthService', function ($q, $cookies, AuthService) {
        return {
            responseError: function (response) {
            	if (response.status === 401) {
            		// user is not logged in
            		AuthService.notAuthenticated(event);
            	}
                if (response.status === 403) {
                	// user is not allowed
                	AuthService.notAuthorized(event);
                }
                return $q.reject(response);
            }
        };
    }])

    .config(['$httpProvider', function ($httpProvider) {
        $httpProvider.interceptors.push('AuthInterceptor');
    }])
    
    .service('AuthService', function($q, $firebase, fbRef, fbAuth) {
	});