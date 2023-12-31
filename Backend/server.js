const express = require("express");
const connectToMongo = require("./db");
const cors = require('cors');
const bodyParser = require('body-parser');

connectToMongo();

const app = express();
const port = process.env.PORT || 5000; // Use the provided PORT or 5000 as the default

app.use(cors());
app.use(bodyParser.urlencoded({extended : true}));

app.use("/api/auth", require("./Routes/auth"));
app.use("/api/post", require("./Routes/post"));
app.use("/api/comment", require("./Routes/comment"));

app.listen(port, () => {
  console.log(`Backend is listening at port ${port}`);
});
