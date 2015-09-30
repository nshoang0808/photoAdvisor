var express = require('express');
var router = express.Router();
var request = require('request');

/* GET home page. */

// return ID of the city using the long and lat
var getID = function(long, lat, cb){
    var link = 'http://api.tripadvisor.com/api/partner/2.0/map/' + long +',' + lat +'/attractions?key=HackUMass-93b8e93cda61'

    request(link, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var jsonObject = JSON.parse(body);

            if(jsonObject.data[0] == null)
                cb(null);
            else
                cb(jsonObject.data[0].ancestors[0].location_id);
        }
    })
};

var getInfo = function(long, lat, cb){
    var link = 'http://api.tripadvisor.com/api/partner/2.0/map/' + long +',' + lat +'/attractions?key=HackUMass-93b8e93cda61'

    request(link, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var jsonObject = JSON.parse(body);

            if(jsonObject.data[0] == null)
                cb(null);
            else
                cb(jsonObject.data[0]);
        }
    })
};

// get attractions near the city
var getPhotos = function(id, cb){
    var link = 'http://api.tripadvisor.com/api/partner/2.0/location/' + id + '/photos?key=HackUMass-93b8e93cda61';
    request(link, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var jsonObject = JSON.parse(body);

            cb(jsonObject.data);
        }
    })
};

router.get('/', function(req, res) {


    //var id;
    //getID(30.0594885, 31.2584644, function(comingID){
    //    id = comingID;
    //
    //    getPhotos(id, function(body){
    //        var allImages = body;
    //        res.render('index', {
    //            title : 'hello',
    //            allImagesX : {}
    //        });
    //    });
    //})
    res.render('index', {
        title : 'photoAdvisor by Hugo',
        allImagesX : {}
    });

});

router.post('/', function(req, res) {


    var allImages = [];
    var x = 0;
    var cnt = 0;

    for(var c = 0; c < req.body.count; c++){
        var l = 'lat'+c;
        var lat = req.body[l];

        var lg = 'lng'+c;
        var lng = req.body[lg];

        getInfo(lat, lng, function(comingID){
            if(comingID == null){
                cnt++;
            }
            else {
                city_id = comingID.ancestors[0].location_id;
                var city = comingID.ancestors[0].name;

                var state = "";
                if(comingID.ancestors[1] != null)
                    state = comingID.ancestors[1].name;

                var country = "";
                if(comingID.ancestors[2] != null)
                    country = comingID.ancestors[2].name;

                getPhotos(city_id, function (body1) {
                    //console.log(body1[0]);

                    if(body1[0] == null){
                        cnt++;
                    }
                    else {
                        for(var image in body1){
                            if(body1[image].caption == null)
                                body1[image].caption = "no caption";
                        }

                        allImages[x] = body1;
                        allImages[x].name = city;
                        allImages[x].state = state;
                        allImages[x].country = country;
                        cnt++;
                        x++;
                    }
                });
            }
        });
    }


    var f = function() {
        if (cnt < req.body.count) {
            setTimeout(function(){f()}, 200);
        } else {
            // Set location on form here if it isn't in getLocation()
            res.render('index', {
                title: 'photoAdvisor by Hugo',
                allImagesX: allImages
            });
        }
    }

    f();

});

module.exports = router;
