var config = module.parent.exports.config;
var app = module.parent.exports.app;
var io = module.parent.exports.io;
var fs = module.parent.exports.fs;
var moment = module.parent.exports.moment;
var request = module.parent.exports.request;
var s3client = module.parent.exports.s3client;

var retrieve_latest_filename = function (callback) {
    request('http://www.blairkelly.ca/get_latest_haworth_sitter', function (error, response, body) {
        if (!error) {
            var body_json;
            try {
                body_json = JSON.parse(body);
            } catch (err) {
                console.log(body, err);
                console.log("Parse failed.");
                callback(null);
                return null;
            }
            callback(body_json.picture);
        }
    });
}

var get_random = function (callback) {
    request('http://www.blairkelly.ca/get_random_haworth_sitter', function (error, response, body) {
        if (!error) {
            var body_json;
            try {
                body_json = JSON.parse(body);
            } catch (err) {
                console.log(body, err);
                console.log("Parse failed.");
                callback(null);
                return null;
            }
            callback(body_json);
        }
    });
}

var upload_to_s3 = function (file_to_put) {
    console.log("attempting to upload: " + file_to_put);
    var file_to_send_path = '/Users/blairkelly/Sites/haworth/public/images/sitters/' + file_to_put;
    var target_image_path = '/images/haworth/' + file_to_put;

    var s3_upload = s3client.putFile(file_to_send_path, target_image_path, function (err, s3upres) {
        if (err) {
            console.error("s3 put error...");
            console.error(err);
        }
        if (s3upres) {
            if (s3upres.statusCode == 200) {
                console.log('finished uploading ' + file_to_put + ' to s3!');
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

app.get('/displaylatestsitter', function (req, res) {
    retrieve_latest_filename(function (filename) {
        if (filename) {
            console.log('emitting to latest: ' +  filename);
            emit_to_latest(function (socket) {
                socket.emit('setimg', filename);
            });
            upload_to_s3(filename);
            return res.send(200);
        }
        else {
            return res.send(404);
        }
    });
});

app.get('/latest', function (req, res) {
    retrieve_latest_filename(function (filename) {
        res.locals.latest_filename = filename;
        res.render('latest/latest.jade');
    });
});

app.get('/latest_sitter/:img', function (req, res) {
    console.log(req.params.img);

    s3client.getFile('/images/haworth/' + req.params.img, function (err, s3res) {
        if (err) {
            console.error("IMAGE FETCH ERROR");
            console.error(err);
        }
        else if (s3res.statusCode == 404) {
            res.send(404);
            return null;
        } else if (s3res.statusCode == 200) {
            res.type('jpg');
            s3res.pipe(res);
        }
    });
});

app.get('/random', function (req, res) {
    get_random(function (imgdata) {
        res.locals.imgdata = imgdata;
        res.render('latest/random.jade');
    });
});

app.get('/get_random_json', function (req, res) {
    get_random(function (imgdata) {
        res.send(imgdata);
    });
});

var emit_to_latest = function (callback) {
    var sockets = io.sockets.connected;
    for (var key in sockets) { 
        if (sockets[key].is_latest) {
            callback(sockets[key]);
        }
    }
}

io.on('connection', function(socket) {
    socket.on('latest', function (data) {
        console.log("latest connected...");

        socket.is_latest = true;

        socket.on('disconnect', function () {
            //bubble popped
            console.log('latest popped');
        });
    });
});

