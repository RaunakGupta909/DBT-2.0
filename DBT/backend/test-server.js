const http = require('http');

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Server is working!' }));
});

server.listen(4000, () => {
    console.log('Test server running on port 4000');
});
