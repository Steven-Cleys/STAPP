var myApp = angular.module('stapp.controllers', [])
var myPopup;

myApp.controller('MapCtrl', function($scope, $ionicLoading, $compile,$http,
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

		// google.maps.event.addListener(marker, 'click',
		// function() {
		// infowindow.open(map, marker);
		// });

		$scope.map = map;

		google.maps.event.addListenerOnce(map, 'tilesloaded', function() {
			$ionicLoading.hide();

			console.log("map loaded");

		});

	}

	initialize();
	showspinner();

	if (localStorage.getItem('logins') != null) {
		console.log(localStorage.getItem('logins'));
	} else {
		console.log("its empty");
		myPopup = $ionicPopup.show({
			templateUrl : 'templates/login.html',
			scope : $scope
		});
	}

	function showspinner() {
		$ionicLoading.show({
			template : '<i class="icon ion-loading-a"></i>',
		});
	}
	;

	// showspinner();

	// $scope.centerOnMe = function() {
	// if (!$scope.map) {
	// return;
	// }
	//
	// $scope.loading = $ionicLoading.show({
	// content : 'Getting current location...',
	// showBackdrop : false
	// });
	//
	// navigator.geolocation.getCurrentPosition(
	// function(pos) {
	// $scope.map
	// .setCenter(new google.maps.LatLng(
	// pos.coords.latitude,
	// pos.coords.longitude));
	// $scope.loading.hide();
	// }, function(error) {
	// alert('Unable to get location: '
	// + error.message);
	// });
	// };
	//
	// $scope.clickTest = function() {
	// alert('Example of infowindow with ng-click')
	// };
	function loadQuestions() {
		$http.jsonp('http://pedlianderserourtaniedsc:XyFWhFRUkHaSb5S75cBQ0R73@stapp.cloudant.com/ap/_design/views/_view/questions?callback=JSON_CALLBACK') 
				.then( 
						function(resp) {
							console.log(resp);
							window.localStorage['questions'] = JSON
									.stringify(resp.data.rows);
						}, function(err) {
							console.error('ERR', err);
							console.log(err.status);
						})
		if (window.localStorage['questions'] != null) {
			console.log("questions loaded");
		} else {
			console.log("questions not loaded");
		}

		window.localStorage['questionOk'] = "0";
		window.localStorage['questionNok'] = "0";
	}
	loadQuestions();
});

myApp
		.controller(
				'QuestionCtrl',
				function($scope, $ionicPopup, $state) {
					var qrcode = 3;
					var question = {};
					var arr = JSON.parse(window.localStorage['questions']);

					for (var i = 0; i < arr.length; i++) {
						if (arr[i].id.indexOf('_design') == -1) {
							var doc = arr[i].doc;
							if (qrcode == doc.qrCode) {
								question.hotspot = doc.hotspot;
								question.question = doc.question;
								if (doc.image != null) {// de rest van de image
														// nog in orde
														// maken!!!!!!!!!!
									question.image = doc.image;
								} else {
									console.log("Geen image");
								}
								question.allAnswers = doc.allAnswers;
								if (doc.allAnswers != null) {
									document.getElementById("multi").style.visibility = "visible";
									document.getElementById("open").style.visibility = "hidden";
								}
								question.answer = doc.answer
							}
						}
					}
					$scope.question = [ {
						"question" : question.question
					} ];
					$scope.hotspot = [ {
						"hotspot" : question.hotspot
					} ];

					if (question.allAnswers != null) {
						$scope.answer = [];
						var possibleAnswer = question.allAnswers.split(";");
						for (var i = 0; i < possibleAnswer.length; i++) {
							$scope.answer.push({
								"items" : possibleAnswer[i]
							})
						}
					}

					$scope.validate = function() {
						var ok = window.localStorage['questionOk'];
						var nok = window.localStorage['questionNok'];
						var i = ok.length;
						var answer = $scope.validate.answer;
						var alertPopup;
						if (answer != null) {
							if (answer == question.answer) {
								ok = ok + ";" + qrcode;
								alertPopup = $ionicPopup.alert({
									title : 'Correct!',
									buttons : [ {
										text : 'OK',
										type : 'button-assertive'
									} ]
								});
							} else {
								nok = nok + ";" + qrcode;
								alertPopup = $ionicPopup.alert({
									title : 'U heeft fout gantwoord.',
									buttons : [ {
										text : 'OK',
										type : 'button-assertive'
									} ]
								});
							}
						} else {
							if (question.allAnswers != null) {
								alertPopup = $ionicPopup
										.alert({
											title : 'Gelieve een antwoord aan te duiden.',
											buttons : [ {
												text : 'OK',
												type : 'button-assertive'
											} ]
										});
							} else {
								alertPopup = $ionicPopup
										.alert({
											title : 'Gelieve een antwoord in te vullen.',
											buttons : [ {
												text : 'OK',
												type : 'button-assertive'
											} ]
										});
							}
						}
						window.localStorage['questionOk'] = ok;
						window.localStorage['questionNok'] = nok;
						console.log(window.localStorage['questionOk']);
						console.log(window.localStorage['questionNok']);
					}
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

myApp.controller("ExampleController", function($scope, $cordovaBarcodeScanner) {

	$scope.scanBarcode = function() {
		$cordovaBarcodeScanner.scan().then(function(imageData) {
			alert(imageData.text);
			console.log("Barcode Format -> " + imageData.format);
			console.log("Cancelled -> " + imageData.cancelled);
		}, function(error) {
			console.log("An error happened -> " + error);
		});
	};

});