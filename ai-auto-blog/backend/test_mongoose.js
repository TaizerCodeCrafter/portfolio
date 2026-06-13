const mongoose = require('mongoose');

mongoose.set('debug', true);

async function run() {
  const uri = 'mongodb+srv://supundilshan358_db_user:ZaAoLY6pOTlsPg5D@cluster0.ouxm37c.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0';
  try {
    console.log('URI:', uri);
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('Connected to Mongoose!');
    
    // Just run a dummy command to verify
    await mongoose.connection.db.command({ ping: 1 });
    console.log('Pinged your deployment. You successfully connected to MongoDB!');
  } catch (err) {
    console.error('Mongoose Error:', err);
  } finally {
    await mongoose.disconnect();
  }
}
run();
