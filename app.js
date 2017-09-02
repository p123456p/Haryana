function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 29.0588,
            lng: 76.0856
        },
        zoom: 8,// can go upto 21
    });
    ko.applyBindings(new Modelview());
}

function error() {
    alert("Unable to load the map");
}
var markers = []; //array of  markers
var map;

// array of locations
var places = [{
    title: ' Chandigarh',
    location: {
        lat: 30.7333,
        lng:76.7794
    },
    show: true,
    selected: false,
    Id: '4ba37b0ff964a520b94038e3'

}, {
    title: 'gurgaon',
    location: {
        lat: 28.4595,
        lng: 77.0266
    },
    show: true,
    selected: false,
    Id: '4b643ef6f964a52037a62ae3'

}, {
    title: 'Ambala',
    location: {
        lat: 30.3782,
        lng: 76.7767
    },
    show: true,
    selected: false,
    Id: '4c0b5b20ffb8c9b636336d61'

}, 
{
  title: 'Rohtak', 
  location: {
        lat:28.8955 ,
        lng: 76.6066 
},
   show: true,
    selected: false,
    Id:'4e43e612d22de4060eee859f'
},
{
  title: 'Panchkula',
  location:{
  lat: 30.6942,
 lng: 76.8606
},
show: true,
    selected: false,
 Id:'4d1f20ec2eb1f04ded06e6c1'
},
{
title: 'Karnal',
 location:{
 lat:29.6857,
 lng:76.9905
},
show: true,
    selected: false,
Id:'4e50a14c2271a1bdc3f05703'
}

];

var Modelview = function() //view model function
{

    var defaultIcon = makeMarkerIcon('0091ff');
    var highlightedIcon = makeMarkerIcon('FF24FF');
    var largeInfowindow = new google.maps.InfoWindow();

    var marker;
    var bounds = new google.maps.LatLngBounds();
    for (var i = 0; i < places.length; i++) {
        var position = places[i].location;
        var title = places[i].title;
        marker = new google.maps.Marker({
            map: map,
            position: position,
            title: title,
            icon: defaultIcon,
            animation: google.maps.Animation.DROP,
            selected: places[i].selected,
            venue: places[i].Id,
            show: ko.observable(true),
            rating: ' ',
            image: ' '

        });

        //push markers
        markers.push(marker);
        //extend bounds
        bounds.extend(marker.position);
        google.maps.event.addDomListener(window, 'resize', function() {
            map.fitBounds(bounds);
        });

        //adding listeners


        // to open info window
        marker.addListener('click', function() {
            populateInfoWindow(this, largeInfowindow);
        });

//to bounce markers when clicked
        marker.addListener('click', function() {
            Bouncing(this);
        });

        marker.addListener('mouseover', function() {
            this.setIcon(highlightedIcon);
        });

        marker.addListener('mouseout', function() {
            this.setIcon(defaultIcon);
        });


   
}
//bounce function
    function Bouncing(m) {

        if (m.getAnimation() !== null) {
            m.setAnimation(null);
        } else {
            m.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function() {
                m.setAnimation(null);
            }, 900);
        }
    }


    this.check = ko.observable('');
    this.Listfilter = function() {

        largeInfowindow.close();
        var textSearch = this.check();
        //list for user serach

        if (textSearch.length === 0) {
            this.showAll(true);
        } else {
            for (i = 0; i < markers.length; i++) {
                if (markers[i].title.toLowerCase().indexOf(textSearch.toLowerCase()) > -1) {
                    markers[i].show(true);
                    markers[i].setVisible(true);
                } else {
                    markers[i].show(false);
                    markers[i].setVisible(false);
                }
            }
        }
        largeInfowindow.close();
    };

    this.showAll = function(n) {
        for (i = 0; i < markers.length; i++) {
            markers[i].show(n);
            markers[i].setVisible(n);
        }
    };
    this.selectAll = function(mark) {
        populateInfoWindow(mark, largeInfowindow);
        mark.selected = true;
        mark.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout( function() {
            mark.setAnimation(null);
        }, 500);

       
    };
//location details functionality
    markers.forEach(function(mark) {
        $.ajax({
            method: 'GET',
            dataType: "json",
            url: "https://api.foursquare.com/v2/venues/" + mark.venue + "?client_id=2JYEJY5E54SCTS2TJRILIIVLFPXCLQFXF0MPWI2YS2UQCJY3&client_secret=TH4C4MYFH44B2V02JS3YZEXYTKND5IEI4CTX0U51UT4JTKZ4&v=20170303",
            success: function(data) {
                var venue = data.response.venue;
                var imgurl = data.response.venue.photos.groups[0].items[0];
                //rating and image
                if((venue.hasOwnProperty('rating')) || ((imgurl.hasOwnProperty('prefix')) && (imgurl.hasOwnProperty('suffix')))) {
                    mark.rating = venue.rating;
                    mark.image = imgurl.prefix + "75x75" + imgurl.suffix;
                } else {
                    mark.rating = '0';
                    mark.imgurl = '0';
                }
            },
            error: function(e) {
                alert('Sorry,Data cant be fetched');
            }
        });
    });



    function populateInfoWindow(marker, infowindow) {
        if (infowindow.marker != marker) {
            infowindow.marker = marker;
           infowindow.setContent('<div>' + '<h3>' + marker.title + '</h3>' + "<h4>Ratings:" + marker.rating + '</h4> </div><div><img src="' + marker.image + '"></div>');
            if (marker.rating !== null || marker.image !== null) {
                infowindow.open(map, marker);
            }
            infowindow.addListener('closeclick', function() {
                infowindow.setMarker(null);
            });
        }
    }

    function makeMarkerIcon(mColor) {
        var markerImage = new google.maps.MarkerImage(
            'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + mColor + '|40|_|%E2%80%A2',
            new google.maps.Size(21, 34),
            new google.maps.Point(0, 0),
            new google.maps.Point(10, 34),
            new google.maps.Size(21, 34));
        return markerImage;
    }

};