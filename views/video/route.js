var app = module.parent.exports.app;
var io = module.parent.exports.io;

app.get('/video', function (req, res) {
    res.render('video/index.jade');
});
app.get('/video1', function (req, res) {
	res.render('video/index1.jade');
});
app.get('/video2', function (req, res) {
    res.render('video/index2.jade');
});