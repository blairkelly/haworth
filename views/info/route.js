var config = module.parent.exports.config;
var app = module.parent.exports.app;
var io = module.parent.exports.io;
var fs = module.parent.exports.fs;
var scoms = module.parent.exports.serialcoms;
var sport = scoms.connectedport;

app.get('/info', function (req, res) {
    res.render('info/info.jade');
});

io.on('connection', function(socket) {
    socket.on('info', function (data) {
        console.log("Info connected...");
        socket.is_info = true;

        socket.on('disconnect', function () {
            console.log('info disconnected');
        });
    });
});

sport.on("open", function () {
    sport.on('data', function (data) {
        var sockets = io.sockets.connected;
        for (var socket in sockets) { 
            if (sockets[socket].is_info) {
                io.sockets.emit('serialdata', data);
            }
        }
    });
});