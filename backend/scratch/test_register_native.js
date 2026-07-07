const http = require('http');

const testRegister = () => {
    const data = JSON.stringify({
        name: 'Test Final',
        email: 'test' + Date.now() + '@example.com',
        password: 'password123',
        phoneNumber: '1234567890',
        pincode: '380001',
        village: 'Ahmedabad',
        address: 'Main Street'
    });

    const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/register',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    };

    const req = http.request(options, (res) => {
        let responseBody = '';
        res.on('data', (chunk) => {
            responseBody += chunk;
        });

        res.on('end', () => {
            console.log('Status:', res.statusCode);
            console.log('Body:', responseBody);
            if (res.statusCode === 201) {
                console.log('SUCCESS: Registration works now!');
            } else {
                console.log('FAILED: Registration still failing.');
            }
        });
    });

    req.on('error', (error) => {
        console.error('Request Error:', error);
    });

    req.write(data);
    req.end();
};

testRegister();
