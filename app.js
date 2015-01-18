//Haworth Design Offsite

var config = require('./config');

var path = require('path');
var find = require('find');  //was specified for route, but not in registry.
var http = require('http');
var express = require('express');
var cookieParser = require('cookie-parser')
var session = require('express-session')
var io = require('socket.io')();
var fs = require('fs');
var serialcoms = require('./modules/serialcoms');
var moment = require('moment');
var request = require('request');

var app = express();           // start Express framework

var main_middleware = function main_middleware (req, res, next) {
    next();
}

app.set('views', path.join(__dirname + '/views/'));
app.set('view engine', 'jade');
app.enable('trust proxy');
app.use(cookieParser());
app.use(session({ secret: 'jasmine top' }));
app.use(main_middleware);
app.use(express.static(path.join(__dirname + '/public')));


var server = http.createServer(app); // start an HTTP server
var io = require('socket.io')(server);
server.listen(process.env.PORT || 3000);

module.exports = {
    app: app,
    fs: fs,
    io: io,
    config: config,
    serialcoms: serialcoms,
    moment: moment,
    request: request,
};

//routes
require('./routes/general_comms');
require('./routes/style');
find.fileSync('route.js', __dirname + '/views').forEach(function (route_file) {  //-     /\.js$/
    require(route_file);
});

//thoughtbubbles
var thoughtbubble_folder = __dirname + '/public/images/thoughtbubbles/';
find.fileSync(/\.png$/, thoughtbubble_folder).forEach(function (imgfile) {
    config.thoughtbubbles.push(imgfile.substr(thoughtbubble_folder.length, imgfile.length));
});