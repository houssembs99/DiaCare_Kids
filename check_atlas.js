const { MongoClient } = require('mongodb');

async function listCollections() {
    const uri = "mongodb+srv://hbensalahh_db_user:cnHrNLlmoltDIf4l@diacare-kids.cdlzlac.mongodb.net/?appName=DiaCare-Kids";
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db("DiaCareKidsDb");
        const collections = await db.listCollections().toArray();
        console.log("Collections dans DiaCareKidsDb:");
        collections.forEach(c => console.log("- " + c.name));
        
        const users = await db.collection("Users").find({}).toArray();
        console.log("\nUtilisateurs dans 'Users':", users.length);
        users.forEach(u => console.log(JSON.stringify(u)));

    } catch (err) {
        console.error("Erreur:", err);
    } finally {
        await client.close();
    }
}

listCollections();
