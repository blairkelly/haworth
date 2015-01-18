//Haworth Design Offsite
var config = require('./config');

var path = require('path');
var http = require('http');
var express = require('express');
var cookieParser = require('cookie-parser')
var session = require('express-session')
var fs = require('fs');
var moment = require('moment');
var knox = require('knox');

var app = express();           // start Express framework

app.enable('trust proxy');
app.use(cookieParser());
app.use(session({ secret: 'jasmine top' }));

var server = http.createServer(app); // start an HTTP server
server.listen(process.env.PORT || 3000);

var s3client = knox.createClient({
    key: 'AKIAIPG35O4JUXEHP5GQ',
    secret: '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',
    bucket: 'blairkelly',
});

var upload_to_s3 = function (file_to_put) {
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

var cmds = [];
var queue_empty = true;

function takeShot(params) {
    var req = params.req;
    var res = params.res;
    var filename = params.filename;
    console.log("takeShot: " + filename);
 
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
        console.log('stdout: ' + data);
    });
 
    // Log any errors.
    fswebcam.stderr.on('data', function (data) {
        console.log('stderr: ' + data);
    });
 
    // continue processing after it has taken photos
    fswebcam.on('exit', function (code) {
        console.log('done');
        params.callback();
        setTimeout(function () {
            console.log('calling upload_to_s3');
            upload_to_s3(filename);
        }, 100);
    });
}

app.get('/takephoto', function (req, res) {
    console.log(req.query);

    var eid = req.query.eid;
    var tb_id = req.query.tb_id;
    var time = moment().format('YYYY-MM-DD-HH-mm-ss');
    
    if (!eid || !tb_id) {
        return res.send("missing query components");
    }
    
    cmds.push({
        func: takeShot,
        params: {
            req: req,
            res: res,
            filename: 'eid-' + eid + '_tb-' + tb_id + '_' + time + '.jpg',
            callback: function () {
                res.send(200);
                cmds.shift();
                if (cmds.length > 0) {
                    console.log("Calling next in line...");
                    cmds[0].func(cmds[0].params);
                } else {
                    console.log("queue is empty.");
                    queue_empty = true;
                }
            }
        }
    });
    if (queue_empty) {
        queue_empty = false;
        cmds[0].func(cmds[0].params);
    }
});