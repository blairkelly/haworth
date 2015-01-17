//comms

var add_socket_listeners = function () {
    socket.on('welcome', function (data) {
        console.log(data.message);
    });
    
    socket.emit('thoughtbubbles', {id: thoughtbubble_id});

    socket.on('setimg', function (imgname) {
        if (can_add) {
            cmds.push({
                func: load_thoughtbubble,
                params: {
                    imgname: imgname,
                    callback: function () {
                        socket.emit('doneload', true);
                        setTimeout(function () {
                            next_cmd_ok = true;
                        }, min_display_time);
                    }
                }
            });
        }
    });
    socket.on('hidethoughts', function (data) {
        if (can_add) {
            can_add = false;
            cmds.push({
                func: hide_thoughtbubbles,
                params: {
                    callback: function () {
                        socket.emit('donehide', true);
                        setTimeout(function () {
                            next_cmd_ok = true;
                            can_add = true;
                        }, 500);
                    }
                }
            });
        }
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