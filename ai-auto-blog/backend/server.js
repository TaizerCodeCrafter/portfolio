console.log("----------------------------");
console.log("SERVER IS TRYING TO START...");
console.log("----------------------------");

const express = require('express');
const app = express();

app.get('/', (req, res) => res.send("Hello World"));

app.listen(5001, () => {
    console.log("STARTED SUCCESSFULLY ON PORT 5001");
});
