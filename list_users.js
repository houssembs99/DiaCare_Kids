const { MongoClient } = require('mongodb');

async function listUsers() {
    const uri = "mongodb+srv://hbensalahh_db_user:cnHrNLlmoltDIf4l@diacare-kids.cdlzlac.mongodb.net/?appName=DiaCare-Kids";
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db("DiaCareKidsDb");
        const users = await db.collection("User").find({}).toArray();

        console.log("=== LISTE DES UTILISATEURS ===");
        if (users.length === 0) {
            console.log("Aucun utilisateur trouvé.");
        } else {
            users.forEach(u => {
                console.log(`- Nom: ${u.fullName} | Email: ${u.email} | Rôle: ${u.role}`);
            });
        }
    } catch (err) {
        console.error("Erreur:", err);
    } finally {
        await client.close();
    }
}

listUsers();
