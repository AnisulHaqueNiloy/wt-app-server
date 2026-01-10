// src/services/authService.js
const User = require("../models/User");
const generateToken = require("../utils/generateJWT");

const registerNewUser = async ({ name, email, password }) => {
  const userExists = await User.findOne({ email });

  if (userExists) {
    throw new Error("User already exists with this email.");
  }

  const user = await User.create({ name, email, password });

  if (user) {
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
      
    };
  } else {
    throw new Error("Invalid user data.");
  }
};

const authenticateUser = async (email, password) => {
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    };
  } else {
    throw new Error("Invalid email or password.");
  }
};

const getUserById = async (userId) => {
  try {
    const user = await User.findById(userId).select("-password");
    return user;
  } catch (error) {
    throw new Error("User not found.");
  }
};

const logoutUser = async () => {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict", // যদি ফ্রন্টএন্ড এবং ব্যাকএন্ড আলাদা ডোমেইন হয়
    path: "/",
  };
};

module.exports = { registerNewUser, authenticateUser, getUserById, logoutUser };