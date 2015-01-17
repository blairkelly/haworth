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
    {t0: 900, t1: 900},
    {t0: 900, t1: 900}
];

var bubbles = [
    {},
    {}
];

app.get('/thoughtbubbles', function (req, res) {
    res.send("specify a thought bubble id. /0 or /1");
});

app.get('/thoughtbubbles/static/:id', function (req, res) {
    var id = parseInt(req.params.id, 10);
    res.locals.thoughtbubble_id = id;
    res.render('thoughtbubbles/static.jade');
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
            
        });

        socket.on('donehide', function (data) {
            //console.log('Done Hide');
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

        for (var b = 0; b < bubbles.length; b++) {
            var sensor_ids = [];
            sensor_ids.push('f'+(b*2));
            sensor_ids.push('f'+((b*2)+1));

            if ((params[sensor_ids[0]] > fs_profiles[b].t0) || (params[sensor_ids[1]] > fs_profiles[b].t1)) {
                bubbles[b].buttgone = null;
                if (!bubbles[b].buttseen) {
                    bubbles[b].buttseen = moment();
                }
                if (!bubbles[b].buttplanted) {
                    var tdiff = now.diff(bubbles[b].buttseen);
                    if (tdiff > butt_on_delay) {
                        bubbles[b].buttplanted = true;
                        bubbles[b].current_thoughtbubble = random_thoughtbubble(bubbles[b]);
                        emit_to_bubble(0, function (socket) {
                            console.log("SET IMG");
                            socket.emit('setimg', bubbles[b].current_thoughtbubble);
                        });
                    }
                }
            }
            else {
                bubbles[b].buttseen = null;
                if (!bubbles[b].buttgone) {
                    bubbles[b].buttgone = moment();
                }
                if (bubbles[b].buttplanted) {
                    var tdiff = now.diff(bubbles[b].buttgone);
                    if ((tdiff > butt_gone_delay) && bubbles[b].buttplanted) {
                        bubbles[b].buttplanted = false;
                        emit_to_bubble(0, function (socket) {
                            socket.emit('hidethoughts', true);
                        });
                    }
                }
            }
        }

    });
});
