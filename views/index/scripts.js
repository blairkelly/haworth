var socket = io.connect('//'+window.location.hostname+':'+window.location.port);
var picnum = 2;


socket.on('welcome', function (data) {
    console.log(data.message);
});

var on_window_resize = function () {
    var wh = $(window).height();
    var ww = $(window).width();

    $('.supercontainer, .thought_bubble').css('width', ww + 'px').css('height', wh + 'px');
}

var load_background_image = function (imgpath) {
    $('<img/>').attr('src', imgpath).load(function() {
        var timg = $(this);
        $('.thought_bubble.main').css('background-image', 'url('+imgpath+')');

        setTimeout(function () {
            $('.thought_bubble.buffer').css('background-image', 'url('+imgpath+')');
            timg.remove();
            cycleBGs();
        }, 666);
    });
}

var cycleBGs = function () { 
    setTimeout(function () {
        load_background_image('/images/'+picnum+'.jpg');
        picnum++;
        if (picnum > 3) {
            picnum = 1;
        }
    }, 5000);
}

$(document).ready(function () {
    on_window_resize();
    cycleBGs();
});

$(window).on('resize', function () {
    on_window_resize();
});