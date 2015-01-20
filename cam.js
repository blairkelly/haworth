//Haworth Design Offsite
var config = require('./config');

var path = require('path');
var http = require('http');
var express = require('express');
var cookieParser = require('cookie-parser')
var session = require('express-session')
var fs = require('fs');
var moment = require('moment');
var request = require('request');

var app = express();           // start Express framework

app.enable('trust proxy');
app.use(cookieParser());
app.use(session({ secret: 'jasmine top' }));

var server = http.createServer(app); // start an HTTP server
server.listen(3300);

//var knox = require('knox');
//var s3client = knox.createClient({
//    key: 'AKIAIPG35O4JUXEHP5GQ',
//    secret: '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',
//    bucket: 'blairkelly',
//});

var ftp = require('ftp');

var taking_photo = false;

var request_to_display_latest_sitter = function (eid, file_to_put) {
    var req_loc = 'http://www.blairkelly.ca/update_haworth_sitter?sitter_id='+eid+'&picture='+file_to_put;
    console.log(req_loc);
    request(req_loc, function (error, response, body) {
        if (!error) {
            console.log("Updated haworth sitter picture.");

            request('http://10.0.1.16:3000/displaylatestsitter', function (error, response, body) {
                if (!error) {
                    console.log("Requested latest sitter.");
                }
                else {
                    console.log("problem requesting latest sitter...");
                    console.log(error);
                }
            });

            cmds.shift();
            if (cmds.length > 0) {
                console.log("Calling next in line...");
                cmds[0].func(cmds[0].params);
            } else {
                console.log("queue is empty.");
                queue_empty = true;
            }
        }
    });
}

var upload_to_ftp = function (eid, file_to_put) {
    console.log("attempting to upload: " + file_to_put);
    var target_image_path = '/Users/blairkelly/Sites/haworth/public/images/sitters/' + file_to_put;
    var ftpclient = new ftp();
    ftpclient.on('ready', function() {
        console.log("FTP IS READY");
        ftpclient.put(file_to_put, target_image_path, function (err) {
            if (err) throw err;
            ftpclient.end();
            console.log('finished uploading ' + file_to_put + ' to FTP!');
            fs.unlink(file_to_put);
            request_to_display_latest_sitter(eid, file_to_put);
        });
    });
    ftpclient.connect({
        host: '10.0.1.5',
        port: 21,
        user: 'blairkelly',
        password: 'advance'
    });
}

/*
var upload_to_s3 = function (eid, file_to_put) {
    console.log("attempting to upload: " + file_to_put);
    var target_image_path = '/images/haworth/' + file_to_put;

    var s3_upload = s3client.putFile(file_to_put, target_image_path, function (err, s3upres) {
        if (err) {
            console.error("s3 put error...");
            console.error(err);
        }
        if (s3upres) {
            if (s3upres.statusCode == 200) {
                console.log('finished uploading ' + file_to_put + ' to s3!');
                fs.unlink(file_to_put);
                request_to_display_latest_sitter(eid, file_to_put);
            }
            else {
                console.log(s3upres.statusCode);
            }
        }
        else {
            console.log('s3upres is empty');
        }
    });
}
*/

var cmds = [];
var queue_empty = true;

/*
function takeWebcamShot(params) {
    var req = params.req;
    var res = params.res;
    var filename = params.filename;
    console.log("takeWebcamShot: " + filename);
 
    // Spawn the webcam child process.
    var spawn = require('child_process').spawn,
        fswebcam = spawn('fswebcam', [
            '--device', '/dev/video0', 
            '--no-banner', 
            '--resolution', '1280x720', 
            '--jpeg', '100', 
            '--save', filename
        ]);
 
    // Log fswebcam output.
    fswebcam.stdout.on('data', function (data) {
        //console.log('stdout: ' + data);
    });
 
    // Log any errors.
    fswebcam.stderr.on('data', function (data) {
        //console.log('stderr: ' + data);
    });
 
    // continue processing after it has taken photos
    fswebcam.on('exit', function (code) {
        console.log('done');
        params.callback();
        setTimeout(function () {
            console.log('calling upload_to_ftp');
            upload_to_ftp(params.eid, filename);
        }, 22);
    });
}
*/

function takeGphotoShot(params) {
    var req = params.req;
    var res = params.res;
    var filename = params.filename;
    console.log("takeGphotoShot: " + filename);
 
    // Spawn the gphoto2 child process.
    var spawn = require('child_process').spawn;
    var gphoto2 = spawn('gphoto2', [
            '--capture-image-and-download', 
            '--filename', filename
        ]);
 
    // Log fswebcam output.
    gphoto2.stdout.on('data', function (data) {
        console.log('stdout: ' + data);
    });
 
    // Log any errors.
    gphoto2.stderr.on('data', function (data) {
        console.log('stderr: ' + data);
    });
 
    // continue processing after it has taken photos
    gphoto2.on('exit', function (code) {
        console.log('done');
        params.callback();
        setTimeout(function () {
            taking_photo = false;
            console.log('calling upload_to_ftp');
            upload_to_ftp(params.eid, filename);
        }, 22);
    });
}

var fauxfoto = function (params) {

    params.callback();
}

app.get('/takephoto', function (req, res) {
    if (taking_photo) {
        return res.send(200);
    }
    else {
        console.log("PHOTO REQUESTED...");
        taking_photo = true;
        console.log(req.query);

        var eid = req.query.eid;
        var tb_id = req.query.tb_id;
        var time = req.query.time;
        
        if (!eid || !tb_id || !time) {
            return res.send("missing query components");
        }
        
        cmds.push({
            func: takeGphotoShot,
            params: {
                req: req,
                res: res,
                filename: 'eid-' + eid + '_tb-' + tb_id + '_' + time + '.jpg',
                eid: eid,
                callback: function () {
                    res.send(200);
                }
            }
        });
        if (queue_empty) {
            queue_empty = false;
            cmds[0].func(cmds[0].params);
        }
    }
});

app.get('/', function (req, res) {
    res.send("I am alive.");
});
