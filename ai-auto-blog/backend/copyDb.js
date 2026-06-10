const mongoose = require('mongoose');

const sourceUri = "mongodb://supundilshan358_db_user:ZaAoLY6pOTlsPg5D@ac-h1v7wnr-shard-00-00.ouxm37c.mongodb.net:27017,ac-h1v7wnr-shard-00-01.ouxm37c.mongodb.net:27017,ac-h1v7wnr-shard-00-02.ouxm37c.mongodb.net:27017/test?ssl=true&replicaSet=atlas-xaj0ke-shard-0&authSource=admin&appName=Cluster0";
const targetUri = "mongodb://supundilshan358_db_user:ZaAoLY6pOTlsPg5D@ac-h1v7wnr-shard-00-00.ouxm37c.mongodb.net:27017,ac-h1v7wnr-shard-00-01.ouxm37c.mongodb.net:27017,ac-h1v7wnr-shard-00-02.ouxm37c.mongodb.net:27017/my-portfolio-blog?ssl=true&replicaSet=atlas-xaj0ke-shard-0&authSource=admin&appName=Cluster0";

async function copyDatabase() {
  try {
    console.log("Connecting to source database...");
    const sourceDb = await mongoose.createConnection(sourceUri).asPromise();
    
    console.log("Connecting to target database...");
    const targetDb = await mongoose.createConnection(targetUri).asPromise();
    
    const collections = await sourceDb.db.listCollections().toArray();
    
    for (let col of collections) {
      const colName = col.name;
      console.log(`Copying collection: ${colName}...`);
      
      const docs = await sourceDb.db.collection(colName).find({}).toArray();
      if (docs.length > 0) {
        // Insert docs into target
        await targetDb.db.collection(colName).insertMany(docs);
        console.log(`Copied ${docs.length} documents for ${colName}`);
      } else {
        console.log(`No documents found in ${colName}`);
      }
    }
    
    console.log("Database copy completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Error copying database:", err);
    process.exit(1);
  }
}

copyDatabase();
