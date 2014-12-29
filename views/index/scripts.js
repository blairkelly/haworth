var socket = io.connect('//'+window.location.hostname+':'+window.location.port);

socket.on('welcome', function (data) {
    console.log(data.message);
});

var on_window_resize = function () {
    var wh = $(window).height();
    var ww = $(window).width();

    $('.supercontainer, .thought_bubble').css('width', ww + 'px').css('height', wh + 'px');
}

$(document).ready(function () {
    on_window_resize();
});