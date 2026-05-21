const axios = require('axios');

async function testRegistration() {
    try {
        const clinicsRes = await axios.get('http://localhost:5246/api/clinics');
        const clinics = clinicsRes.data;
        const clinicId = clinics.length > 0 ? clinics[0].id : null;
        console.log(`Using clinic ${clinicId}`);

        const payload = {
            email: `parent_test_${Date.now()}@gmail.com`,
            password: 'Password123!',
            fullName: 'Test Parent',
            role: 'Parent',
            subscriptionPlan: clinicId ? 'Sous Clinique' : 'Solo',
            maxKids: 1,
            associatedClinicId: clinicId,
            clinicPackageId: "",
            clinicType: "Clinique",
            address: "Test",
            contactNumber: "123",
            maxDoctors: 2,
            maxPatients: 50
        };

        const res = await axios.post('http://localhost:5246/api/auth/register', payload);
        console.log('Registration success', res.data);
    } catch (err) {
        console.error('Error:', err.response?.status, err.response?.data);
    }
}

testRegistration();
