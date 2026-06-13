require('dotenv').config();
const mongoose = require('mongoose');

const uri2 = "mongodb://supundilshan358_db_user:ZaAoLY6pOTlsPg5D@ac-h1v7wnr-shard-00-00.ouxm37c.mongodb.net:27017,ac-h1v7wnr-shard-00-01.ouxm37c.mongodb.net:27017,ac-h1v7wnr-shard-00-02.ouxm37c.mongodb.net:27017/my-portfolio-blog?ssl=true&replicaSet=atlas-h1v7wnr-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0";

async function test() {
  try {
    console.log("Trying uri2 with family: 4...");
    await mongoose.connect(uri2, { family: 4, serverSelectionTimeoutMS: 5000 });
    console.log("Success with uri2");
    process.exit(0);
  } catch (err) {
    console.error("Failed uri2:", err.message);
    process.exit(1);
  }
}

test();
