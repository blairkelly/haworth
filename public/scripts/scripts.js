var img_transition_time = 3200;

var on_window_resize = function () {
    var wh = $(window).height();
    var ww = $(window).width();

    $('.supercontainer, .surface').css('width', ww + 'px').css('height', wh + 'px');
}

$(window).on('resize', function () {
    on_window_resize();
});

$(document).ready(function () {
    on_window_resize();
});