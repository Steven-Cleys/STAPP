var myApp = angular.module('stapp.controllers', [ 'ui.router', 'ngCordova',
                                                  'ionic' ])
                                                  var myPopup;
var qrcode;
var qrcodes =["1x9","87t","4z7","s53","s5t","wr2","pqr","f63","4lc"]; //Dit wordt gebruikt bij de QuestionCtrl
var ok = []; //Nodig voor de punten te bepalen bij QuestionCtrl
var nok = []; //Nodig voor de punten te bepalen bij QuestionCtrl
var jsonarr = []; //array voor data bij te houden
var markers = [];
var start;
var end;
var startTime = 10000;
var endTime;

//localStorage.setItem('logins', 'amagad'); //to temporay disable logging screen for testing purposes.

function makeInfoWindowEvent(map, infowindow, marker) {
	return function() {
		infowindow.open(map, marker);
	};
}

myApp
.controller(
		'MapCtrl',
		function($scope, $ionicModal, $ionicLoading, $http, $ionicPopup, $ionicPopover,
				$cordovaBarcodeScanner, $state) {
			
//			 $ionicPopover.fromTemplateUrl('templates/info-popup.html', {
//				    scope: $scope,
//				  }).then(function(popover) {
//				    $scope.popover = popover;
//				  });
//			 
//			 $scope.openPopover = function($eventt) {
//				    $scope.popover.show($event);
//				  };
//				  $scope.closePopover = function() {
//				    $scope.popover.hide();
//				  };
//				  //Cleanup the popover when we're done with it!
//				  $scope.$on('$destroy', function() {
//				    $scope.popover.remove();
//				  });
//				  // Execute action on hide popover
//				  $scope.$on('popover.hidden', function() {
//				    // Execute action
//				  });
//				  // Execute action on remove popover
//				  $scope.$on('popover.removed', function() {
//				    // Execute action
//				  });
//				 
				 
				  //setTimeout(function(){ $scope.popover.show();}, 500);
			
		    $ionicModal.fromTemplateUrl('templates/image-modal.html', function($ionicModal) {
		        $scope.modal = $ionicModal;
		        console.log('oi');
		        }, {    
		        scope: $scope,    
		        animation: 'slide-in-up'
		      });

			$scope.openModal = function() {
				$scope.modal.show();
			};

			$scope.closeModal = function() {
				$scope.modal.hide();
			};
			
			$scope.$on('$destroy', function() {
			      $scope.modal.remove();
			    });
			
			$scope.$on('modal.hide', function() {
			     //Execute action
			    });
			 
			$scope.$on('modal.shown', function() {
			      console.log('Modal is shown!');
			    });
			
			$scope.imageSrc = 'img/Slakje.png';

			      

			function loadQuestions() {

				if(localStorage['qrcodes'] == null){
					console.log("storage");
					localStorage['qrcodes'] = JSON.stringify(qrcodes);
					localStorage['questionOk'] = JSON.stringify(ok);
					localStorage['questionNok'] = JSON.stringify(nok);
				}

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

					var myLatlng = new google.maps.LatLng(51.216126, 4.410546); // to
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

			progress();

			if (qrcode != null){


				if(qrcodes.length != 10)

				{
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
				else{
					calcRoute(end,  new google.maps.LatLng(51.216126, 4.410546))
				}

			}

			function progress() {

				var progress  = qrcodes.length;
				$scope.progress = progress;
				console.log(progress);
			}

			progress();
			
			
			

			if (localStorage.getItem('logins') != null) {
				console.log(localStorage.getItem('logins'));
			} else {
				console.log("its empty");

				$state.go('login');
				// Create the login modal that we will use later

				
				
//				myPopup = $ionicPopup.show({
//					templateUrl : 'templates/login.html',
//					scope : $scope
//				});
			}

			function showspinner() {
				$ionicLoading.show({
					template : '<i class="icon ion-loading-a"></i>'
				});
			}
			;

			$scope.scanBarcode = function() {
				var found = false;
				$cordovaBarcodeScanner
				.scan()
				.then(
						function(imageData) {
							var execute = true;
							for (var i = 0; i < qrcodes.length; i++) {
								if (imageData.text == qrcodes[i]) { 
									execute = false;
								}
							}

							if (execute){
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

									if (found == false && i > 8) {
										var alertPopup;
										alertPopup = $ionicPopup
										.alert({
											title : 'Ongeldige QR-Code',
											buttons : [ {
												text : imageData.text,
												type : 'button-assertive'
											} ]
										});
									}
								}
							}else {
								alertPopup = $ionicPopup.alert({
									title : 'U heeft deze qrcode al gescand',
									buttons : [ {
										text : 'OK',
										type : 'button-assertive'
									} ]
								});
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

	jsonarr = JSON.parse(localStorage['questions']);
	var execute = true;
	var valid = false;
	qrcodes = JSON.parse(localStorage['qrcodes']);

	for(var i=0; i<qrcodes.length; i++){
		if(qrcode == qrcodes[i]){
			execute = false;
		}
	}
	for(var i=0; i<jsonarr.length; i++){
		if(qrcode == jsonarr[i].value.qrCode){
			valid = true;
		}
	}
	if(valid == false){
		alertPopup = $ionicPopup.alert({title: 'U heeft een foutive qrcode gescand', buttons: [{text: 'OK', type: 'button-assertive', onTap : function() {$state.go('index');}}]});
	}

	if(execute){
		qrcodes.push(qrcode);
		localStorage['qrcodes'] = JSON.stringify(qrcodes);
		var question = {};

		for (var i = 0; i < jsonarr.length; i++) {
			var doc = jsonarr[i].value;
			console.log("docje" + doc);
			if (qrcode == doc.qrCode) {
				question.hotspot = doc.hotspot;
				question.question = doc.question;
				question.image = "img/fotosVragen/" + qrcode + ".png";
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
		$scope.image = [{"image": question.image}];

		if (question.allAnswers != null) {
			$scope.answer = [];
			var possibleAnswer = question.allAnswers.split(";");
			for (var i = 0; i < possibleAnswer.length; i++) {
				$scope.answer.push({
					"items" : possibleAnswer[i]
				})
			}
		}
	}else{
		alertPopup = $ionicPopup.alert({title: 'U heeft deze qrcode al gescand', buttons: [{text: 'OK', type: 'button-assertive', onTap : function() {$state.go('index');}}]});
	}

	$scope.validate = function() {
		ok = JSON.parse(window.localStorage['questionOk']);
		nok = JSON.parse(window.localStorage['questionNok']);
		var answer = $scope.validate.answer;
		var alertPopup;

		if (answer != null) {
			if (answer == question.answer) {
				ok.push(qrcode);
				localStorage['questionOk'] = JSON.stringify(ok);
			} else {
				nok.push(qrcode);
				localStorage['questionNok'] = JSON.stringify(nok);
			}

			if(qrcodes.length == 1){
				var date = new Date();
				startTime = date.getTime();
			}

			if(qrcodes.length == 10){
				var date = new Date();
				endTime = date.getTime();

				var difference = endTime-startTime;
				var points = JSON.parse(localStorage['questionOk']).length;
				var login = localStorage.getItem('logins');
				var sent = "{'team':" + login.team + ", 'name':" + login.name + ", 'email':" + login.email + ", 'answersOk':" + localStorage['questionOk'] + ", 'answersNok':" + localStorage['questionNok'] + ", 'points':" + points + "}";
				localStorage.clear();
				qrcodes.length = 0;
				console.log("clear me");
				alertPopup = $ionicPopup.alert({
					title : 'U heeft alle vragen beantwoord!',
					buttons : [ {
						text : difference,
						type : 'button-assertive',
						onTap : function() {
							$state.go('index');
						}
					} ]


				});
			}else{
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
			}
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
		console.log(window.localStorage['questionOk']);
		console.log(window.localStorage['questionNok']);
	}


	$scope.changeState = function() {
		// console.log("hallo ");
		$state.go('question');

	}

})

myApp.controller('LoginCtrl', function($scope, $ionicModal) {
	
	console.log("controller executed");
//	$ionicModal.fromTemplateUrl('templates/login.html', {
//		scope : $scope
//	}).then(function(modal) {
//		$scope.loginModal = modal;
//	});
//	
//	setTimeout(function(){ $scope.loginModal.show();}, 500);
//	
	

	// Perform the login action when the user submits the login form
	$scope.doLogin = function() {
		console.log('Doing login', $scope.login);
		// Simulate a login delay. Remove this and replace with your login
		// code if using a login system
		localStorage.setItem('logins', JSON.stringify($scope.login));
	};
})

