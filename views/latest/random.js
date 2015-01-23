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

var load_image = function (imgdata, callback) {
    var origin_path = "http://blairkelly.ca/haworth-image/"
    if (imgdata.touchup) {
        origin_path+='touched-up/';
    }
    var imgpath = origin_path + imgdata.picture;
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
                callback();
            }, img_transition_time);
        });
    }, 22);
}

var countdown_to_show_random = function () {
    var time = moment();
    var hour = parseInt(time.format("H"), 10);
    var min = parseInt(time.format("m"), 10)

    if (hour < 9) {
        return console.log("too early");
    }
    else if (hour >= 19 && min >= 30) {
        return console.log("too late");
    }

    setTimeout(function () {
        $.ajax({
            type: "GET",
            url: "/get_random_json",
            success: function (data) {
                console.log(data);
                load_image(data, function () {
                    countdown_to_show_random();
                });
            },
            error: function (err) {
                console.log(err);
            }
        });
    }, 15000);
}

countdown_to_show_random();