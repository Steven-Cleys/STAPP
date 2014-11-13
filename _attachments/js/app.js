// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('stapp', ['ionic','stapp.controllers'])

.config(function($stateProvider, $urlRouterProvider) {
	$urlRouterProvider.otherwise('/index');
	
  $stateProvider
  	.state('index', {
      url: "/index",
      templateUrl: "templates/map.html",
      controller: 'MapCtrl'
  })
  .state('question', {
      url: "/question",
      templateUrl: "templates/question.html",
      controller: 'QuestionCtrl'     
  })
});