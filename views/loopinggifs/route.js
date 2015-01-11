var app = module.parent.exports.app;
var io = module.parent.exports.io;

app.get('/loopinggifs', function (req, res) {
	res.render('loopinggifs/index.jade');
});