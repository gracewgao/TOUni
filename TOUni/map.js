
  var panorama;
  var curMarker;
  var uni = "waterloo";
  var mKey;

  // Your web app's Firebase configuration
  var firebaseConfig = {
    apiKey: "AIzaSyAWFJTVzn5J9dPjIZaOawBYuTOPGUDuGfM",
    authDomain: "virtual-orientation.firebaseapp.com",
    databaseURL: "https://virtual-orientation.firebaseio.com",
    projectId: "virtual-orientation",
    storageBucket: "virtual-orientation.appspot.com",
    messagingSenderId: "1052245118751",
    appId: "1:1052245118751:web:25db9f57a7a48ea2b2ea2a",
    measurementId: "G-YC8LD3R6K4"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  firebase.analytics();

  loadMarkers();

  function snapshotToArray(snapshot) {
    var returnArr = [];

    snapshot.forEach(function(childSnapshot) {
        var item = childSnapshot.val();
        item.key = childSnapshot.key;

        returnArr.push(item);
    });
    return returnArr;
  };

var markers = [];

function loadMarkers(){
  uniRef = firebase.database().ref('unis/' + uni + '/markers/');
  uniRef.on('value', function(snapshot) {
    markers = snapshotToArray(snapshot);
    for (var i=0; i<markers.length; i++){
      newMarker(markers[i]);
    }
  });

}

function toggleStreetView() {

    // We get the map's default panorama and set up some defaults.
    // Note that we don't yet set it visible.
    panorama = map.getStreetView();
    panorama.setPosition(curPos);
    panorama.setPov(/** @type {google.maps.StreetViewPov} */({
      heading: 265,
      pitch: 0
    }));



    var toggle = panorama.getVisible();
    if (toggle == false) {
      panorama.setVisible(true);
    } else {
      panorama.setVisible(false);
    }
  }

  var comments = [];

  function loadComments(){
    uniRef = firebase.database().ref('unis/' + uni + '/markers/');
    uniRef.on('value', function(snapshot) {
      comments = snapshotToArray(snapshot);
      for (var i=0; i<markers.length; i++){
        newComment(comments[i]);
      }
    });

    function newComment() {

    }

  }

// show marker
function newMarker(props) {

  var marker = new google.maps.Marker({
    map: map,
    draggable: true,
    position: props.coords
  });

  // 0: residence
  // 1: food
  // 2: building
  // 3: miscellaneous
  marker.setIcon('category-'+props.category+'.png');

  // panel opens here w information
  marker.addListener('click', function(){
    curPos = props.coords;
    mKey = props.key;
    markerRef = firebase.database().ref('unis/' + uni + '/markers/'+ mKey);
    var displayName;
    var displayDescription;
    var category;
    markerRef.on('value', function(snapshot) {
      displayName = snapshot.val().name;
      displayDescription = snapshot.val().description;
      displayCategory = snapshot.val().category;
    });

    document.getElementById("markerName").innerHTML = displayName;
    document.getElementById("markerDescription").innerHTML = displayDescription;

  });

}

var dropped = false;
var droppedMarker;

  function addMarker() {
    var listener = google.maps.event.addListener(map, 'click',
      function(event){
        // finds last clicked place
        curPos = {lat: event.latLng.lat(), lng: event.latLng.lng()};
        if (dropped){
          droppedMarker.setMap(null);
          dropped = false;
        } else {
          droppedMarker = new google.maps.Marker({
              animation: google.maps.Animation.DROP,
              draggable: true,
              position: curPos
          });
          droppedMarker.setMap(map);
          dropped = true;
        }

    });
  }

// // TODO: change this for new UI
  // saves to database
  function saveMarker(){
    var name = document.getElementById("title").value;
    var des = document.getElementById("description").value;
    document.getElementById("title").value="";
    document.getElementById("description").value="";
    var choose = document.getElementById("category");
    var category = choose.options[choose.selectedIndex].value;
    choose.selectedIndex=0;
    writeMarker(name, curPos, category, des, uni);
  }

  // saves new marker to database
  function writeMarker(name, coords, category, description, uni) {
    var markerData = {
      name: name,
      coords: coords,
      category: category,
      description: description
    };
    var markerRef = firebase.database().ref('unis/'+ uni + '/markers');
    var newKey = markerRef.push().key;
    var updates = {};
    updates[newKey] = markerData;
    markerRef.update(updates);
    droppedMarker.setMap(null);
  }

  function saveComment(){
    var comment = document.getElementById("comment").value;
    document.getElementById("comment").value="";
    writeComment(comment);
  }

  function writeComment(content) {

    var commentData = {
      points: 0,
      content: content,
      date: new Date()
    };

    var commentRef = firebase.database().ref('unis/'+ uni + '/markers/' + mKey + '/comments');
    var newKey = commentRef.push().key;

    var updates = {};
    updates[newKey] = commentData;
    commentRef.update(updates);
  }
