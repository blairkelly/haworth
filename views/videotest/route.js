var app = module.parent.exports.app;
var io = module.parent.exports.io;

app.get('/videotest', function (req, res) {
	res.render('videotest/index.jade');
});