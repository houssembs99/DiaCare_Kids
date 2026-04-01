const axios = require('axios');

async function testLogin() {
    try {
        const res = await axios.post('http://localhost:5246/api/auth/login', {
            email: 'test_child@example.com',
            password: 'password123'
        });
        console.log('Success:', res.data);
    } catch (err) {
        console.log('Error Status:', err.response?.status);
        console.log('Error Data:', JSON.stringify(err.response?.data, null, 2));
    }
}

testLogin();
