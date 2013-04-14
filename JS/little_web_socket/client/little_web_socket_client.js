function get_flash_movie(name) {
	if (window.document[name])
		return window.document[name];
	if (navigator.appName.indexOf("Microsoft Internet") < 0 
	&& document.embeds && document.embeds[name]) 
		return document.embeds[name]; 
	return document.getElementById(name);
}

function ajax_post(action, session, data, handler) {
    request = ajax_sys_open();
    handlerFunction = ajax_sys_handler(request, handler);
    request.onreadystatechange = handlerFunction;
    request.open('POST', '/' + action, true);
    request.setRequestHeader('X-Session', session);
    request.setRequestHeader('Content-Length', data.length);
    request.send(data);
}

function ajax_sys_open() {
    if (window.XMLHttpRequest) {
        return new XMLHttpRequest();
    } else if (window.ActiveXObject) {
        try    {
            return new ActiveXObject('Msxml2.XMLHTTP');
        } catch (err)     {
            try {
                return new ActiveXObject('Microsoft.XMLHTTP');
            } catch (err) {
                return false;
            }
        }
    }    
}

function ajax_sys_handler(request, handler) {
    return function () {
        if (request.readyState == 4 && request.status == 200) {
            handler(request.responseText);
        }
    };    
}

(function() {
	
	var lwsc_swf_o = null;
	var next_connection_id = 0;
	var clients = [];
	var callers = [];
	var fallback = false;

	window.LittleWebSocketClient = function() {
		this.id = next_connection_id++;
		clients[this.id] = this;
		this.handlers = [];		
	};
	
	window.LittleWebSocketClient.prototype.connect = function(host, port) {
		// invoke new connection on the flash object
		lwsc_swf_o.newConnection(this.id, host, port);	
	};
	
	window.LittleWebSocketClient.prototype.on = function(name, handler) {
		this.handlers[name] = handler;
	};
	
	window.LittleWebSocketClient.prototype.write = function(data) {
		lwsc_swf_o.write(this.id, data);
	};
	
	window.LittleWebSocketClient.prototype.close = function() {
		lwsc_swf_o.close(this.id);
	};
	
	window.lwsc_on_init = function() {
		lwsc_swf_o = get_flash_movie('lwsc_swf_o');
		if (!lwsc_swf_o) fallback = true;
		if (!('newConnection' in lwsc_swf_o)) fallback = true;
		for (var idx in callers) callers[idx]();
	};
	
	window.lwsc_on_connect = function(id) {
		if (clients[id].handlers['connect'])
			clients[id].handlers['connect']();
	};
	
	window.lwsc_on_data = function(id, data) {
		if (clients[id].handlers['data'])
			clients[id].handlers['data'](data);
	};
	
	window.lwsc_on_error = function(id, data) {
		if (clients[id].handlers['error'])
			clients[id].handlers['error'](data);
	};
	
	window.lwsc_on_close = function(id) {
		if (clients[id].handlers['close'])
			clients[id].handlers['close']();
	};
	
	window.lwsc_on_load = function(callback, force_fallback) {
		if (force_fallback) fallback = true;
		if (lwsc_swf_o != null) return callback();
		if (fallback) return callback();
		callers.push(callback);
	};
	
	(function() {
		
		var container = document.createElement('div');
		container.id = 'swfcontainer';
		document.body.appendChild(container);
		
		var params = {
			allowScriptAccess: 'sameDomain',
			hasPriority: true,
			swliveconnect: true
		};
		
		var attrs = { id: 'lwsc_swf_o' };
		
		swfobject.embedSWF(LWSC_SWF_URL, 'swfcontainer', '1', '1', '10.0.0', 
		false, {}, params, attrs);
		
	})();
	
})();
