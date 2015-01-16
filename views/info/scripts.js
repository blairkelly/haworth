console.log("Info.");

var parseSerialData = function (data) {
    var pairs = data.split('&');
    var pieces = null;
    var params = {};

    for(var i = 0; i<pairs.length; i++) {
        pieces = pairs[i].split('=');
        params[pieces[0]] = pieces[1];
    }

    if (params.powerswitchtail) {
        //pst_status = parseInt(params.powerswitchtail);
    }

    if (params.f0) {
        $('.fs-0').text(params.f0);
    }
    if (params.f1) {
        $('.fs-1').text(params.f1);
    }
    if (params.f2) {
        $('.fs-2').text(params.f2);
    }
    if (params.f3) {
        $('.fs-3').text(params.f3);
    }
}