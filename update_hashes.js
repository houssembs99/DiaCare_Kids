const { MongoClient } = require('mongodb'); 
async function run() { 
  const client = new MongoClient('mongodb+srv://hbensalahh_db_user:cnHrNLlmoltDIf4l@diacare-kids.cdlzlac.mongodb.net/?appName=DiaCare-Kids'); 
  await client.connect(); 
  const db = client.db('DiaCareKidsDb'); 
  const users = await db.collection('Users').find({}).toArray(); 
  let updated = 0; 
  for(let u of users) { 
    if(u.PasswordHash && u.PasswordHash.startsWith('$2b$')) { 
      const newHash = '$2a$' + u.PasswordHash.substring(4); 
      await db.collection('Users').updateOne({_id: u._id}, {$set: {PasswordHash: newHash}}); 
      updated++; 
    } 
  } 
  console.log('Updated ' + updated + ' hashes from $2b$ to $2a$'); 
  await client.close(); 
} 
run();
