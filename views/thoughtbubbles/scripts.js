var img_transition_time = 1400;
var min_display_time = 750;
var in_transition = false;
var cmds = [];
var next_cmd_ok = true;
var can_add = true;

var thoughtbubble_id = parseInt($('#tb_id').data('thoughtbubble_id'), 10);
console.log("thoughtbubble_id: " + thoughtbubble_id);

var hide_thoughtbubbles = function (params) {
    $('.thought_bubble').removeClass('showing');

    setTimeout(function () {
        $('.thought_bubble').removeClass('transitions');
        params.callback();
    }, img_transition_time);
}

var load_thoughtbubble = function (params) {
    var imgpath = '/images/thoughtbubbles/' + params.imgname;
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