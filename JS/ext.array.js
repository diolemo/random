(function(undefined) {
   
   Array.prototype.is_arr = true;
   
   // reset the array to have 0 elements
   Array.prototype.clear = function() {
      
      this.length = 0;
      return this;
      
   };
   
   // convert the array to a string using nice format
   Array.prototype.toString = function(start, end, no_bars) {
      
      var str_build = [];
      
      if (start === undefined) start = 0;
      if (end === undefined) end = this.length;
      if (end <= 0) end = this.length - end;
      
      for (var i = start; i < end; i++) 
         str_build.push(this[i].toString());
      
      return (no_bars ? str_build.join(', ') : 
         '[' + str_build.join(', ') + ']');
      
   };
   
   // push every element from an array to this
   Array.prototype.push_all = function(arr) {
      
      for (var i = 0; i < arr.length; i++) {
         this.push(arr[i]);
      }
      
      return this;
       
   };
   
   // push every element from an array to this
   Array.prototype.unshift_all = function(arr) {
      
      for (var i = arr.length - 1; i >= 0; i--) {
         this.unshift(arr[i]);
      }
      
      return this;
       
   };
   
   // check whether an item exists in the array
   Array.prototype.contains = function(item) {
      
      return (this.indexOf(item) !== -1);
      
   };
   
   // remove element from array
   Array.prototype.remove = function(element) {
     
      var index = this.indexOf(element);
      if (index === -1) return;
      
      this.splice(index, 1);
      
      return this;
      
   };
   
   // remove element from array
   Array.prototype.remove_all = function(elements) {
     
      for (var i = 0; i < elements.length; i++)
         this.remove(elements[i]);
      
      return this;
      
   };
   
})();