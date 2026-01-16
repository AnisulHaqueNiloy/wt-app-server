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

WASENDER_TOKEN = "82940f9e9fd07461bd9f6d0022e86c595e0e0968a5ff59dda55fc4809e3b5db3"
WASENDER_URL = https://www.wasenderapi.com/api/send-message

*/
