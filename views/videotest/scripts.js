var thedoc = $(document);
var target = $('#hawvid');
var vidstate = target.get(0);

target.attr('width', thedoc.width());

target.on('ended', function() {
    vidstate.play();
});

socket.on('connect', function () {
    socket.on('refresh', function (data) {
        window.location.reload();
    });
});