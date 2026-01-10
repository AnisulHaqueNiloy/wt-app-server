const {
  registerNewUser,
  authenticateUser,
  getUserById,
  logoutUser,
} = require("../services/authService");

const setTokenCookie = (res, token) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    sameSite: "strict",
  };
  res.cookie("jwt", token, cookieOptions);
};

/**
 * register user.........
 */
const registerUser = async (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Please enter all fields." });
  }

  try {
    const userData = await registerNewUser({ name, email, password });

    setTokenCookie(res, userData.token);

    res.status(201).json({
      _id: userData._id,
      name: userData.name,
      email: userData.email,
      role: userData.role,
    });
  } catch (error) {
    if (error.message.includes("exists")) {
      res.status(400);
    } else {
      res.status(500);
    }
    next(error);
  }
};

/**
 * user login.........
 */
const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Please enter email and password." });
  }

  try {
    const userData = await authenticateUser(email, password);

    setTokenCookie(res, userData.token);
    res.json({
      _id: userData._id,
      name: userData.name,
      email: userData.email,
    });
  } catch (error) {
    res.status(401);
    next(error);
  }
};

const getMe = async (req, res) => {
  try {
    // Controller will call service to get user by ID
    const user = await getUserById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// logout
const logout = async (req, res) => {
  const cookieOptions = logoutUser();

  res.clearCookie("jwt", cookieOptions);
  res.status(200).json({ message: "Logged out successfully" });
};

module.exports = { registerUser, loginUser, getMe, logout };