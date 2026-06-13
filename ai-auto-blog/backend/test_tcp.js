const net = require('net');

const client = new net.Socket();
client.connect(27017, 'ac-h1v7wnr-shard-00-00.ouxm37c.mongodb.net', function() {
    console.log('Connected');
    client.write('Hello, server! Love, Client.');
});

client.on('data', function(data) {
    console.log('Received: ' + data);
    client.destroy(); // kill client after server's response
});

client.on('close', function() {
    console.log('Connection closed');
});

client.on('error', function(err) {
    console.log('Error: ' + err.message);
});
