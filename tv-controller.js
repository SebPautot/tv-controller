const express = require('express');
const proxy = require("express-http-proxy");
const app = express();

app.use(express.static('public'));

// listen for requests :)
const listener = app.listen("3003", function() {
    console.log('Your app is listening on port ' + listener.address().port);
});


//CORS Anywhere to communicate correctly with decoder

// Listen on a specific host via the HOST environment variable
// var host = "192.168.1.18";
// Listen on a specific port via the PORT environment variable
var port = "3004";

var cors_proxy = require('cors-anywhere');

cors_proxy.createServer({
    // requireHeader: ['origin', 'x-requested-with'],
    redirectSameOrigin: true,
    removeHeaders: ['cookie', 'cookie2', 'origin','cache-control']
}).listen(port, function() {
    console.log('Running CORS Anywhere on port '+ port);
});