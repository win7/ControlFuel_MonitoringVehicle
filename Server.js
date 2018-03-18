/* framework NODEJS */
var server_io = require('http').createServer(handler),
    io = require('socket.io').listen(server_io),
    fs = require('fs');

var firebase = require("firebase");

var PORT_IO = 3000;

/* Server IO */
server_io.listen(PORT_IO, function () {
    console.log("Server IO listening at port %d", PORT_IO);
});

io.sockets.on('connection', function(socket) {
    var address = socket.handshake.address;
    console.log("Connect IO %s %d",  address.address, address.port);
    try {
        socket_net.write("R\n");
    }
    catch(err) {
        console.log("Arduino is disconnect");
    }
    socket.on('update range', function(max, min) {
        console.log("update range");
        socket_net.write("r," + max + "," + min + "\n");
    });
    socket.on('disconnect', function() {
        console.log("Disconnect IO");
    });
});

function handler(req, res) {
    fs.readFile(__dirname+'/monitoring.html', function(err, data) {
        if (err) {
            console.log(err);
            res.writeHead(500);
            return res.end('Error loading index.html');
        }
        res.writeHead(200);
        res.end(data);
    });
}

/* Fire Base */
/* Here config your firebase*/
var config = {
    apiKey: "AIzaSyB7bq3kB_Hn0nZ5YBj1n44NSGpXNNHlhDw",
    authDomain: "basesensorcombustible.firebaseapp.com",
    databaseURL: "https://basesensorcombustible.firebaseio.com",
    projectId: "basesensorcombustible",
    storageBucket: "basesensorcombustible.appspot.com",
    messagingSenderId: "671666726369"
};
var server_firebase = firebase.initializeApp(config);
var db = server_firebase.database();
var ref = db.ref("ServidorWeb_GPS");
/* This event update when exist any change in db firebase*/
/* firese return:
{ GPSLatitud: '-13.52101723',
  GPSLongitud: '-71.96225735',
  GPSVelocidad: '0',
  Nivel: '0' }
*/
ref.on("value", function(snapshot) {
    var data = snapshot.val();
    console.log(data);
    io.sockets.emit('data update', data);
}, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
});