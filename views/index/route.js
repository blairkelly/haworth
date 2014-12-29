var app = module.parent.exports.app;
var io = module.parent.exports.io;

app.get('/', function (req, res) {
	res.render('index/index.jade');
});

io.on('connection', function(socket) {
    console.log("Connected. Sending welcome...");

    socket.emit('welcome', {message: "H A W O R T H"});
    
    socket.on('disconnect', function () {
        console.log('socket disconnected');
    });
});