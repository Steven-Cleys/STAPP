var myApp = angular.module('stapp.controllers', [ 'ui.router', 'ngCordova',
                                                  'ionic' ])
                                                  var myPopup;
var qrcode; // = "b36";
var qrcodes = []; // =["1x9","87t","4z7","s53","s5t","wr2","pqr","f63","4lc"]; //Dit wordt gebruikt bij de QuestionCtrl
var ok = []; //Nodig voor de punten te bepalen bij QuestionCtrl
var nok = []; //Nodig voor de punten te bepalen bij QuestionCtrl
var jsonarr = []; //array voor data bij te houden
var markers = [];
var start;
var end;
var startTime; // = 10000; //testing
var endTime;
var tracker;
var infowindows = [];


//localStorage.setItem('logins', 'amagad'); //to temporay disable logging screen for testing purposes.

function makeInfoWindowEvent(map, infowindow, marker) {

	return function() {
		google.maps.event.addListener(infowindow, 'domready', function(){
			console.log("infow loaded");
		    $(".gm-style-iw").next("div").hide();
		});
		killBoxes();
		infowindow.open(map, marker);
		
	};
}

function killBoxes() {
	console.log("kill da box");
    for (var i = 0; i < infowindows.length; i++ ) {  //I assume you have your infoboxes in some array
    	infowindows[i].close();
    }
	}

myApp
.controller(
		'MapCtrl',
		function($scope, $ionicModal, $ionicLoading, $http, $ionicPopup, $ionicPopover,
				$cordovaBarcodeScanner, $state, $ionicPlatform) {

			$ionicPlatform.registerBackButtonAction(function (event) {  //exits the app when back button is pressed
				console.log($state.current.name);
				if($state.current.name=="index"){
					navigator.app.exitApp();
				}
				else {
					navigator.app.backHistory();
				}
			}, 100);


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

			showspinner();

			// if (window.localStorage['questions'] == null) {
			loadQuestions();
			// }
			initialize();
			progress();
			

			function loadQuestions() {

				if(localStorage['qrcodes'] == null){
					console.log("storage");
					localStorage['qrcodes'] = JSON.stringify(qrcodes);
					localStorage['questionOk'] = JSON.stringify(ok);
					localStorage['questionNok'] = JSON.stringify(ok);
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


			function initialize() {
				directionsDisplay = new google.maps.DirectionsRenderer({polylineOptions: {
					strokeColor: "red",
					strokeOpacity:0.5,
					strokeWeight: 6
				},suppressMarkers: true});
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
							mapTypeId : google.maps.MapTypeId.ROADMAP,

					};

					var map = new google.maps.Map(document
							.getElementById("map"), mapOptions);

					var watchId = navigator.geolocation.watchPosition(track); 

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
							id: spot.value.qrCode,
							icon: 'img/icon/symbol_inter.png'
						});
						console.log(marker.id);

						var infowindow = new google.maps.InfoWindow({
							content : spot.value.hotspot + "<br>"
							+ spot.value.adres
						});
						infowindows.push(infowindow);
						
						console.log(spot.value.adres);
						marker.setMap(map);
						google.maps.event.addListener(marker, 'click',
								makeInfoWindowEvent(map, infowindow,
										marker));

						markers.push(marker);
					}
					
					google.maps.event.addListener(map, "click", function(event) {
						killBoxes();
					});
					


					$scope.map = map;

					google.maps.event.addListenerOnce(map,
							'tilesloaded', function() {
						$ionicLoading.hide();

						console.log("map loaded");
						$scope.centerOnMe();

					});
				}
				;

				directionsDisplay.setMap(map);

			}


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
						console.log(end);
						new google.maps.Marker({
							map: $scope.map,
							position: end,
							icon: 'img/icon/symbol_inter1.png',
							clickable: false
						});

					}
				});

			}


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

				var progress;
				if (qrcodes.length == 0) {
					progress = 0;					
				}
				else {
					progress = qrcodes.length;
				}

				$scope.progress = progress;
				console.log(progress);
			}





			//probably not needed any more
			if (localStorage.getItem('logins') != null) {
				console.log(localStorage.getItem('logins'));
			} else { 
				console.log("you shouldnt be here, go login first");
				$state.go('login');

				// Create the login modal that we will use later



//				myPopup = $ionicPopup.show({
//				templateUrl : 'templates/login.html',
//				scope : $scope
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

			$scope.centerOnMe = function() {
				console.log("centered?");
				if (!$scope.map) {
					console.log("return?");
					return;
				}


				navigator.geolocation.getCurrentPosition(
						function(pos) {
							console.log("getting position")
							$scope.map
							.setCenter(new google.maps.LatLng(
									pos.coords.latitude,
									pos.coords.longitude));

							var myLatlng = new google.maps.LatLng(pos.coords.latitude,pos.coords.longitude);

							tracker = new google.maps.Marker({
								position: myLatlng,
								map: $scope.map,
								zIndex:1,
								icon: 'img/icon/you-are-here-2.png'
							});									

							track(pos);
						}, function(error) {
							console.log('Unable to get location: '
									+ error.message);
						},
						{
							enableHighAccuracy: true,
							timeout : 10000
						}

				);
			};

			function track(location)
			{
				var newLatLng = new google.maps.LatLng(location.coords.latitude,location.coords.longitude);
				console.log(newLatLng);
				tracker.setPosition(newLatLng);

				//navigator.geolocation.clearWatch(watchId);
				console.log("location updated");
			}

			$scope.takePhoto = function(){
			navigator.camera.getPicture(onSuccess, onFail, { quality: 50,
			    destinationType: Camera.DestinationType.FILE_URI });

			function onSuccess(imageURI) {
			    var image = document.getElementById('myImage');
			    myImage.src = imageURI;
			}

			function onFail(message) {
			    alert('Failed because: ' + message);
			}
			
			}
		});

