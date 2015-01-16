var config = module.parent.exports.config;
var app = module.parent.exports.app;
var io = module.parent.exports.io;
var fs = module.parent.exports.fs;
var scoms = module.parent.exports.serialcoms;
var sport = scoms.connectedport;
var moment = module.parent.exports.moment;

//var thoughtbubble_showing = false;
//var current_thoughtbubble = '';

var butt_on_delay = 160;
var butt_gone_delay = 720;

var cycle_time = 5555;

var fs_profiles = [
    {t0: 400, t1: 400},
    {t0: 400, t1: 400}
];

var bubbles = [
    {},
    {}
];

app.get('/thoughtbubbles', function (req, res) {
    res.send("specify a thought bubble id. /0 or /1");
});

app.get('/thoughtbubbles/:id', function (req, res) {
    var id = parseInt(req.params.id, 10);
    if (id < 2) {
        console.log("Thoughtbubble requested: " + id);
        res.locals.thoughtbubble_id = id;
        res.render('thoughtbubbles/thoughtbubbles.jade');
    }
    else {
        res.send("invalid thoughtbubble id");
    }
});

var random_thoughtbubble = function (tb) {
    var picktries = 0;
    var current_thoughtbubble = tb.current_thoughtbubble;
    while ((current_thoughtbubble == tb.current_thoughtbubble) && (picktries < 3)) {
        current_thoughtbubble = config.thoughtbubbles[Math.floor(Math.random() * config.thoughtbubbles.length)];
        picktries++;
    }
    return current_thoughtbubble;
}

io.on('connection', function(socket) {
    socket.on('thoughtbubbles', function (data) {
        console.log("Thoughtbubbles connected...");

        if (data.id == 0) {
            console.log("TB ONE");
            socket.bubble = {
                id: 0,
                current_thoughtbubble: '',
            };
        } else if (data.id == 1) {
            console.log("TB TWO");
            socket.bubble = {
                id: 1,
                current_thoughtbubble: '',
            };
        }

        socket.on('doneload', function (data) {
            console.log('Done Load');

            /*
            setTimeout(function () {
                if (socket.bubble.buttplanted) {
                    socket.bubble.current_thoughtbubble = random_thoughtbubble(socket.bubble);
                    console.log("Sending to bubbles[" + socket.bubble.id + "]: " + socket.bubble.current_thoughtbubble);
                    socket.bubble.emit('setimg', socket.bubble.current_thoughtbubble);
                }
            }, cycle_time);
            */
        });

        socket.on('donehide', function (data) {
            console.log('Done Hide');
        });

        socket.on('disconnect', function () {
            //bubble popped
            console.log('bubble popped');
        });
    });
});

var emit_to_bubble = function (bubble_id, callback) {
    var sockets = io.sockets.connected;
    for (var key in sockets) { 
        if (sockets[key].bubble && sockets[key].bubble.id == bubble_id) {
            callback(sockets[key]);
        }
    }
}

sport.on("open", function () {
    var message = null;
    console.log('opened serial port');

    sport.on('data', function (data) {
        var now = moment();

        var pairs = data.split('&');
        var pieces = null;
        var params = {};

        for(var i = 0; i<pairs.length; i++) {
            pieces = pairs[i].split('=');
            params[pieces[0]] = pieces[1];
        }

        if (params.f0 > fs_profiles[0].t0) {
            bubbles[0].buttgone = null;
            if (!bubbles[0].buttseen) {
                bubbles[0].buttseen = moment();
            }
            if (!bubbles[0].buttplanted) {
                var tdiff = now.diff(bubbles[0].buttseen);
                if (tdiff > butt_on_delay) {
                    bubbles[0].buttplanted = true;
                    bubbles[0].current_thoughtbubble = random_thoughtbubble(bubbles[0]);
                    emit_to_bubble(0, function (socket) {
                        console.log("SET IMG");
                        socket.emit('setimg', bubbles[0].current_thoughtbubble);
                    });
                }
            }
        }
        else {
            bubbles[0].buttseen = null;
            if (!bubbles[0].buttgone) {
                bubbles[0].buttgone = moment();
            }
            if (bubbles[0].buttplanted) {
                var tdiff = now.diff(bubbles[0].buttgone);
                if ((tdiff > butt_gone_delay) && bubbles[0].buttplanted) {
                    bubbles[0].buttplanted = false;
                    emit_to_bubble(0, function (socket) {
                        socket.emit('hidethoughts', true);
                    });
                }
            }
        }

    });
});
