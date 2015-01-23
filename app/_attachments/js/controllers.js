var myApp = angular.module('stapp.controllers', [ 'ui.router', 'ngCordova',
                                                  'ionic' ]);
var myPopup;
var qrcode; // = 'b36';
var qrcodes = [] // = ["1x9","87t","b36","s5t","wr2","pqr","f63","4lc"]; //Dit wordt gebruikt bij de QuestionCtrl
var ok = []; //Nodig voor de punten te bepalen bij QuestionCtrl
var nok = []; //Nodig voor de punten te bepalen bij QuestionCtrl
var jsonarr = []; //array voor data bij te houden
var markers = [];
var start; //voor routes
var end;
var startTime; // = 10000; //testing
var tracker; //where am i
var infowindows = [];
var gpsinterval; // this var stores the gps update interval function
var index =1;


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
	for (var i = 0; i < infowindows.length; i++ ) { 
		infowindows[i].close();
	}
}
	
function convertImgToBase64URL(url, callback, outputFormat){
    var canvas = document.createElement('CANVAS'),
        ctx = canvas.getContext('2d'),
        img = new Image;
    img.crossOrigin = 'Anonymous';
    img.onload = function(){
        var dataURL;
        canvas.height = img.height;
        canvas.width = img.width;
        ctx.drawImage(img, 0, 0);
        dataURL = canvas.toDataURL(outputFormat);
        callback.call(this, dataURL);
        canvas = null; 
    };
    img.src = url;
}



