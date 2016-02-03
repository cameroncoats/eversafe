// define the app
// =============================================================================
var app = angular.module('eversafe', ['ui.router', 'ui.bootstrap', 'ui.mask', 'ngSanitize', 'angular-toasty', 'chart.js', 'ui.knob'])

// routes
// =============================================================================
.config(function($stateProvider, $urlRouterProvider, authProvider, $httpProvider) {
    // top level states
    $stateProvider
      .state('home', {
        url: '/home',
        templateUrl: 'partials/home.html',
        controller: 'mainController', data: { requiresLogin: true }
      })
      .state('energy', {
        url: '/energy',
        templateUrl: 'partials/energy.html',
        controller: 'mainController', data: { requiresLogin: true }
      })
      .state('settings', {
        url: '/settings',
        templateUrl: 'partials/settings.html',
        controller: 'mainController', data: { requiresLogin: true }
      })
      .state('login', {
        url: '/login',
        templateUrl: 'partials/login.html',
        controller: 'mainController', data: { requiresLogin: true }
      })
      // catchall state
    $urlRouterProvider.otherwise('/login');
    authProvider.init({
      domain: 'eversafe.eu.auth0.com',
      clientID: 'IJCwctuR17Gj2sECKB6NXQsBZ3JiGleT',
      loginState: 'login' // matches login state
    });
    jwtInterceptorProvider.tokenGetter = ['store', function(store) {
      // Return the saved token
      return store.get('token');
    }];

    $httpProvider.interceptors.push('jwtInterceptor');
  })
  .config(['toastyConfigProvider', function(toastyConfigProvider) {
    toastyConfigProvider.setConfig({
      limit: 1
    });
  }]).run(function($rootScope, auth, store, jwtHelper, $location) {
  // This events gets triggered on refresh or URL change
  $rootScope.$on('$locationChangeStart', function() {
    var token = store.get('token');
    if (token) {
      if (!jwtHelper.isTokenExpired(token)) {
        if (!auth.isAuthenticated) {
          auth.authenticate(store.get('profile'), token);
        }
      } else {
        // Either show the login page or use the refresh token to get a new idToken
        $location.path('/');
      }
    }
  }
  )
    // This hooks al auth events to check everything as soon as the app starts
    auth.hookEvents();
  }
  )
  // Main controller
  // =============================================================================
  .controller('mainController', function($scope, $http, $q, $window, $location, $interval, toasty, auth, store) {
    /////////////////// Buttons ///////////////////////
    //
    //
    $scope.energyNow = {
      value: 70,
      options: {
        fgColor: '#66CC66',
        angleOffset: -125,
        angleArc: 250,
        readOnly: true,
        format: function(v) {
          return v + ' W';
        }
      }
    };
    $scope.button = [];
    $http.get("apiv1/status/1").then(function(response) {
      $scope.button = response.data;
    })
    $scope.labels = ["January", "February", "March", "April", "May", "June", "July"];
    $scope.series = ['Energy Use', 'Energy Cost'];
    $scope.data = [
      [65, 59, 80, 81, 56, 55, 40],
      [28, 48, 40, 19, 86, 27, 90]
    ];
    $scope.isHome = function() {
      if ($scope.button != 'home') {
        $http.put("apiv1/status/1/home");
        $scope.button = 'home';
        toasty.success({
          title: 'Welcome Back',
          showClose: false,
          clickToClose: true,
          timeout: 2500,
          sound: true,
          html: false,
          shake: false,
          limit: 1,
          theme: "material"
        });
      }
    };

    $scope.isAway = function() {
      if ($scope.button != 'away') {
        $http.put("apiv1/status/1/away");
        $scope.button = 'away';
        toasty.success({
          title: "You're Out",
          msg: "We'll keep your home safe",
          showClose: false,
          clickToClose: true,
          timeout: 2500,
          sound: true,
          html: false,
          shake: false,
          limit: 1,
          theme: "material"
        });
      }
    };

    /////////////////// Alerts ///////////////////////
    //
    // object to hold alerts
    $scope.alerts = [];
    // function to handle closing alerts
    $scope.closeAlert = function(index) {
      $scope.alerts.splice(index, 1);
    };
    //// settings
    $scope.energyInfo = {
      billingType: 'variable'
    };
    $scope.energyInfo.variableRateTimes = [];
    $scope.personalInfo = {};
    $scope.addToFieldset = function(name, scope) {
      var newItemNo = $scope.energyInfo.variableRateTimes.length + 1;
      $scope.energyInfo.variableRateTimes.push({
        'id': name + newItemNo
      });
    };
    //remove a fieldset
    $scope.removeFromFieldset = function(name, scope, index) {

      index = index || $scope[scope][name].length - 1;
      $scope[scope][name].splice(index);
    };
    $scope.login = function() {
      auth.signin({}, function(profile, token) {
        // Success callback
        store.set('profile', profile);
        store.set('token', token);
        $location.path('/');
      }, function() {
        // Error callback
      });

    }
    $scope.logout = function() {
      auth.signout();
      store.remove('profile');
      store.remove('token');
    }
  }).directive('capitalize', function() {
    return {
      require: 'ngModel',
      link: function(scope, element, attrs, modelCtrl) {
        var capitalize = function(inputValue) {
          if (inputValue == undefined) inputValue = '';
          var capitalized = inputValue.toUpperCase();
          if (capitalized !== inputValue) {
            modelCtrl.$setViewValue(capitalized);
            modelCtrl.$render();
          }
          return capitalized;
        }
        modelCtrl.$parsers.push(capitalize);
        capitalize(scope[attrs.ngModel]); // capitalize initial value
      }
    };
  });

// Non Angular functions
