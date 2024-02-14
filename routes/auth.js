const router = require('express').Router();
const User = require('../models/UserModel');
const bcrypt = require('bcrypt');

// REGISTER
router.post("/register", async (req, res) => {
  try {
    // Generate new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // Create new user
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
    });

    // Save user and respond
    const user = await newUser.save();
    res.status(200).json(user);
    return; // Ensure only one response is sent
  } catch (err) {
    res.status(500).json(err);
    return; // Prevent further execution
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      res.status(404).json("user not found");
      return; // Prevent further execution if user not found
    }

    const validPassword = await bcrypt.compare(req.body.password, user.password);

    if (!validPassword) {
      res.status(400).json("wrong password");
      return; // Prevent further execution if password invalid
    }

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
