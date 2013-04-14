package 
{
	import flash.display.Sprite;
	import flash.external.ExternalInterface;
	import flash.events.*;
	import flash.net.Socket;
	
	public class Connection
	{
		private var buffer:String = "";
		
		private var port:int = 0;
		private var host:String = "";
		private var id:int;
		
		private var socket:Socket;
		
		public function Connection(id:int, host:String, port:int):void {
			this.id = id;
			this.host = host;
			this.port = port;
			this.socket = new Socket();
			// add the event listeners 
			this.socket.addEventListener(Event.CONNECT, this.onConnect);
			this.socket.addEventListener(Event.CLOSE, this.onClose);
			this.socket.addEventListener(IOErrorEvent.IO_ERROR, this.onError);
			this.socket.addEventListener(ProgressEvent.SOCKET_DATA, this.onData);
			this.socket.addEventListener(SecurityErrorEvent.SECURITY_ERROR, this.onSecError);
			// connect the socket
			this.socket.connect(host, port);
		}
		
		public function getId():int {
			return this.id;
		}
		
		public function close():void {
			this.socket.close();
		}
		
		public function write(data:String):void {
			this.socket.writeUTFBytes(data + String.fromCharCode(3));
			this.socket.flush();
		}
		
		private function onConnect(event:Event):void {
			ExternalInterface.call("lwsc_on_connect", this.id);
			
		}
		
		private function onError(event:IOErrorEvent):void {
			ExternalInterface.call("lwsc_on_error", this.id, event.text);
			if (this.socket.connected) { this.socket.close(); }
		}
		
		private function onSecError(event:SecurityErrorEvent):void {
			ExternalInterface.call("lwsc_on_error", this.id, event.text);
			if (this.socket.connected) { this.socket.close(); }
		}
		
		private function onClose(event:Event):void {
			ExternalInterface.call("lwsc_on_close", this.id);
			if (this.socket.connected) { this.socket.close(); }
		}
		
		private function onData(event:ProgressEvent):void {
			var loc:int = -1;
			if (this.socket.bytesAvailable > 0) 
				this.buffer += this.socket.readUTFBytes(this.socket.bytesAvailable);
			while ((loc = this.buffer.indexOf(String.fromCharCode(3))) >= 0) {
				var ex_data:String = this.buffer.substring(0, loc);
				ExternalInterface.call("lwsc_on_data", this.id, ex_data);
				this.buffer = this.buffer.substring(loc+1);
			}
		}
		
	}	
}
