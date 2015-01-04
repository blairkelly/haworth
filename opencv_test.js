var cv = require('opencv');
var fs = require('fs');



//var opencvBuffer = new Buffer(normalBuffer, 'binary');
//opencv.readImage(opencvBuffer, function(err, image){})

console.log("\r\n");
console.log(cv);
console.log("\r\n");

var testFaceDetection = function () {
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
}
//testFaceDetection();

//cv.VideoStream(0, function () {
//    console.log("does this work?");
//});


var watchWebcam = function () {
    var camera = new cv.VideoCapture(0);
    var window = new cv.NamedWindow('Video', 0)

    var do_it = function () {
        camera.read(function(err, im) {
            if (err) throw err;
            window.show(im);
            window.blockingWaitKey(0, 50);

            setTimeout(function () {
                do_it();
            }, 20);
        });
    }
    do_it();
}
//watchWebcam();

var watchWebcamAndDetectFaces = function () {
    var camera = new cv.VideoCapture(0);
    var window = new cv.NamedWindow('Video', 0)

    var do_it = function () {
        camera.read(function(err, im) {
            if (err) throw err;

            im.detectObject(cv.FACE_CASCADE, {}, function (err, faces) {
                //console.log(faces.length);
                for (var i=0;i<faces.length; i++){
                    var x = faces[i]
                    im.ellipse(x.x + x.width/2, x.y + x.height/2, x.width/2, x.height/2);
                }
                
                window.show(im);
                window.blockingWaitKey(0, 50);

                setTimeout(function () {
                    do_it();
                }, 120);
            });
        });
    }
    
    do_it();
}
watchWebcamAndDetectFaces();


var notifyWhenFace = function () {
    var camera = new cv.VideoCapture(0);

    var do_it = function () {
        camera.read(function(err, im) {
            if (err) throw err;

            im.detectObject(cv.FACE_CASCADE, {}, function (err, faces) {
                if (faces.length > 0) {
                    console.log("Faces: " + faces.length);
                } else {
                    console.log("LONELY");
                }

                setTimeout(function () {
                    do_it();
                }, 50);
            });
        });
    }
    
    do_it();
}
//notifyWhenFace();