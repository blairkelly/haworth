var config = module.parent.exports.config;
var app = module.parent.exports.app;
var io = module.parent.exports.io;
var fs = module.parent.exports.fs;
var cv = module.parent.exports.cv;

var debounce_count = 0;
var debounce_ceiling = 2;
var thoughtbubble_showing = false;
var current_thoughtbubble = '';

var currentSocket = null;

var camera = new cv.VideoCapture(0);

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

var touchokay = true;
var watchCameraForFaces = function () {
    camera.read(function(err, im) {
        if (err) throw err;
        im.detectObject(cv.FACE_CASCADE, {}, function (err, faces) {
            if (touchokay) {
                if (!thoughtbubble_showing) {
                    if (faces.length > 0) {
                        debounce_count++;

                        if (debounce_count == debounce_ceiling) {
                            var rt = random_thoughtbubble();
                            console.log(rt);
                            if (currentSocket) {
                                currentSocket.emit('setimg', rt);
                            }
                            //io.sockets.emit('setimg', rt);
                            touchokay = false;
                            thoughtbubble_showing = true;
                            debounce_count = 0;
                        }
                    } else {
                        debounce_count = 0;
                    }
                } else {
                    if (!faces.length) {
                        debounce_count++;
                        if (debounce_count == debounce_ceiling) {
                            console.log("HIDE thoughts");
                            if (currentSocket) {
                                currentSocket.emit('hidethoughts', true);
                            }
                            //io.sockets.emit('hidethoughts', true);
                            thoughtbubble_showing = false;
                            touchokay = false;
                            debounce_count = 0;
                        }
                    } else {
                        debounce_count = 0;
                    }
                }
            }
            setTimeout(function () {
                watchCameraForFaces();
            }, 160);
        });
    });
}
watchCameraForFaces();

io.on('connection', function(socket) {
    socket.on('thoughtbubbles', function (data) {
        console.log("Thoughtbubbles connected...");
        currentSocket = socket;
        
        /*
        setTimeout(function () {
            var rt = random_thoughtbubble();
            console.log(rt);
            socket.emit('setimg', rt);
        }, 5000);
        */

        socket.on('doneload', function (data) {
            console.log('Done Load');

            //setTimeout(function () {
            //    socket.emit('hidethoughts', true);
            //}, 3000);

            setTimeout(function () {
                touchokay = true;
                console.log("Touch ok again.")
            }, 5000);
        });

        socket.on('donehide', function (data) {
            console.log('Done Hide');
            setTimeout(function () {
                touchokay = true;
                console.log("Touch ok again.")
            }, 3000);
        });

        socket.on('disconnect', function () {
            console.log('thoughtbubbles disconnected');
            currentSocket = null;
        });
    });
});