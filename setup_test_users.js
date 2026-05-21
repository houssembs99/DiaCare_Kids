const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

async function createTests() {
    const uri = "mongodb+srv://hbensalahh_db_user:cnHrNLlmoltDIf4l@diacare-kids.cdlzlac.mongodb.net/?appName=DiaCare-Kids";
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db("DiaCareKidsDb");
        const users = db.collection("Users");

        await users.deleteMany({ Email: { $in: ["ahmed@gmail.com", "medmed@gmail.com"] } });

        const passAhmed = await bcrypt.hash("ahmed2020", 10);
        const passMed = await bcrypt.hash("med12345", 10);

        await users.insertMany([
            { Email: "ahmed@gmail.com", PasswordHash: passAhmed, FullName: "Ahmed Parent", Role: "Parent", Status: "Actif", CreatedAt: new Date() },
            { Email: "medmed@gmail.com", PasswordHash: passMed, FullName: "Dr. Med Med", Role: "Medecin", Status: "Actif", CreatedAt: new Date() }
        ]);

        console.log("Utilisateurs créés !");
    } finally {
        await client.close();
    }
}

createTests();
