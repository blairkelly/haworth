//Haworth Design Offsite
var config = require('./config');

var path = require('path');
var http = require('http');
var express = require('express');
var cookieParser = require('cookie-parser')
var session = require('express-session')
var fs = require('fs');
var moment = require('moment');

var app = express();           // start Express framework

app.enable('trust proxy');
app.use(cookieParser());
app.use(session({ secret: 'jasmine top' }));

var server = http.createServer(app); // start an HTTP server
server.listen(process.env.PORT || 3000);

var cmds = [];
var next_cmd_ok = true;

function takeShot(params, callback) {
    var filename = device + '.jpg';
 
    // Spawn the webcam child process.
    var spawn = require('child_process').spawn,
        fswebcam = spawn('fswebcam', [
            '--device', '/dev/' + device, 
            '--no-banner', 
            '--resolution', '1280x720', 
            '--jpeg', '100', 
            '--save', filename
        ]);
 
    // Log fswebcam output.
    fswebcam.stdout.on('data', function (data) {
        console.log('stdout: ' + data);
    });
 
    // Log any errors.
    fswebcam.stderr.on('data', function (data) {
        console.log('stderr: ' + data);
    });
 
    // continue processing after it has taken photos
    fswebcam.on('exit', function (code) {
        // Do stuff, like saving/hosting your images.
        // We used knox (https://github.com/LearnBoost/knox)
        // to push the photos to S3.

        console.log('done');
    });
}
 
//takeShot('video0');

var fauxfoto = function (params) {

    params.callback();
}

app.get('/takephoto', function (req, res) {
    console.log(req.query);
    //takeShot('video0');

    res.send('where the fuck is this');
    
    /*
    cmds.push({
        func: fauxfoto,
        params: {
            callback: function () {
                console.log("CALLBACK");
                res.send('hi2');
                //cmds.shift();
                next_cmd_ok = true;
            }
        }
    });
    */
});

/*
setInterval(function () {
    if (next_cmd_ok && (cmds.length > 0)) {
        console.log("Next!");
        next_cmd_ok = false;
        cmds[0].func(cmds[0].params);
    }
}, 55);
*/

console.log("wtf");