const express = require('express');
const connectToMongo = require('./db');

connectToMongo();

const app = express();
const port = process.env.PORT || 5000; // Use the provided PORT or 5000 as the default

app.use(express.json());

app.use('/api/auth',  require('./routes/auth')); 
app.use('/api/post', require('./routes/post')); 

app.listen(port, () => {
    console.log(`Backend is listening at port ${port}`);
});
