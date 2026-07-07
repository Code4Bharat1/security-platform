const http = require('http');
const dns = require('dns');

console.log('=== NETWORK DIAGNOSTICS ===');
console.log('Node version:', process.version);

// Test if MongoDB DNS resolves
dns.resolve('cluster0.fvwn9fm.mongodb.net', (err, addresses) => {
  if (err) {
    console.error('❌ MongoDB Host DNS Resolution Failed:', err.message);
  } else {
    console.log('✅ MongoDB Host DNS Resolved to:', addresses);
  }
});

// Check if port 5000 is open
const req = http.request({
  host: '127.0.0.1',
  port: 5000,
  path: '/api/password/analyze',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
}, (res) => {
  console.log(`✅ Port 5000 is listening. Status: ${res.statusCode}`);
});

req.on('error', (err) => {
  console.error('❌ Failed to connect to port 5000:', err.message);
});

req.write(JSON.stringify({ password: 'test' }));
req.end();
