var config = module.parent.exports.config;
var app = module.parent.exports.app;
var io = module.parent.exports.io;
var fs = module.parent.exports.fs;
var scoms = module.parent.exports.serialcoms;

var thoughtbubble_showing = false;
var current_thoughtbubble = '';

var f1_switched = false;

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
        socket.emit('showthoughts', true);

        /*
        setTimeout(function () {
            var rt = random_thoughtbubble();
            console.log(rt);
            socket.emit('setimg', rt);
        }, 7000);
        */

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

        });

        socket.on('donehide', function (data) {
            console.log('Done Hide');
        });

        socket.on('disconnect', function () {
            console.log('thoughtbubbles disconnected');
        });
    });
});

var create_serialport_listeners = function () {
    sport.on("open", function () {
        var message = null;
        console.log('opened serial port');

        sport.on('data', function (data) {
            var pairs = data.split('&');
            var pieces = null;
            var params = {};

            for(var i = 0; i<pairs.length; i++) {
                pieces = pairs[i].split('=');
                params[pieces[0]] = pieces[1];
            }

            console.log(params);

            if (parseInt(params.f1, 10) > 999) {
                if (!f1_switched) {
                    f1_switched = true;
                    var rt = random_thoughtbubble();
                    console.log(rt);
                    io.sockets.emit('setimg', rt);
                }
            } else if (f1_switched) {
                io.sockets.emit('hidethoughts', true);
                f1_switched = false;
            }
        });



    });
}

setTimeout(function () {
    console.log("Opening serialport...");
    sport = scoms.new_serialport();
    create_serialport_listeners();
}, 100);