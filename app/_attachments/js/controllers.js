var myApp = angular.module('stapp.controllers', [])
var myPopup;

myApp.controller('MapCtrl', function($scope, $ionicLoading, $compile,
		$ionicPopup) {
	function initialize() {
		var myLatlng = new google.maps.LatLng(51.21968667200008,
				4.4009229560000449); // to
		// do,
		// current
		// coords

		var mapOptions = {
			center : myLatlng,
			zoom : 16,
			mapTypeId : google.maps.MapTypeId.ROADMAP
		};
		var map = new google.maps.Map(document.getElementById("map"),
				mapOptions);

		//						google.maps.event.addListener(marker, 'click',
		//								function() {
		//									infowindow.open(map, marker);
		//								});

		$scope.map = map;

		google.maps.event.addListenerOnce(map, 'tilesloaded', function() {
				$ionicLoading.hide();

			console.log("map loaded");

		});

	}

	initialize();
	showspinner();
	
	if(localStorage.getItem('logins') != null)
		{
		console.log(localStorage.getItem('logins'));
		}
	else
		{
		console.log("its empty");
		myPopup = $ionicPopup.show({
			templateUrl : 'templates/login.html',
			scope : $scope
		});
		}
	
//	var tmp = '';
//	if (localStorage.getItem('logins') != null)
//	tmp = JSON.parse(localStorage.getItem('logins'));
	


	function showspinner() {
		$ionicLoading.show({
			template : '<i class="icon ion-loading-a"></i>',
		});
	}
	;

	//showspinner();

	//					$scope.centerOnMe = function() {
	//						if (!$scope.map) {
	//							return;
	//						}
	//
	//						$scope.loading = $ionicLoading.show({
	//							content : 'Getting current location...',
	//							showBackdrop : false
	//						});
	//
	//						navigator.geolocation.getCurrentPosition(
	//								function(pos) {
	//									$scope.map
	//											.setCenter(new google.maps.LatLng(
	//													pos.coords.latitude,
	//													pos.coords.longitude));
	//									$scope.loading.hide();
	//								}, function(error) {
	//									alert('Unable to get location: '
	//											+ error.message);
	//								});
	//					};
	//
	//					$scope.clickTest = function() {
	//						alert('Example of infowindow with ng-click')
	//					};

});

myApp.controller('QuestionCtrl', function($scope) {
	//console.log("lalal");
})

myApp.controller('LoginCtrl', function($scope, $ionicPopup) {

	// Perform the login action when the user submits the login form
	$scope.doLogin = function() {
		console.log('Doing login', $scope.login);
		// Simulate a login delay. Remove this and replace with your login
		// code if using a login system
		localStorage.setItem('logins', JSON.stringify($scope.login));


		myPopup.close();
	};
})
