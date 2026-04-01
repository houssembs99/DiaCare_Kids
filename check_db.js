
const { MongoClient } = require('mongodb');

async function main() {
    const client = new MongoClient("mongodb://localhost:27017");
    await client.connect();
    const db = client.db("DiaCareKids");
    const users = db.collection("Users");

    const allUsers = await users.find({}).toArray();
    console.log("Total Users:", allUsers.length);

    const clinics = allUsers.filter(u => u.Role === "Clinique");
    console.log("\nClinics found:");
    clinics.forEach(c => {
        const associated = allUsers.filter(u => u.AssociatedClinicId === c._id.toString());
        console.log(`- ${c.FullName} (${c._id.toString()}): ${associated.length} users associated`);
        associated.forEach(u => {
            console.log(`  * ${u.FullName} (${u.Role})`);
        });
    });

    const orphanParents = allUsers.filter(u => u.Role === "Parent" && !u.AssociatedClinicId);
    if (orphanParents.length > 0) {
        console.log("\nParents with NO clinic associated:");
        orphanParents.forEach(p => console.log(`- ${p.FullName}`));
    }

    await client.close();
}

main();