myApp
.controller(
		'MapCtrl',
		function($scope, $ionicModal, $ionicLoading, $http, $ionicPopup, $ionicPopover,
				$cordovaBarcodeScanner, $state, $ionicPlatform, $cordovaCamera) {

			$ionicPlatform.registerBackButtonAction(function (event) {  //exits the app when back button is pressed
				//alert('close');
				console.log($state.current.name);
					clearInterval(gpsinterval);
					ionic.Platform.exitApp();

			}, 10000);


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
				$scope.modal.remove();
			});

			$scope.$on('modal.shown', function() {
				console.log('Modal is shown!');
			});

			
			$scope.showImage = function() {
				
				switch(index) {
				case 1:
					$scope.imageSrc = 'img/img1.png';
					index++;
					$scope.openModal();
					break;
				case 2:
					$scope.imageSrc  = 'img/img2.png';
					index++;
					$scope.openModal();
					break;
				case 3:
					$scope.imageSrc  = 'img/img3.png';
					index++;
					break;
				case 4:
					$scope.closeModal();
					break;
				case 5:
					
					$scope.imageSrc  = 'img/img4.png';
					index++;
					$scope.openModal();
					break;
				case 6:
					$scope.closeModal();
					break;
				case 7:
					$scope.imageSrc  = 'img/img5.png';
					index++;
					$scope.openModal();
					break;
				case 8:
					$scope.closeModal();
					break;
				}
				
			}
			
			

			//$scope.imageSrc;
			//setTimeout(function() {
			//	$scope.openModal();
			//}, 4000);
			tracker = undefined;
			showspinner();

			// if (window.localStorage['questions'] == null) {
			loadQuestions();
			// }
			initialize();
			progress();

			//probably not needed any more
			if (localStorage.getItem('logins') != null) {
				console.log(localStorage.getItem('logins'));
			} else { 
				console.log("you shouldnt be here, go login first");
				$state.go('login');
			}

			function loadQuestions() {

				if(localStorage['qrcodes'] == null){					
					console.log("storage");
					localStorage['qrcodes'] = JSON.stringify(qrcodes);
					localStorage['firstrun'] = 'ja';
					localStorage['questionOk'] = JSON.stringify(ok);
					localStorage['questionNok'] = JSON.stringify(ok);
					
					
				}

				$http
				.jsonp(
				'https://stapp.cloudant.com/ap/_design/views/_view/questions?callback=JSON_CALLBACK') //load data from serer
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


			function initialize() { //load map
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

					//var watchId = navigator.geolocation.watchPosition(track); 

					jsonarr = JSON
					.parse(window.localStorage['questions']);  //load markers from array
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
						killBoxes(); //kill info boxes
					});



					$scope.map = map;

					google.maps.event.addListenerOnce(map,
							'tilesloaded', function() {
						$ionicLoading.hide(); //hide spinner after loading
						
						if(localStorage['firstrun'] == 'ja'){
							
							$scope.showImage();
							localStorage['firstrun'] = 'nee';
							
							
						}
						
						console.log("map loaded");

						setGeolocation();

						gpsinterval = window.setInterval( function () {
							setGeolocation();
						}, 
						15000 //check gps every 15 seconds
						);

					});
				}
				;

				directionsDisplay.setMap(map); //bind directions on map

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


			if (qrcode != null) {
				
				if(qrcode=="4z7"){
					index=5;
					setTimeout(function() {$scope.showImage(); console.log("alloha")}, 400);
				}

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
					index=7;
					setTimeout(function() {$scope.showImage();}, 400);
					
					setTimeout(function() {
						calcRoute(end,  new google.maps.LatLng(51.216126, 4.410546)); //directions to school
						localStorage.clear(); //clear all localstorage game is done
						qrcodes.length = 0;
						console.log("clear me");
					},100);
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


			function showspinner() {
				$ionicLoading.show({
					template : '<i class="icon ion-loading-a"></i>'
				});
			}			;

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
							
							if($scope.progress == 10) //stop scanning qrcodes when you have 10
								{
								execute = false;
								}

							if (execute){
								for (i = 0; i < jsonarr.length; i++) {
									if (imageData.text == jsonarr[i].value.qrCode) {
										qrcode = imageData.text;
										clearInterval(gpsinterval);
										tracker = undefined;
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
										alertPopup = $ionicPopup.alert({
											title : '<h3>Oh Ow!!</h3>',
											template:  'Er werd geen QR-code gescand of de gescande QR-code is ongeldig.',
											buttons : [ {
												text : 'OK',
												type : 'button button-assertive'
											} ]
										});
									}
								}
							}else {
								alertPopup = $ionicPopup.alert({
									title : '<h3>Oeps!!</h3>',
									template:'Deze QR-code werd al gescand.',
									buttons : [ {
										text : 'OK',
										type : 'button button-assertive'
									} ]
								});
							}


						},
						function(error) {
							console.log("An error happened -> "
									+ error);
						});
			};


			function setGeolocation() {

				var geolocation = window.navigator.geolocation.watchPosition( 
						function ( pos ) {


							var myLatlng = new google.maps.LatLng(pos.coords.latitude,pos.coords.longitude);

							if (typeof tracker === 'undefined') {
								tracker = new google.maps.Marker(
										{
											position : myLatlng,
											map : $scope.map,
											zIndex : 1,
											icon : 'img/icon/you-are-here-2.png'
										});
								$scope.map.setCenter(myLatlng);
								console.log("tracker created")
							} else {
								console.log("tracker updated " + myLatlng)
								tracker.setPosition(myLatlng);
							}



						},
						function () { /* error */ }, {
							maximumAge: 250, 
							enableHighAccuracy: true
						} 
				);

				window.setTimeout( function () {
					window.navigator.geolocation.clearWatch( geolocation ) 
				}, 
				5000 //stop checking after 5 seconds
				);
			};

			$scope.takePhoto = function(){

				
			    var options = {
			    	      quality: 50,
			    	      destinationType: Camera.DestinationType.FILE_URL,
			    	      sourceType: Camera.PictureSourceType.CAMERA,
			    	      allowEdit: true,
			    	      encodingType: Camera.EncodingType.JPEG,
			    	      //targetWidth: 320,
			    	      //targetHeight: 320,
			    	      popoverOptions: CameraPopoverOptions,
			    	      saveToPhotoAlbum: true
			    	    };

			    $cordovaCamera.getPicture(options).then(function(imageURI) {
			    	//alert('hallo');
			        //var image = document.getElementById('myImage');
			        //image.src = imageURI;
			    	convertImgToBase64URL(imageURI, function(base64Img){
			    		localStorage.setItem('image', base64Img);	
			    	});
			        
			      }, function(err) {
			        alert(err);
			      });

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
		qrcodes.push(qrcode);
		localStorage['qrcodes'] = JSON.stringify(qrcodes); //storage the filled in question

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
				localStorage.setItem('starttime', startTime);
			}

			if(qrcodes.length == 10){
				//alert(image);
				var date = new Date();
				var endTime = date.getTime();
				startTime = localStorage.getItem('starttime');
				var image = localStorage.getItem('image');
				var difference = endTime-startTime;
				var points = JSON.parse(localStorage['questionOk']).length;
				var login = JSON.parse(localStorage.getItem('logins'));
				var dataObj = {
						team : login.team,
						name : login.name,
						email : login.email,
						time: difference,
						answersOk : localStorage['questionOk'],
						points : points,
						image : image
				};


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
				
				$state.go('index')

				/*alertPopup = $ionicPopup.alert({
					title : 'U heeft alle vragen beantwoord!',
					buttons : [ {
						text : 'Ok',
						type : 'button-assertive',
						onTap : function() {
							$state.go('index');
						}
					} ]


				});*/
			}else{
				alertPopup = $ionicPopup.alert({
					title : '<h3>Woopie!!!</h3>',
					template:'Het antwoord is opgeslagen!',
					buttons : [ {
						text : 'OK',
						type : 'button-assertive',
						onTap : function() {
							localStorage.setItem('qrcode', qrcode);
							$state.go('index');
						}
					} ]
				});
			}
		} else {
			if (question.allAnswers != null) {
				alertPopup = $ionicPopup.alert({
					title : '<h3>Oh Snap!!</h3>',
					template: 'Gelieve een antwoord aan te duiden.',
					buttons : [ {
						text : 'OK',
						type : 'button-assertive'
					} ]
				});
			} else {
				alertPopup = $ionicPopup.alert({
					title : '<h3>Oh Snap!!</h3>',
					template:'Gelieve een antwoord in te vullen.',
					buttons : [ {
						text : 'OK',
						type : 'button-assertive'
					} ]
				});
			}
		}
	}


	$scope.changeState = function() {
		// console.log("hallo ");
		$state.go('question');

	}

})

myApp.controller('LoginCtrl', function($scope, $ionicPopup, $state, $ionicPlatform) {


	$ionicPlatform.registerBackButtonAction(function (event) {  //exits the app when back button is pressed
		//alert('exit at login');
		ionic.Platform.exitApp();

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
		if (localStorage.getItem('qrcode') != null)
			qrcode = localStorage.getItem('qrcode'); //load qrcode to calculate route when app crashed/restarted
		if (localStorage.getItem('qrcodes') != null)
			qrcodes = JSON.parse(localStorage['qrcodes']); //load qrcodes to calculate progress when app crashed/restarted
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
					title: '<h3>Woops!!</h3>',
					template:'Controleer alle invoervelden aub.',
					buttons : [ {
						text : 'OK',
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
