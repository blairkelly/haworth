var config = module.parent.exports.config;
var app = module.parent.exports.app;
var io = module.parent.exports.io;
var fs = module.parent.exports.fs;

var thoughtbubble_showing = false;
var current_thoughtbubble = '';

app.get('/thoughtbubbles', function (req, res) {
    res.render('thoughtbubbles/thoughtbubbles.jade');
});

var random_thoughtbubble = function () {
    var tb = current_thoughtbubble;
    var picktries = 0;
    while ((tb == current_thoughtbubble) && (picktries < 3)) {
        tb = config.thoughtbubbles[Math.floor(Math.random() * config.thoughtbubbles.length)];
        picktries++;
    }
    return current_thoughtbubble = tb;
}

io.on('connection', function(socket) {
    socket.on('thoughtbubbles', function (data) {
        console.log("Thoughtbubbles connected...");
        
        setTimeout(function () {
            var rt = random_thoughtbubble();
            console.log(rt);
            socket.emit('setimg', rt);
        }, 7000);


        /*
        setTimeout(function () {
            //var rt = random_thoughtbubble();
            //console.log(rt);
            //socket.emit('setimg', rt);
            socket.emit('showthoughts', true);

            setTimeout(function () {
                var rt = random_thoughtbubble();
                console.log(rt);
                socket.emit('setimg', rt);
            }, 7000);
        }, 5000);
        */

        socket.on('doneload', function (data) {
            console.log('Done Load');

            //setTimeout(function () {
            //    socket.emit('hidethoughts', true);
            //}, 3000);

            setTimeout(function () {
                var rt = random_thoughtbubble();
                console.log(rt);
                socket.emit('setimg', rt);
            }, 7000);

        });

        socket.on('donehide', function (data) {
            console.log('Done Hide');
        });

        socket.on('disconnect', function () {
            console.log('thoughtbubbles disconnected');
        });
    });
});