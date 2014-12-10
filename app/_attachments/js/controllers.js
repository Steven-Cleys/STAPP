var myApp = angular.module('stapp.controllers', [ 'ui.router', 'ngCordova',
                                                  'ionic' ])
                                                  var myPopup;
var qrcode = '4lc';
var jsonarr = []; //array voor data bij te houden
var markers = [];
var start;
var end;

function makeInfoWindowEvent(map, infowindow, marker) {
	return function() {
		infowindow.open(map, marker);
	};
}

myApp
.controller(
		'MapCtrl',
		function($scope, $ionicLoading, $compile, $http, $ionicPopup,
				$cordovaBarcodeScanner, $state) {

			function loadQuestions() {
				$http
				.jsonp(
				'http://stapp.cloudant.com/ap/_design/views/_view/questions?callback=JSON_CALLBACK')
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

			showspinner();

			// if (window.localStorage['questions'] == null) {
			loadQuestions();
			// }


			function initialize() {
				directionsDisplay = new google.maps.DirectionsRenderer({polylineOptions: {
				      strokeColor: "red",
				      strokeOpacity:0.5,
				      strokeWeight: 6
			    }});
				if (window.localStorage['questions'] == null) {
					setTimeout(function() {
						initialize();
					}, 200);
				} else {
					// go do that thing

					var myLatlng = new google.maps.LatLng(
							51.21968667200008, 4.4009229560000449); // to
					// do,
					// current
					// coords

					var mapOptions = {
							center : myLatlng,
							zoom : 16,
							mapTypeId : google.maps.MapTypeId.ROADMAP
					};

					var map = new google.maps.Map(document
							.getElementById("map"), mapOptions);

					

					jsonarr = JSON
					.parse(window.localStorage['questions']);
					for (i = 0; i < jsonarr.length; i++) {

						var spot = jsonarr[i];
						var myLatLng = new google.maps.LatLng(
								spot.value.lat, spot.value.lon);

						var marker = new google.maps.Marker({
							map : map,
							position : myLatLng,
							title : spot.value.hotspot,
							id: spot.value.qrCode
						});
						console.log(marker.id);

						var infowindow = new google.maps.InfoWindow({
							content : spot.value.hotspot + "<br>"
							+ spot.value.adres
						});
						console.log(spot.value.adres);
						marker.setMap(map);
						google.maps.event.addListener(marker, 'click',
								makeInfoWindowEvent(map, infowindow,
										marker));

						markers.push(marker);
					}

					$scope.map = map;

					google.maps.event.addListenerOnce(map,
							'tilesloaded', function() {
						$ionicLoading.hide();

						console.log("map loaded");

					});
				}
				;
				
				directionsDisplay.setMap(map);

			}

			initialize();

			var directionsDisplay;
			var directionsService = new google.maps.DirectionsService();

			function calcRoute(start,end) {
				var startje = new google.maps.LatLng(start.k, start.B);
				var endje =  new google.maps.LatLng(end.k, end.B);
				var request = {
						origin:start,
						destination:end,
						travelMode: google.maps.TravelMode.WALKING
				};
				directionsService.route(request, function(response, status) {
					if (status == google.maps.DirectionsStatus.OK) {
						directionsDisplay.setDirections(response);
					}
				});
			}

			if (qrcode != null){

				for (i = 0; i < markers.length; i++) {
					if(markers[i].id == qrcode){
						start = markers[i].position;
						
						if(i == (markers.length -1)){
							end = markers[0].position;
						}
						else 
						{
							end = markers[i+1].position;
						}
						
						console.log(start);
						console.log(end);
						
					}
				}
				calcRoute(start,end);
			}
			


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
					templateUrl : 'templates/loading.html',
					duration : 3000
				});
			}
			;

			$scope.scanBarcode = function() {
				var found = false;
				$cordovaBarcodeScanner
				.scan()
				.then(
						function(imageData) {
							for (i = 0; i < jsonarr.length; i++) {
								if (imageData.text == jsonarr[i].value.qrCode) {
									qrcode = imageData.text;
									$state.go('question');
									console
									.log("Barcode Format -> "
											+ imageData.format);
									console
									.log("Cancelled -> "
											+ imageData.cancelled);
									found = true;
									break;
								}

								if (found == false && i>8) {
									var alertPopup;
									alertPopup = $ionicPopup
									.alert({
										title : 'Ongeldige QR-Code',
										buttons : [ {
											text : imageData.text,
											type : 'button-assertive'
										}
										]
									});
								}
							}

						},
						function(error) {
							console.log("An error happened -> "
									+ error);
						});
			};

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

		});

myApp.controller('QuestionCtrl', function($scope, $ionicPopup, $state) {

	var question = {};
	jsonarr = JSON.parse(window.localStorage['questions']);

	for (var i = 0; i < jsonarr.length; i++) {
		var doc = jsonarr[i].value;
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
			} else {
				nok = nok + ";" + qrcode;
			}
			alertPopup = $ionicPopup.alert({
				title : 'U antwoord is opgeslagen!',
				buttons : [ {
					text : 'OK',
					type : 'button-assertive',
					onTap : function() {
						$state.go('index');
					}
				} ]
			});
		} else {
			if (question.allAnswers != null) {
				alertPopup = $ionicPopup.alert({
					title : 'Gelieve een antwoord aan te duiden.',
					buttons : [ {
						text : 'OK',
						type : 'button-assertive'
					} ]
				});
			} else {
				alertPopup = $ionicPopup.alert({
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

	$scope.changeState = function() {
		// console.log("hallo ");
		$state.go('question');

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
