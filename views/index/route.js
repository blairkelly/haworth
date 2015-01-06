var app = module.parent.exports.app;
var io = module.parent.exports.io;

app.get('/', function (req, res) {
	res.render('index/index.jade');
});