var lws = require('./little_web_socket.js');
var sys = require('sys');

var options = {
	'connections': 1024,             // concurrent connection max
	'listen_host': '0.0.0.0',        // optional (default 0.0.0.0)
	'listen_port': 1337,             // required (ideally greater than 1024)
	'max_length': 2000               // max message length to prevent abuse
}

lws.createServer(function(client) {
	
	client.on('connect', function() {
		sys.puts('connect: ' + client.remoteAddress);
	})
	
	client.on('data', function(data) {
		sys.puts('data: ' + data);
		client.write(data);
	});
	
	client.on('error', function(ex) {
		sys.puts('error: ' + ex);
	});
	
	client.on('close', function(ex) {
		sys.puts('close');
	});

}, options);
