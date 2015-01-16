var showing = false;
var thoughtbubble_id = parseInt($('#tb_id').data('thoughtbubble_id'), 10);
console.log("thoughtbubble_id: " + thoughtbubble_id);

var hide_thoughtbubbles = function (cb) {
    $('.thought_bubble').removeClass('showing');

    setTimeout(function () {
        $('.thought_bubble').removeClass('transitions');
        cb();
    }, img_transition_time);
}

var show_thoughtbubbles = function () {
    if (!$('.thought_bubble').hasClass('showing')) {
        $('.thought_bubble').addClass('transitions').addClass('showing');
    }
}

var load_thoughtbubble = function (thoughtbubble_imgname, cb) {
    var imgpath = '/images/' + thoughtbubble_imgname;
    $('.thought_bubble.main').removeClass('transitions showing');

    setTimeout(function () {
        $('<img/>').attr('src', imgpath).load(function() {
            var timg = $(this);

            $('.thought_bubble').addClass('transitions');
            $('.thought_bubble.main').css('background-image', 'url('+imgpath+')').addClass('transitions').addClass('showing');
            
            setTimeout(function () {
                $('.thought_bubble.buffer').css('background-image', 'url('+imgpath+')').addClass('showing');
                timg.remove();
                cb();
            }, img_transition_time);
        });
    }, 22);
}