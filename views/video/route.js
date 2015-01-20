var app = module.parent.exports.app;
var io = module.parent.exports.io;

app.get('/video', function (req, res) {
	res.render('video/index.jade');
});