var http = require('http');

// Options to be used by request
var options = {
   port: '8989',
   path: '/bababa.html'
};

// Callback function is used to deal with response
// Make a request to the server
console.log('Setup complete');
var req = http.request(options, function(response) {
  console.log('Hi');
   // Continuously update stream with data
   var body = '';

   response.on('data', function(data) {
      body += data;
   });
   response.on('end', function() {
      // Data received completely.
      console.log(body);
   });
});
req.end();
