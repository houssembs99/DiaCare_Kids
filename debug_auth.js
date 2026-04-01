const axios = require('axios');

async function debugAuth() {
    const email = 'debug_' + Math.random().toString(36).substring(7) + '@example.com';
    const password = 'password123';

    console.log('--- 1. Testing Registration ---');
    try {
        const regRes = await axios.post('http://localhost:5246/api/auth/register', {
            email,
            password,
            fullName: 'Debug User',
            role: 'Enfant'
        });
        console.log('Registration Success:', regRes.data);
    } catch (err) {
        console.log('Registration Error:', err.response?.status, err.response?.data);
    }

    console.log('\n--- 2. Testing Login ---');
    let token = '';
    try {
        const loginRes = await axios.post('http://localhost:5246/api/auth/login', {
            email,
            password
        });
        token = loginRes.data.token;
        console.log('Login Success! Token received.');
    } catch (err) {
        console.log('Login Error:', err.response?.status, err.response?.data);
        return;
    }

    console.log('\n--- 3. Testing Protected Route (Patients) ---');
    try {
        const protectedRes = await axios.get('http://localhost:5246/api/patients', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Protected Route Success:', protectedRes.status);
    } catch (err) {
        console.log('Protected Route Error:', err.response?.status, err.response?.data);
    }
}

debugAuth();
