const express = require("express");
const router = express.Router();
const User = require("../models/User");
const fetchuser = require("../middleware/fetchUser");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
require('dotenv').config()

//TODO Put this in environment variable file
const JWT_SECRET = "$&THISISASECRET&$";

// Route 1 : Create a User using : POST "/api/auth/createuser".No Login Required

router.post(
  "/createuser",
  [
    body("name", "Enter a valid Name !").isLength({ min: 3 }),
    body("email", "Enter a valid Email !").isEmail(),
    body("password").isLength({ min: 5 }),
  ],
  async (req, res) => {
    let success = false;
    //If there are errors, return BAD request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success, errors: errors.array() });
    }
    //check whether the user with this email exists already
    try {
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res.status(400).json({
          success,
          error: "Sorry a user with this email already exists",
        });
      }

      const salt = await bcrypt.genSaltSync(10);
      const secPass = await bcrypt.hash(req.body.password, salt);

      //Create a new user
      user = await User.create({
        name: req.body.name,
        password: secPass,
        email: req.body.email,
      });

      const data = {
        user: {
          id: user.id,
        },
      };

      const token = jwt.sign(data, JWT_SECRET);
      success = true;
      res.json({ success, token });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error !");
    }
  }
);
// Route 2 : Authenticate a User using : POST "/api/auth/Login"

router.post(
  "/login",
  [
    body("email", "Enter a valid Email !").isEmail(),
    body("password", "Password cannot be blank !").exists(),
  ],
  async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({
          success,
          error: "Please try to login with with correct credentials !",
        });
      }

      const passwordCompare = await bcrypt.compare(password, user.password);
      if (!passwordCompare) {
        success = false;
        return res.status(400).json({
          success,
          error: "Please try to login with with correct credentials !",
        });
      }

      const data = {
        user: {
          id: user.id,
        },
      };
      const token = jwt.sign(data, JWT_SECRET);
      success = true;

      const transporter = nodemailer.createTransport({
        service: "hotmail",
        auth: {
          user: process.env.USER,
          pass: process.env.PASS,
        },
      });

      const options = {
        from: "testccounteauth@outlook.com",
        to: email,
        subject: "OTP for Authentication",
        text:
          "If you are trying to access your notes then \n" +
          " The OTP to access Your notes is " +
          token.slice(-4) +
          " Enjoy Reading Them !!! \n" +
          " If this is not you then contact us immidiately on following mail ( testccounteauth@outlook.com )",
      };
      transporter.sendMail(options, (err) => {
        if (err) {
          console.log(err);
          return;
        }
      });
      res.send({ success, token });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error !");
    }
  }
);

// Route 3 : Get logged in user details : POST "/api/auth/getuser".Login Required
router.post("/getuser", fetchuser, async (req, res) => {
  try {
    var userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    res.send(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error !");
  }
});

module.exports = router;
