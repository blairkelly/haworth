var config = module.parent.exports.config;
var app = module.parent.exports.app;
var io = module.parent.exports.io;
var fs = module.parent.exports.fs;
var moment = module.parent.exports.moment;
var request = module.parent.exports.request;
var s3client = module.parent.exports.s3client;

app.get('/displaylatestsitter', function (req, res) {
    request('http://www.blairkelly.ca/get_latest_haworth_sitter', function (error, response, body) {
        var body_json = JSON.parse(body);
        console.log('emitting to latest: ' +  body_json.picture);
        emit_to_latest(function (socket) {
            console.log('emit!');
            socket.emit('setimg', body_json.picture);
        });
        res.send(200);
    });
});

app.get('/latest', function (req, res) {
    res.render('latest/latest.jade');
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

var emit_to_latest = function (callback) {
    var sockets = io.sockets.connected;
    for (var key in sockets) { 
        if (sockets[key].is_latest) {
            callback(sockets[key]);
        }
    }
}