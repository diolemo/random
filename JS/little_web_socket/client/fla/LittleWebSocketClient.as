package 
{
	import flash.display.Sprite;
	import flash.external.ExternalInterface;
	import flash.events.*;
	import flash.net.Socket;
	
	public class LittleWebSocketClient extends Sprite
	{		
		private var connections:Array = new Array();
		
		public function LittleWebSocketClient():void {			
			// pass exceptions between flash and browser
			ExternalInterface.marshallExceptions = true;
			// add callbacks exposed to js
			ExternalInterface.addCallback("newConnection", this.newConnection);			
			ExternalInterface.addCallback("close", this.close);
			ExternalInterface.addCallback("write", this.write);
			ExternalInterface.call("lwsc_on_init");
		}
		
		public function newConnection(id:int, host:String, port:int):void {
			var con:Connection = new Connection(id, host, port);
			this.connections[id] = con;
		}
		
		public function close(id:int) {
			this.connections[id].close();
		}
		
		public function write(id:int, data:String) {
			this.connections[id].write(data);
		}
	}

}

