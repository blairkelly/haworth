var app = module.parent.exports.app;
var io = module.parent.exports.io;

app.get('/tests', function (req, res) {
    res.render('tests/tests.jade');
});