var img_transition_time = 1500;
var min_display_time = 1250;
var in_transition = false;
var cmds = [];
var next_cmd_ok = true;
var can_add = true;

var hide_thoughtbubbles = function (params) {
    $('.thought_bubble').removeClass('showing');

    setTimeout(function () {
        $('.thought_bubble').removeClass('transitions');
        params.callback();
    }, img_transition_time);
}

var load_thoughtbubble = function (params) {
    //var imgpath = '/latest_sitter/' + params.imgname;
    var imgpath = '/images/sitters/' + params.imgname;
    console.log(imgpath);

    $('.thought_bubble.main').removeClass('transitions showing');

    setTimeout(function () {
        $('<img/>').attr('src', imgpath).load(function() {
            var timg = $(this);

            $('.thought_bubble').addClass('transitions');
            $('.thought_bubble.main').css('background-image', 'url('+imgpath+')').addClass('transitions').addClass('showing');
            
            setTimeout(function () {
                $('.thought_bubble.buffer').css('background-image', 'url('+imgpath+')').addClass('showing');
                timg.remove();
                params.callback();
            }, img_transition_time);
        });
    }, 22);
}

setInterval(function () {
    if (next_cmd_ok && (cmds.length > 0)) {
        next_cmd_ok = false;
        cmds[0].func(cmds[0].params);
        cmds.shift();
    }
}, 55);

