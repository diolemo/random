<?php 

class swear_filter 
{
   private $words;
   
   private $like = array(
      array('0', 'o'),
      array('1', 'l'),
      array('!', 'l'),
      array('i', 'l'),
      array('3', 'e'),
      array('5', 's'),
      array('+', 't'),
      array('£', 'e'),
      array('$', 's'),
      array('#', 'h'),
      array('@', 'a'),
   );
   
   public function __construct($filename) 
   {
      $like_old = $this->like;
      $this->like = array(array(), array());
      
      // restructure array for str_replace
      foreach ($like_old as $li)
      {
         $this->like[0][] = $li[0];
         $this->like[1][] = $li[1];
      }
      
      $raw_words = file_get_contents($filename);
      $this->words = explode(chr(10), $raw_words);
      
      // clean up the words 
      foreach ($this->words as $k => $word)
      {
         // clean whitespace at start/end
         $this->words[$k] = trim($this->words[$k]);
         
         if (strlen($this->words[$k]) == 0)
         {
            unset($this->words[$k]);  
            continue;
         }

         $allow_whitespace = true;

         // words starting with @ allow spaces
         if ($this->words[$k][0] == '@')
         {
            $this->words[$k] = substr($this->words[$k], 1);
            $allow_whitespace = false;
         }
         
         $this->words[$k] = strtolower($this->words[$k]);
         
         // convert to simple alphabet using likes (0 looks like o) etc
         $this->words[$k] = str_replace($this->like[0], $this->like[1], $this->words[$k]);
         // remove any character not letter and make a space
         $this->words[$k] = preg_replace('#[^a-z~\?]#is', ' ', $this->words[$k]);
         
         $c_arr = str_split($this->words[$k], 1);
         
         // allow any number of repeated characters
         foreach ($c_arr as $i => $v) 
         {
            if ($v == '~') continue;
            if ($v == '?') continue;
            
            // allow 1 or more repeated characters
            $c_arr[$i] = sprintf('%s+', $v);
         }
         
         if ($allow_whitespace)
         {
            // 0 or more non letters between each letter
            $this->words[$k] = implode('\\s*', $c_arr);
         }
         
         // fix the cases where we can allow 0 of a character
         $this->words[$k] = str_replace('+\\s*?', '*', $this->words[$k]);
         
         // convert instances of ~ to allow additional letters
         $this->words[$k] = preg_replace('#(\\\\s\*)?~(\\\\s\*)?#is', '[a-z]*', $this->words[$k]);
      }
   }
   
   public function clean($text)
   {
      $clean = strtolower($text);
      // convert similar looking characters to standard
      $clean = str_replace($this->like[0], $this->like[1], $clean);
      // convert any non letters to spaces
      $clean = preg_replace('#[^a-z]#is', ' ', $clean);
      
      foreach ($this->words as $word)
      {         
         // words must be surrounded by white space 
         // or be at the start/end of the text
         $pattern = sprintf('#(\\s|^)(%s)(\\s|$)#', $word);
         $res = preg_match($pattern, $clean, $match, PREG_OFFSET_CAPTURE);
         
         // continue on no match
         if ($res == 0) continue;
         
         $len = strlen($match[2][0]);
         $censor = str_repeat('-', $len);
         
         // replace the bad word with dashes
         $text = substr_replace($text, $censor, $match[2][1], $len);
      }
      
      return $text;
   }
}

?>
