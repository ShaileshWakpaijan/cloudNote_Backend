const express = require("express");
const User = require("../models/User");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fetchuser = require("../middleware/fetchuser.js");

// Rout-1: Creat a User using: POST "/api/auth/". Doesnt require auth
router.post(
  "/",
  [
    body("name", "Please enter name").isLength({ min: 2 }),
    body("email", "Please enter email").isEmail().normalizeEmail(),
    body("password", "Password must not be blank").isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    // validation of user input
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }
    try {
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res.status(400).json({
          success: false,
          error: "User is already exist.",
        });
      }

      const salt = await bcrypt.genSaltSync(10);
      const secPass = await bcrypt.hash(req.body.password, salt);

      // creating user
      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secPass,
      });

      const data = {
        user: {
          id: user.id,
        },
      };

      const authToken = jwt.sign(data, process.env.JWT_SECRET);
      res.json({ authToken: authToken });

      // res.json(user)
    } catch (err) {
      console.log(err.message);
      res.status(500).send("Internal Server Error");
    }
  }
);

// Rout-2: Login a User using: POST "/api/auth/login". Doesnt require auth
router.post(
  "/login",
  [
    body("email", "Please enter email").isEmail().normalizeEmail(),
    body("password", "Password must not be blank").isLength({ min: 6 }),
  ],

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({
          success: false,
          error: "email/password is wrong",
        });
      }
      const passwordComp = await bcrypt.compare(password, user.password);
      if (!passwordComp) {
        return res.status(400).json({
          success: false,
          error: "email/password is wrong",
        });
      }

      const data = {
        user: {
          id: user.id,
        },
      };

      const authToken = jwt.sign(data, process.env.JWT_SECRET);
      res.json({ authToken: authToken });
    } catch (err) {
      console.log(err.message);
      res.status(500).send("Internal Server Error");
    }
  }
);

// Rout-3: Get loggedin User details using: POST "/api/auth/getuser" Login required
router.post("/getuser", fetchuser, async (req, res) => {
  try {
    let userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    res.send(user);
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
