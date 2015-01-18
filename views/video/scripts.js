var thedoc = $(document);
var target = $('#hawvid');
var vidstate = target.get(0);

target.on('ended', function() {
    vidstate.play();
});

socket.on('connect', function () {
    socket.on('refresh', function (data) {
        window.location.reload();
    });
});




var on_videowindow_resize = function () {
    target.attr('width', thedoc.width()).attr('height', thedoc.height());
}

$(window).on('resize', function () {
    on_videowindow_resize();
});

$(document).ready(function () {
    on_videowindow_resize();
});