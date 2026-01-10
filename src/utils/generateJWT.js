const jwt = require("jsonwebtoken");
require("dotenv").config();

const generateToken = (userId) => {
  if (!userId) {
    throw new Error("User ID is required to generate JWT");
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT secret is not defined in environment variables");
  }
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";

  try {
    const token = jwt.sign({ userId }, secret, { expiresIn });
    return token;
  } catch (error) {
    console.error("Error generating JWT:", error.message);
    throw new Error("Could not generate JWT");
  }
};

module.exports = generateToken;