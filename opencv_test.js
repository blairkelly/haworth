var cv = require('opencv');
var fs = require('fs');

console.log("\r\n");

//var opencvBuffer = new Buffer(normalBuffer, 'binary');
//opencv.readImage(opencvBuffer, function(err, image){})

cv.readImage("./test_in.jpg", function (err, im) {
    
    im.detectObject(cv.FACE_CASCADE, {}, function (err, faces) {
        for (var i=0;i<faces.length; i++){
            var x = faces[i]
            im.ellipse(x.x + x.width/2, x.y + x.height/2, x.width/2, x.height/2);
        }
        im.save('test_out.jpg');
    });
    console.log('sucessfully read.');

    //console.log("\r\n\r\n");
    //console.log(cv);
    //console.log("\r\n\r\n");
});