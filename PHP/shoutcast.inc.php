<?php

class Shoutcast
{
   private $pv_host; 
   private $pv_port;
   private $pv_playing;
   private $pv_played;
   private $pv_status;
   private $pv_bitrate;
   private $pv_listeners;
   private $pv_listener_peak;
   private $pv_listener_limit;
   private $pv_err_num;
   private $pv_err_str;
   
   function Shoutcast($host, $port)
   {
      $this->pv_host = $host;
      $this->pv_port = $port;
      
      $this->pv_status = true;   
      
      define ('CONST_RETURN', "\r\n");
      
      ini_set('default_socket_timeout', 5);
      
      $this->process();
   }
   
   function status() { return ($this->pv_status); }
   function playing() { return ($this->pv_playing); }
   function played() { return ($this->pv_played); }
   function bitrate() { return ($this->pv_bitrate); }
   function listeners() { return ($this->pv_listeners); }
   function listener_peak() { return ($this->pv_listener_peak); }
   function listener_limit() { return ($this->pv_listener_limit); }
   
   function request_source($path)
   {
      $handle = @fsockopen($this->pv_host, $this->pv_port, $this->pv_err_num, $this->pv_err_str, 5);
      
      if ($handle)
      {
         fputs($handle, 'GET ' . $path . ' HTTP/1.0' . CONST_RETURN);
         fputs($handle, 'Host: ' . $this->pv_host . CONST_RETURN);
         fputs($handle, 'User-Agent: Mozilla/5.0 (SSDS)' . CONST_RETURN);
         fputs($handle, 'Connection: Close' . CONST_RETURN . CONST_RETURN);
         
         while (!feof($handle))
         {
            $cache = $cache . fgets($handle, 128);
         }
      }
      else
      {
         $this->pv_status = false;
      }
      
      return ($cache);
   }
   
   function process()
   {
      $this->process_index();
      $this->process_played();
   }
   
   function process_index()
   {
      $data = $this->request_source('/');
   
      $status['up'] = 'Server is currently up';
      
      if (strpos($data, 'Server is currently up') === false)
      {
         $this->pv_status = false;     
         
         return (false);
      }
      
      $patterns['status'] = 'Server Status:';
      
      $patterns['playing'] = '%Current Song:.*\<b\>(.*?)\</b\>\</td\>%isU';
      $patterns['bitrate'] = '%Stream Status:.*\<b\>Stream is up at (.*?) kbps with.*\</b\></td\>%isU';
      $patterns['listeners'] = '%Stream Status:.*\<b\>.*\<b\>(.{1,5}?) of.*\</b\>\</b\></td\>%isU';
      $patterns['listener_peak'] = '%Listener Peak:.*\<b\>(.{0,5}?)\</b\></td\>%isU';
      $patterns['listener_limit'] = '%Stream Status:.*\<b\>.*\<b\>.*of (.{1,5}?) listeners.*\</b\>\</b\></td\>%isU';
      
      preg_match($patterns['playing'],$data,$results['playing']);
      preg_match($patterns['bitrate'],$data,$results['bitrate']);
      preg_match($patterns['listeners'],$data,$results['listeners']);
      preg_match($patterns['listener_peak'],$data,$results['listener_peak']);
      preg_match($patterns['listener_limit'],$data,$results['listener_limit']);
      
      $this->pv_playing = $results['playing'][1];
      $this->pv_bitrate = $results['bitrate'][1];
      $this->pv_listeners = $results['listeners'][1];
      $this->pv_listener_peak = $results['listener_peak'][1];
      $this->pv_listener_limit = $results['listener_limit'][1];
   }
   
   function process_played()
   {
      $data = $this->request_source('/played.html');  
         
      $data = stristr($data, '<b>Song Title</b>');
      
      preg_match_all('%\<tr\>\<td\>.{0,8}\</td\>\<td\>([^\<\>]*?)\</tr\>%i',$data,$results);
      
      $this->pv_played = $results[1];
   }
}

?>
