console.log("Admin");

socket.on('connect', function () {
    socket.on('welcome', function (data) {
        console.log(data.message);
    });
});

$('.refreshclients').click(function () {
    socket.emit('refreshclients', true);
});