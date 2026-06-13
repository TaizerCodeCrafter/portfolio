const { MongoClient } = require('mongodb');
require('dotenv').config({ path: 'c:\\Users\\user\\OneDrive\\Desktop\\portfolio\\ai-auto-blog\\backend\\.env' });

const uri = process.env.MONGODB_URI;

async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log("Connected correctly to server");
    const db = client.db('test');
    const settings = await db.collection('settings').findOne({ key: 'aiConfig' });
    console.log("Settings from DB:", settings);
  } catch (err) {
    console.log("Error:", err.stack);
  } finally {
    await client.close();
  }
}

run().catch(console.dir);
