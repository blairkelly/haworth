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
var butt_gone_delay = 320;

var thought_min_displaytime = 2700;
var cycle_time = 5555;

var tbs = [
    {
        id: 0,
        current_thoughtbubble: '',
        thresh1: 500,
    },
    {
        id: 1,
        current_thoughtbubble: ''
    },
]

app.get('/thoughtbubbles', function (req, res) {
    res.send("specify a thought bubble id. /0 or /1");
});

app.get('/thoughtbubbles/:id', function (req, res) {
    var id = parseInt(req.params.id, 10);
    if (id == 0 || id == 1) {
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
            tbs[0].socket = socket;
            socket.tb = tbs[0];
        } else if (data.id == 1) {
            console.log("TB TWO");
            tbs[1].socket = socket;
            socket.tb = tbs[1];
        }

        //socket.emit('showthoughts', true);
        
        //setTimeout(function () {
        //    var rt = random_thoughtbubble();
        //    console.log(rt);
        //    socket.emit('setimg', rt);
        //}, 1000);
        

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
            socket.tb.image_displayed = moment();
            setTimeout(function () {
                if (socket.tb.buttplanted) {
                    socket.tb.current_thoughtbubble = random_thoughtbubble(socket.tb);
                    console.log("Sending to tbs[" + socket.tb.id + "]: " + socket.tb.current_thoughtbubble);
                    socket.tb.socket.emit('setimg', socket.tb.current_thoughtbubble);
                }
            }, cycle_time);
        });

        socket.on('donehide', function (data) {
            console.log('Done Hide');
            socket.tb.image_displayed = null;
        });

        socket.on('disconnect', function () {
            socket.tb.socket = null;
            console.log('thoughtbubbles disconnected');
        });
    });
});



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

        if (tbs[0].socket) {
            if (params.f0 > tbs[0].thresh1) {
                tbs[0].buttgone = null;
                if (!tbs[0].buttseen) {
                    tbs[0].buttseen = moment();
                }
                if (!tbs[0].buttplanted) {
                    var tdiff = now.diff(tbs[0].buttseen);
                    if (tdiff > butt_on_delay) {
                        tbs[0].buttplanted = true;
                        tbs[0].current_thoughtbubble = random_thoughtbubble(tbs[0]);
                        console.log("Sending to tbs[0]: " + tbs[0].current_thoughtbubble);
                        tbs[0].socket.emit('setimg', tbs[0].current_thoughtbubble);
                    }
                }
            }
            else {
                tbs[0].buttseen = null;
                if (!tbs[0].buttgone) {
                    tbs[0].buttgone = moment();
                }
                if (tbs[0].buttplanted && tbs[0].image_displayed) {
                    var tdiff = now.diff(tbs[0].buttgone);
                    var idiff = now.diff(tbs[0].image_displayed);
                    if ((tdiff > butt_gone_delay) && tbs[0].buttplanted && (idiff > thought_min_displaytime)) {
                        tbs[0].buttplanted = false;
                        tbs[0].socket.emit('hidethoughts', true);
                    }
                }
            }
        }

    });
});
