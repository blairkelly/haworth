//comms
var socket = io.connect('//'+window.location.hostname+':'+window.location.port);

var add_socket_listeners = function () {
    socket.on('welcome', function (data) {
        console.log(data.message);
    });
    
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
    socket.on('refresh', function (data) {
        window.location.reload();
    });

    socket.on('disconnect', function () {
        console.log('socket disconnected. removing event listeners.');
        socket.removeAllListeners();
        socket.on('connect', function () {
            add_socket_listeners();
        });
    });
}

socket.on('connect', function () {
    add_socket_listeners();
});

