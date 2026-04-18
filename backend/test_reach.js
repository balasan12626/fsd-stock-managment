const http = require('http');
http.get('http://localhost:5000/api/customer/products', (res) => {
    console.log('Status Code:', res.statusCode);
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => console.log('Data:', data));
}).on('error', (e) => {
    console.log('Error:', e.message);
});
