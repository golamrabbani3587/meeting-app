const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require('bcryptjs')

const JWT_SECRET = "I123Love456You";
const signUp = async (req, res) => {
    const { email, password, name } = req.body;
    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const user = new User({ email, name, password: hashedPassword });
      await user.save();
  
      res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Server error" });
    }};
  
const signIn = async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: "Invalid email or password" });
      }
  
      if (!user.password) {
        return res.status(400).json({ message: "Password is missing" });
      }
  
      const isMatch = await bcrypt.compare(password, user.password);
  
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid email or password" });
      }
  
      const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "30d" });
  
      res.json({
        message: "success",
        token,
        userDetails: {
          id: user._id,
          email: user.email,
          name: user.name,
          isOnline: user.isOnline,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }};

    module.exports = { signIn, signUp }

