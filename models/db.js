// const mongoose = require('mongoose');
//   require("dotenv").config();
// const mongoURI = process.env.MONGO_URI;

// mongoose.connect(mongoURI)
//     .then(() => console.log('MongoDB connected successfully'))
//     .catch(err => console.log('MongoDB connection error:', err));

// module.exports = mongoose;


const mongoose = require("mongoose");
require("dotenv").config();
require("./User");


const mongoURI = process.env.MONGO_URI;

console.log("Mongo URI from env:", mongoURI ? "FOUND" : "NOT FOUND");

if (!mongoURI) {
  console.error("❌ MONGO_URI missing. Check .env location");
  process.exit(1);
}

mongoose
  .connect(mongoURI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) =>
    console.error("MongoDB connection error:", err.message)
  );

module.exports = mongoose;
