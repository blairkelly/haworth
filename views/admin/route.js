var app = module.parent.exports.app;
var io = module.parent.exports.io;

app.get('/admin', function (req, res) {
    res.render('admin/index.jade');
});

io.on('connection', function(socket) {
    socket.on('refreshclients', function (data) {
        console.log('Refreshing clients...');
        io.sockets.emit('refresh', true);
    });
});