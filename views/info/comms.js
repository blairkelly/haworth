//comms

var add_socket_listeners = function () {
    socket.on('welcome', function (data) {
        console.log(data.message);
    });
    
    socket.emit('info', true);

    socket.on('serialdata', function (data) {
        parseSerialData(data);
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