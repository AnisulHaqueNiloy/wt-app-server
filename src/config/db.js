const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;


/* 
MONGO_URI =mongodb+srv://wtapphub:d0UFJ4yca1BirNAp@cluster0.3zxuw.mongodb.net/wtapphubDB?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=wtapphub_super_secret_key_12345
JWT_EXPIRES_IN=7d

*/