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
    console.log('hiding...');
    $('.thought_bubble.main').removeClass('transitions showing');

    setTimeout(function () {


        $('<img/>').attr('src', imgpath).load(function() {
            var timg = $(this);
            $('.thought_bubble.main').css('background-image', 'url('+imgpath+')').addClass('transitions').addClass('showing');
            console.log('re-added transitions and showing...');

            setTimeout(function () {
                $('.thought_bubble.buffer').css('background-image', 'url('+imgpath+')');
                timg.remove();
                cycleBGs();
            }, 3200);
        });



    }, 22);
    
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
    $('.thought_bubble').addClass('transitions').addClass('showing');
    on_window_resize();
    cycleBGs();
});

$(window).on('resize', function () {
    on_window_resize();
});