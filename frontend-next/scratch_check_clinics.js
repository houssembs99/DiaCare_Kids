const axios = require('axios');

async function checkClinics() {
    try {
        const res = await axios.get('http://localhost:5246/api/clinics');
        const clinics = res.data;
        console.log(`Returned clinics: ${clinics.length}`);
        clinics.forEach(c => {
            console.log(`- ${c.id}: status=${c.status}, hasSub=${!!c.subscription}, subActive=${c.subscription?.isActive}, email=${c.email}`);
        });
    } catch (err) {
        console.error('Error fetching clinics:', err.message);
    }
}
checkClinics();
