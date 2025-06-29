const axios = require('axios');

async function testLogin() {
    try {
        const response = await axios.post('http://localhost:4002/auth/login', {
            email: 'admin@shopease.com',
            mot_passe: 'admin123'
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Login successful!');
        console.log('Response:', response.data);
    } catch (error) {
        console.error('❌ Login failed:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }
}

testLogin(); 