var config = module.parent.exports.config;
var app = module.parent.exports.app;
var io = module.parent.exports.io;
var fs = module.parent.exports.fs;
var moment = module.parent.exports.moment;
var request = module.parent.exports.request;

app.get('/displaylatestsitter', function (req, res) {
    request('http://www.blairkelly.ca/get_latest_haworth_sitter', function (error, response, body) {
        res.send(body);
    });
});

app.get('/latest', function (req, res) {
    res.render('latest/latest.jade');
});

app.get('/latest_sitter/:img', function (req, res) {
    res.send(req.params.img);
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