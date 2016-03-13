var http = require('http');
var braintree = require('braintree');
var gateway = braintree.connect({
  environment: braintree.Environment.Sandbox,
  merchantId: "h2kkbky76ns5krnr",//These are our keys
  publicKey: "pqjwz7znrd66tm3q",
  privateKey: "65e51e184dc74a36b720c52701e600ea"
});

// gateway.transaction.sale({  //One transaction
//   amount: '10.00',
//   paymentMethodNonce: nonceFromTheClient,
//   options: {
//     submitForSettlement: true
//   }
// }, function (err, result) {
// });

http.createServer(function(req,res){
  gateway.clientToken.generate({
  }, function (err, response) {
    if (err) {
      throw new Error(err);
    }

    if (response.success) {
      clientToken = response.clientToken
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.write(clientToken); //Use some way to send this to client
      res.end("<p>This is the end</p>");
    } else {
      res.writeHead(500, {'Content-Type': 'text/html'});
      res.end('Something went wrong.');
    }
  });

  braintree.setup(clientToken, "dropin", {
    container: "payment-form"});

  // Parse the request containing file name
  var pathname = url.parse(request.url).pathname;

   // Print the name of the file for which request is made.
  console.log("Request for " + pathname + " received.");

   // Read the requested file content from file system
  fs.readFile(pathname.substr(1), function (err, data) {
    if (err) {
      console.log(err);
      // HTTP Status: 404 : NOT FOUND
      // Content Type: text/plain
      response.writeHead(404, {'Content-Type': 'text/html'});
    }else{
         //Page found
         // HTTP Status: 200 : OK
         // Content Type: text/plain
         response.writeHead(200, {'Content-Type': 'text/html'});

         // Write the content of the file to response body
         response.write(data.toString());
      }
      // Send the response body
      response.end();
   });
   console.log('Setup complete');
}).listen(8989);
