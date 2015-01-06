//comms
var socket = io.connect('//'+window.location.hostname+':'+window.location.port);

socket.on('welcome', function (data) {
    console.log(data.message);

    socket.emit('thoughtbubbles', true);

    socket.on('setimg', function (imgname) {
        load_thoughtbubble(imgname, function () {
            socket.emit('doneload', true);
        });
    });
    socket.on('hidethoughts', function (data) {
        hide_thoughtbubbles(function () {
            socket.emit('donehide', true);
        });
    });
});

socket.on('refresh', function (data) {
    window.location.reload();
});