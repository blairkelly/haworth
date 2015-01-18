console.log("Admin");

socket.on('connect', function () {
    socket.on('welcome', function (data) {
        console.log(data.message);
    });
});

$('.refreshclients').click(function () {
    socket.emit('refreshclients', true);
});

$('.sit_down_0').click(function () {
    socket.emit('sit_down_0', true);
});

$('.stand_up_0').click(function () {
    socket.emit('stand_up_0', true);
});