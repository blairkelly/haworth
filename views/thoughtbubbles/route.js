var config = module.parent.exports.config;
var app = module.parent.exports.app;
var io = module.parent.exports.io;
var fs = module.parent.exports.fs;
var scoms = module.parent.exports.serialcoms;
var sport = scoms.connectedport;
var moment = module.parent.exports.moment;
var request = module.parent.exports.request;

//var thoughtbubble_showing = false;
//var current_thoughtbubble = '';

var butt_on_delay = 210;
var butt_gone_delay = 240;

var cycle_time = 5555;

var fs_profiles = [
    {t0: 900, t1: 830},
    {t0: 920, t1: 810}
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

        socket.on('doneload', function (thoughtbubble_image) {
            
        });

        socket.on('donehide', function (data) {
            //console.log('Done Hide');
        });

        socket.on('disconnect', function () {
            //bubble popped
            console.log('bubble popped');
        });
    });

    socket.on('sit_down_0', function (data) {
        console.log('Someone is sitting down in seat 0...');
        bubbles[0].buttsat = moment();
        send_a_thought(0);
    }); 
    socket.on('stand_up_0', function (data) {
        console.log('Someone is lifting her butt off seat 0...');
        bubbles[0].buttgone = moment();
        update_sitter_sit_time(0);
        scrub_thought(0);
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
var emit_to_bubble = function (bubble_id, callback) {
    var sockets = io.sockets.connected;
    for (var key in sockets) { 
        if (sockets[key].bubble && sockets[key].bubble.id == bubble_id) {
            callback(sockets[key]);
        }
    }
}
var send_a_thought = function (bubble_id) {
    bubbles[bubble_id].buttsat = moment();
    bubbles[bubble_id].buttplanted = true;
    bubbles[bubble_id].current_thoughtbubble = random_thoughtbubble(bubbles[bubble_id]);
    emit_to_bubble(bubble_id, function (socket) {
        console.log("Sending a thought to " + bubble_id);
        socket.emit('setimg', bubbles[bubble_id].current_thoughtbubble);
    });
    setTimeout(function () {
        create_sitter_and_request_photo(bubble_id, bubbles[bubble_id].current_thoughtbubble);
    }, 700);
}
var scrub_thought = function (bubble_id) {
    bubbles[bubble_id].buttplanted = false;
    emit_to_bubble(bubble_id, function (socket) {
        console.log("Scrubbing " + bubble_id + "'s thoughts'");
        socket.emit('hidethoughts', true);
    });
}
var display_latest_sitter = function () {
     //give it half a second to maximize probability image has finished uploading
    setTimeout(function () {
        console.log('get latest picture name');
        request('http://www.blairkelly.ca/get_latest_haworth_sitter', function (error, response, body) {
            if (!error) {
                var body_json;
                try {
                    body_json = JSON.parse(body);
                } catch (err) {
                    console.log(body, err);
                    return console.log("Parse failed.");
                }
                console.log('emitting to latest: ' +  body_json.picture);
                emit_to_latest(function (socket) {
                    socket.emit('setimg', body_json.picture);
                });
            }
        });
    }, 500);
}
var update_sitter_sit_time = function (bubble_id) {
    if (bubbles[bubble_id].sitter_id && bubbles[bubble_id].buttsat && bubbles[bubble_id].buttgone) {
        var sit_time = Math.abs(bubbles[bubble_id].buttsat.diff(bubbles[bubble_id].buttgone));

        request('http://www.blairkelly.ca/update_haworth_sitter?sitter_id='+bubbles[bubble_id].sitter_id+'&sit_time='+sit_time, function (error, response, body) {
            if (!error) {
                console.log("Updated haworth sitter " + bubbles[bubble_id].sitter_id + " sit time.");
            }
        });
    }
    else {
        console.log("Missing params. Will not update.");
    }
}
var create_sitter_and_request_photo = function (bubble_id, thoughtbubble_image) {
    var req_loc = 'http://www.blairkelly.ca/new_haworth_sitter?seat_id='+bubble_id+'&img='+thoughtbubble_image;
    console.log(req_loc);
    request(req_loc, function (error, response, body) {
        if (!error) {
            var new_sitter_id = bubbles[bubble_id].sitter_id = parseInt(body, 10);
            console.log('result of new_haworth_sitter at ' + new_sitter_id);
            console.log('asking for a photo!');
            request('http://10.0.1.222:3000/takephoto?eid='+new_sitter_id+'&tb_id='+bubble_id, function (error, response, body) {
                if (!error) {
                    console.log("Got from camera: " + response.statusCode) // 200
                }
                else {
                    console.log(error);
                }
            });
        } else {
            console.log("Error: Couldn't create a new haworth sitter.");
        }
    });
}



if (sport) {
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
                            //someone sat down.
                            send_a_thought(b);
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
                            //person stood up
                            update_sitter_sit_time(b);
                            scrub_thought(b);
                        }
                    }
                }
            }

        });
    });
}