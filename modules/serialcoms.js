var config = require('../config');
var serialcoms = {};

console.log("Serial address: " + config.serialaddress);

var serialport = require("serialport"),     // include the serialport library
    SerialPort = serialport.SerialPort,      // make a local instance of serial
    serialData = {};                    // object to hold what goes out to the client

serialcoms.new_serialport = function () {
    return new SerialPort(config.serialaddress, { 
        baudrate: 57600,
        // look for return and newline at the end of each data packet:
        parser: serialport.parsers.readline("\r\n") 
    }, function (error) {
        if (error) {
            console.log("Error opening serialport!", error);
        }
        console.log("Switching to testing mode...");
    });
}

console.log("Opening serialport...");
serialcoms.connectedport = serialcoms.new_serialport();

//needed to export
module.exports = serialcoms;