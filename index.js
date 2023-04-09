var http = require('http');
var hostname = '127.0.0.1';
var port = 8080;

const server = http.createServer(function(req,res){
    const path = req.url;
    const method = req.method;
    
});

server.listen(port, hostname);
 
console.log('server on');