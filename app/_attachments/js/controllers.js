var myApp = angular.module('stapp.controllers', ['ui.router', 'ngCordova', 'ionic'])
var myPopup;
var hotspots=[
{naam:"Barbouf", adres:"Lange Nieuwstraat 7", lat:51.2200226, lon:4.4058538},
{naam:"Panos", adres:"Meir 60", lat:51.2179238, lon:4.410221200000024},
{naam:"Delhaize", adres:"Meir 78", lat:51.2180487, lon:4.411330599999928},
{naam:"Bourla", adres:"Graanmarkt 7", lat:51.215989, lon:4.408375299999989},
{naam:"Universitas", adres:"Prinsesstraat 16", lat:51.2218235, lon:4.410761900000011},
{naam:"Campus AP Lange Nieuwstraat", adres:"Lange Nieuwstraat 101", lat:51.2194614, lon:4.411981700000069},
{naam:"Mediamarkt ", adres:"De Keyserlei 58", lat:51.2174084, lon:4.419184399999949},
{naam:"Centraal Station", adres:"/", lat:51.2160963, lon:4.421220700000049},
{naam:"Radisson Hotel", adres:"Koningin Astridplein 14", lat:51.2187178, lon:4.421660999999972},
{naam:"Barnini", adres:"Oudevaartplaats 10", lat:51.2149533, lon:4.4089493000000175}
];

// steven is een loser
var qrcode;

function makeInfoWindowEvent(map, infowindow, marker) {  
	   return function() {  
	      infowindow.open(map, marker);
	   };  
	} 

myApp.controller('MapCtrl', function($scope, $ionicLoading, $compile,$http,
		$ionicPopup,$cordovaBarcodeScanner, $state) {
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

		for (i = 0; i < hotspots.length; i++) { 
			
			
			var spot= hotspots[i];
			var myLatLng = new google.maps.LatLng(spot.lat,spot.lon);
			 
			
			var marker = new google.maps.Marker({
				map:map,
			    position: myLatLng,
			    title: spot.naam
			});
			var infowindow = new google.maps.InfoWindow({
			      content: spot.naam + "<br>" + spot.adres
			  });

			marker.setMap(map);
			google.maps.event.addListener(marker, 'click', makeInfoWindowEvent(map, infowindow, marker));

		}

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
	
	$scope.scanBarcode = function() {
		$cordovaBarcodeScanner.scan().then(function(imageData) {
			qrcode = imageData.text;
			$state.go('question');
			console.log("Barcode Format -> " + imageData.format);
			console.log("Cancelled -> " + imageData.cancelled);
		}, function(error) {
			console.log("An error happened -> " + error);
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
	function loadQuestions() {
		$http.jsonp('http://stapp.cloudant.com/ap/_design/views/_view/questions?callback=JSON_CALLBACK') 
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
					
					
					var question = {};
					var arr = JSON.parse(window.localStorage['questions']);
					console.log(arr);

					for (var i = 0; i < arr.length; i++) {
							var doc = arr[i].value;
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
							}
							else
							{
								nok = nok + ";" + qrcode;
							}
								alertPopup = $ionicPopup.alert({
									title : 'U antwoord is opgeslagen!',
									buttons : [ {
										text : 'OK',
										type : 'button-assertive',
										onTap: function() {
											$state.go('index');}
									} ]
								});
							} 
						else {
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
						
						console.log("qrcode: " + qrcode);
						qrcode += 1; // has to be removed, temp code!
						if (qrcode > 11)
							{
							qrcode = 1;
							}
					}
					
					$scope.changeState = function()
						{
							//console.log("hallo ");
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

