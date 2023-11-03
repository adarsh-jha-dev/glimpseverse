const mongoose = require('mongoose');

const mongoURI = "mongodb://localhost:27017/GlimpseVerse";

const connectToMongo = async () => {
    await mongoose.connect(mongoURI, {
        useNewUrlParser : true,
        useUnifiedTopology : true,
        family : 4,
    })
    .then(() => {
        console.log(`Connected to Mongo successfully`);
    })
    .catch((e) => {
        console.log(e);
    });
}

module.exports = connectToMongo;
