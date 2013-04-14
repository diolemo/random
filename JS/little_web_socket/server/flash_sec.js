var net = require('net');
var fs = require('fs');

function sec_connectionListener(clientSocket) {
	clientSocket.on('data', function() {
		fs.readFile('flash_sec.xml', function(err, data) {
			if (err) throw err;
			clientSocket.write(data);
			clientSocket.end();
			clientSocket.destroy();
		});				
	});
}

var sec_server = net.createServer(sec_connectionListener);
sec_server.listen(843, '0.0.0.0');


