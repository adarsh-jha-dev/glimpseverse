const express = require("express");
const User = require("../Models/User");
const bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator"); // Add validationResult here
const fetchuser = require("../Middleware/fetchUser");
const router = express.Router();

const JWT_SECRET = "Adarsh'sFirstFullFledgedProject";

// ROUTE-1 : Adding a new user
router.post(
  "/signup",
  [
    body("firstname", "Please enter a valid first name"),
    body("lastname", "Please enter a valid last name"),
    body("email", "Please enter a valid email").isEmail(),
    body("password", "Password must be at least 3 characters long").isLength({
      min: 3,
    }),
  ],
  async (req, res) => {
    try {
      let success = false;
      const errors = validationResult(req); // Use validationResult to check for validation errors
      if (!errors.isEmpty()) {
        return res.status(400).json({ success, errors: errors.array() });
      }
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res
          .status(400)
          .json({ success, error: "This email is already registered" });
      }
      user = await User.findOne({ username: req.body.username });
      if (user) {
        return res
          .status(400)
          .json({ success, error: "This username has already been taken" });
      }
      const password = req.body.password;
      const cpassword = req.body.cpassword;

      if (password !== cpassword) {
        return res
          .status(400)
          .json({ success, error: "Passwords doesn't match" });
      }

      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(password, salt);

      user = await User.create({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        dob: req.body.dob,
        email: req.body.email,
        username: req.body.username,
        password: secPass,
      });
      const data = {
        user: {
          id: user.id,
        },
      };
      const authtoken = jwt.sign(data, JWT_SECRET);
      success = true;
      res.json({ success, authtoken });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
    }
  }
);

// ROUTE - 2 : Logging in an existing user
router.post(
  "/login",
  [
    body("username", "Enter a valid username").exists(),
    body("password", "Password cannot be blank").exists(),
  ],
  async (req, res) => {
    let success = false;
    // If there are errors, return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success, errors: errors.array() });
    }

    const password = req.body.password;
    try {
      let user = await User.findOne({ username: req.body.username });
      if (!user) {
        return res.status(400).json({
          success,
          error: "Please try to login with correct credentials",
        });
      }

      const passwordCompare = await bcrypt.compare(password, user.password);
      if (!passwordCompare) {
        return res.status(400).json({
          success,
          error: "Please try to login with correct credentials",
        });
      }

      const data = {
        user: {
          id: user.id,
        },
      };
      success = true;
      const username = req.body.username;
      const authtoken = jwt.sign(data, JWT_SECRET);
      res.json({ success, authtoken, username });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
    }
  }
);

// ROUTE 3: Get loggedin User Details using: POST "/api/auth/getuser". Login required
router.post("/getuser", fetchuser, async (req, res) => {
  try {
    userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    res.send(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/searchuser", fetchuser, (req, res) => {
  const searchQuery = req.body.searchQuery;

  const regex = new RegExp(searchQuery, "i");
  User.find(
    {
      $or: [{ firstname: { $regex: regex } }, { username: { $regex: regex } }],
    },
    "-password"
  )
    .then((users) => {
      if (users.length > 0) {
        res.json(users);
      } else {
        return res.json({ message: "No users found" });
      }
    })
    .catch((e) => {
      res.status(400).json(e);
    });
});

router.put("/edituser", fetchuser, async (req, res) => {
  try {
    await User.findOneAndUpdate(
      { _id: req.user.id },
      {
        $set: {
          firstname: req.body.firstname || req.user.firstname,
          lastname: req.body.lastname || req.user.lastname,
          dob: req.body.dob || req.user.dob,
          username: req.body.username || req.user.username,
        },
      },
      { new: true, select: "-password" }
    )
      .then((updateduser) => {
        res.json(updateduser);
      })
      .catch((e) => {
        res.status(400).json({ error: "Some error occured" });
      });
  } catch (e) {
    console.log(e.message);
    res.status(400).json({ error: "Internal server error" });
  }
});

router.delete("/deletemyaccount", fetchuser, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id).then(() => {
      res.json({ success: "Account deleted successfully" });
    });
  } catch (e) {
    res.status(500).json({ error: "Internal server error" });
    console.log(e.message);
  }
});

module.exports = router;
