const mongoose = require('mongoose');

const uri1 = 'mongodb://supundilshan358_db_user:ZaAoLY6pOTlsPg5D@ac-h1v7wnr-shard-00-00.ouxm37c.mongodb.net:27017,ac-h1v7wnr-shard-00-01.ouxm37c.mongodb.net:27017,ac-h1v7wnr-shard-00-02.ouxm37c.mongodb.net:27017/test?ssl=true&replicaSet=atlas-xaj0ke-shard-0&authSource=admin&appName=Cluster0';
const uri2 = 'mongodb://supundilshan358_db_user:ZaAoLY6pOTlsPg5D@ac-h1v7wnr-shard-00-00.ouxm37c.mongodb.net:27017,ac-h1v7wnr-shard-00-01.ouxm37c.mongodb.net:27017,ac-h1v7wnr-shard-00-02.ouxm37c.mongodb.net:27017/my-portfolio-blog?ssl=true&replicaSet=atlas-xaj0ke-shard-0&authSource=admin&appName=Cluster0';

async function checkDb(uri, name) {
  try {
    const conn = await mongoose.createConnection(uri).asPromise();
    const count = await conn.db.collection('settings').countDocuments();
    const blogs = await conn.db.collection('blogposts').countDocuments();
    const projects = await conn.db.collection('projects').countDocuments();
    console.log(`[${name}] settings: ${count}, blogposts: ${blogs}, projects: ${projects}`);
    await conn.close();
  } catch (err) {
    console.error(`[${name}] Error:`, err.message);
  }
}

async function run() {
  await checkDb(uri1, 'test');
  await checkDb(uri2, 'my-portfolio-blog');
}
run();