myApp.controller('QuestionCtrl', function($scope, $ionicPopup, $state, $http) {

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
					//console.log(doc.allAnswers);
					document.getElementById("multi").style.visibility = "visible";
					document.getElementById("open").style.visibility = "hidden";
					question.answer = doc.answer;
				}
				else {
					//console.log(doc.answerscheck);
					question.answercheck = doc.answercheck;
				}

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
		console.log(question.answercheck);
		if (answer != null) {
			if (question.allAnswers != null) {
				if (answer == question.answer) {
					console.log("question correct");
					ok.push(qrcode);
					localStorage['questionOk'] = JSON.stringify(ok);
				} else {
					nok.push(qrcode);
					localStorage['questionNok'] = JSON.stringify(nok);
					console.log("question incorrect");
				}
			}
			else {
				var split = [];
				split = question.answercheck.split(";");
				for (var i = 0; i < split.length; i++) {
					console.log(answer + "  " + split[i]);
					if(answer.toLowerCase().indexOf(split[i]) > -1) {
						console.log("question correct");
						ok.push(qrcode);
						localStorage['questionOk'] = JSON.stringify(ok);
					}

				}


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
				var login = JSON.parse(localStorage.getItem('logins'));
				var sent = '{"team":' + login.team + ', "name":' + login.name + ', "email":' + login.email + ', "answersOk":' + localStorage['questionOk'] + ', "answersNok":' + localStorage['questionNok'] + ', "points":' + points + '}';
				var dataObj = {
						team : login.team,
						name : login.name,
						email : login.email,
						time: difference,
						answersOk : localStorage['questionOk'],
						points : points
				};
				localStorage.clear();
				qrcodes.length = 0;
				console.log("clear me");

//				var req = {
//				method: 'POST',
//				url: 'http://127.0.0.1:5984/results',
//				headers: {
//				//'Authorization': 'stappproject'
//				'Content-Type': "application/json"
//				},
//				data: { test: 'test' }
//				}
//				$http(req);

				$http.post('https://stapp.cloudant.com/results', dataObj);

				alertPopup = $ionicPopup.alert({
					title : 'U heeft alle vragen beantwoord!',
					buttons : [ {
						text : Ok,
						type : 'button-assertive',
						onTap : function() {
							$state.go('login');
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

myApp.controller('LoginCtrl', function($scope, $ionicPopup, $state, $ionicPlatform) {
	
	
	$ionicPlatform.registerBackButtonAction(function (event) {  //exits the app when back button is pressed
		
			navigator.app.exitApp();

	}, 100);


	console.log("logincontroller executed");
//	$ionicModal.fromTemplateUrl('templates/login.html', {
//	scope : $scope
//	}).then(function(modal) {
//	$scope.loginModal = modal;
//	});

//	setTimeout(function(){ $scope.loginModal.show();}, 500);

	if (localStorage.getItem('logins') != null) {
		console.log(localStorage.getItem('logins'));
		$state.go('index');
	} else {
		console.log("no login found");
	}
	
	$scope.options = ['Nederlands','English']; 

	// Perform the login action when the user submits the login form
	$scope.doLogin = function() {

		if(!$scope.login.team || !$scope.login.name || !$scope.login.email || !$scope.login.checked)
		{
			$scope.showAlert = function() {
				var alertPopup = $ionicPopup.alert({
					title: 'Woops',
					buttons : [ {
						text : 'Controleer alle invoervelden aub',
						type : 'button-assertive'
					} ]
				});
			}
			$scope.showAlert();
		}
		else
		{
			console.log('Doing login', $scope.login);
			// Simulate a login delay. Remove this and replace with your login
			// code if using a login system
			localStorage.setItem('logins', JSON.stringify($scope.login));
			$state.go('index');
		}
	};
})
