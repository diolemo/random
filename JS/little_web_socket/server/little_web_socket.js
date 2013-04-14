var fs   = require('fs');
var net  = require('net');
var util = require('util');

function LittleWebSocket(ex_handler, ex_options) {

    var FLASH_SEC_XML_RESP = null;
    var FLASH_SEC_XML_STR = '<policy-file-request/>';
    var REQUEST_RESPONSE = '<request-response/>';

    function load_flash_xml_resp() {
		// load the flash security policy file from disk
        fs.readFile('flash_sec.xml', 'utf-8', function(err, data) {
            // cache the result for future 
            FLASH_SEC_XML_RESP = data;
        });
    }

    function connection_listener(clientSocket) {

        var real_client = false;

        clientSocket.setEncoding('utf-8');
        
        var ex_interface = new Object();
        var data_buffer = [];
        
        // allow event binding
        ex_interface.handlers = {};
        ex_interface.on = function(name, handler) {
            this.handlers[name] = handler;
        }
        
        // allow pass through of write (no end char)
        ex_interface.write_raw = function(data, encoding, callback) {
            // write exception is now handled within lws
            try { clientSocket.write(data, encoding, callback); }
            catch (io_err) { }
        }
        
        // allow pass through of write (with end char)
        ex_interface.write = function(data, encoding, callback) {
            ex_interface.write_raw(data + '\3', encoding, callback);
        }

        // allow pass through of close
        ex_interface.close = function() {
            clientSocket.end();
            clientSocket.destroy();
        }
        
        // other useful properties
        ex_interface.remoteAddress = clientSocket.remoteAddress;
        
        // obtain the event binds 
        ex_handler(ex_interface);

        clientSocket.on('data', function(data) {

            // handle a simple request response test
            if (!real_client && data.indexOf(REQUEST_RESPONSE) == 0) {
                ex_interface.write(REQUEST_RESPONSE);
                ex_interface.close();
                return;
            }

            // handle the flash security request
            // assume that the str is at the start of request
            if (!real_client && data.indexOf(FLASH_SEC_XML_STR) == 0) {
                ex_interface.write_raw(FLASH_SEC_XML_RESP);
                ex_interface.close();
                return;
            }

            // assume real now
            real_client = true;

            // handle standard requests
            if (ex_interface.handlers['data']) {

                // include previous parts?
                if (data_buffer.length > 0) {
                    data_buffer.push(data);
                    data = data_buffer.join('');
                }
                
                // clear data buffer
                data_buffer = [];

                // force limit the length
                if (data.length > options['max_length']) {
                    return;
                }

                // test for end of text character
                while ((loc = data.indexOf('\3')) >= 0) {
                    // load up to the end of text chr
                    var ex_data = data.substring(0, loc);
                    // ignore 0 length
                    if (ex_data.length > 0)
                      ex_interface.handlers['data'](ex_data);
                    // remaining data
                    data = data.substring(loc+1);
                }
                
                // add back into buffer
                if (data.length > 0) {
                    data_buffer.push(data);
                }
                
            }    
        });

        clientSocket.on('connect', function() {
            if (ex_interface.handlers['connect']) {
                ex_interface.handlers['connect']();
            }
        });
        
        clientSocket.on('timeout', function() {
            // force close the socket
            clientSocket.destroy();
        });
        
        clientSocket.on('end', function() {
            // force close the socket
            clientSocket.destroy();
        });

        // when the socket is finally closed
        clientSocket.on('close', function() {
            if (ex_interface.handlers['close']) {
                ex_interface.handlers['close']();
            }
        });

        // this might not catch timeout        
        clientSocket.on('error', function(ex) {
            if (ex_interface.handlers['error']) {
                ex_interface.handlers['error'](ex);
            }
        });

        // socket will timeout after 30 seconds
        clientSocket.setTimeout(30000);
        clientSocket.setNoDelay(true);
        
    }

    options = {
        'connections': 1024,
   		'gc_interval': 300,
        'listen_host': '0.0.0.0',
        'listen_port': 1337,
        'max_length': 50000,
    };

    if (ex_options) {
        for (idx in ex_options) {
            options[idx] = ex_options[idx];
        }
    }

    load_flash_xml_resp();

    var server = net.createServer(connection_listener);
    server.connections = options['connections'];
    server.listen(options['listen_port'], options['listen_host']);

	if (options['gc_interval'] > 0) {
        // convert the interval from seconds to ms
        var interval = options['gc_interval'] * 1000;
        // set the collection to run every interval
		setInterval(require('gc').force, interval);
	}

}

exports.createServer = LittleWebSocket;
