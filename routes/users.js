const User = require("../models/UserModel");
const router = require("express").Router();
const bcrypt = require("bcrypt");
const { validationResult } = require('express-validator'); // Assuming you have express-validator

// Update user
router.put('/:id', async (req, res) => {
 // Authorization check
 if (req.body.userId !== req.params.id && !req.body.isAdmin) {
   return res.status(403).json('Unauthorized: You can only update your own account');
 }

 const errors = validationResult(req); // Validate input
 if (!errors.isEmpty()) {
   return res.status(400).json({ errors: errors.array() });
 }

 try {
   const salt = await bcrypt.genSalt(10); // Hash password

   if (req.body.password) {
     req.body.password = await bcrypt.hash(req.body.password, salt);
   }

   const updatedUser = await User.findByIdAndUpdate(req.params.id, {
     $set: req.body, // Update document
   });

   if (!updatedUser) {
     return res.status(404).json('User not found');
   }

   res.status(200).json('Account has been updated');
 } catch (err) {
   console.error(err); // Log detailed error
   res.status(500).json('Internal Server Error');
 }
});

// delete a user
router.delete("/:id", async (req, res) => {
 if (req.body.userId === req.params.id || req.body.isAdmin) {
   try {
     await User.findByIdAndDelete(req.params.id);
     res.status(200).json("Account has been deleted");
   } catch (err) {
     return res.status(500).json(err);
   }
 } else {
   return res.status(403).json("You can delete only your account!");
 }
});

// get a user
router.get("/:id", async (req, res) => {
 try {
   const user = await User.findById(req.params.id);
   const { password, updatedAt, ...other } = user._doc;
   res.status(200).json(other);
 } catch (err) {
   res.status(500).json(err);
 }
});

//follow a user

router.put("/:id/follow", async (req, res) => {
  // Ensure requested user is different
  if (req.body.userId !== req.params.id) {
    try {
      // Find both users
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);

      // Check if already following
      if (!user.followers.includes(req.body.userId)) {
        // Update both users if not already following
        await user.updateOne({ $push: { followers: req.body.userId } });
        await currentUser.updateOne({ $push: { following: req.params.id } });

        res.status(200).json("User has been followed");
      } else {
        res.status(403).json("You already follow this user");
      }
    } catch (err) {
      console.error(err);
      res.status(500).json("Internal server error");
    }
  } else {
    res.status(403).json("You can't follow yourself");
  }
});

//unfollow a user

router.put("/:id/unfollow", async (req, res) => {
    if (req.body.userId !== req.params.id) {
      try {
        const user = await User.findById(req.params.id);
        const currentUser = await User.findById(req.body.userId);
        if (user.followers.includes(req.body.userId)) {
          await user.updateOne({ $pull: { followers: req.body.userId } });
          await currentUser.updateOne({ $pull: { followings: req.params.id } });
          res.status(200).json("user has been unfollowed");
        } else {
          res.status(403).json("you dont follow this user");
        }
      } catch (err) {
        res.status(500).json(err);
      }
    } else {
      res.status(403).json("you cant unfollow yourself");
    }
  });


module.exports = router