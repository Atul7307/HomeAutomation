const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const axios = require('axios');
require("dotenv").config();

const router = express.Router();

// Secret key for JWT
const SECRET_KEY = process.env.SECRET_KEY;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

// Register a new user
router.post("/register", async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    res.json({ message: "User registered!" });
});

// Login user
router.post("/login", async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, SECRET_KEY);
    res.json({ token });
});


// // Google OAuth Flow
// router.get("/google", (req, res) => {
//     const { redirect_uri, state } = req.query;
//     const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");

//     authUrl.searchParams.append("client_id", GOOGLE_CLIENT_ID);
//     authUrl.searchParams.append("redirect_uri", redirect_uri);
//     authUrl.searchParams.append("response_type", "code");
//     authUrl.searchParams.append("scope", "https://www.googleapis.com/auth/homegraph");
//     authUrl.searchParams.append("state", state);
//     authUrl.searchParams.append("access_type", "offline");

//     res.redirect(authUrl.toString());
// });

// Improved Google OAuth Flow
router.get("/google", (req, res) => {
    const { redirect_uri, state } = req.query;
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?
      client_id=${GOOGLE_CLIENT_ID}&
      redirect_uri=${encodeURIComponent(redirect_uri)}&
      response_type=code&
      scope=https://www.googleapis.com/auth/homegraph&
      state=${state}&
      access_type=offline&
      prompt=consent`;
  
    res.redirect(authUrl);
  });


// // Token Exchange
// router.post("/token", async (req, res) => {
//     try {
//         const { code, redirect_uri } = req.body;

//         const tokenResponse = await axios.post("https://oauth2.googleapis.com/token", {
//             code,
//             client_id: GOOGLE_CLIENT_ID,
//             client_secret: GOOGLE_CLIENT_SECRET,
//             redirect_uri,
//             grant_type: "authorization_code"
//         });

//         // Generate JWT for your system
//         const jwtToken = jwt.sign(
//             { googleAccessToken: tokenResponse.data.access_token },
//             JWT_SECRET,
//             { expiresIn: '1h' }
//         );

//         res.json({
//             access_token: jwtToken,
//             token_type: "Bearer",
//             expires_in: 3600,
//             refresh_token: tokenResponse.data.refresh_token
//         });
//     } catch (error) {
//         console.error("Token Error:", error.response.data);
//         res.status(400).json({ error: "invalid_grant" });
//     }
// });

// Enhanced Token Exchange
router.post("/token", async (req, res) => {
    try {
      const { code, redirect_uri } = req.body;
      
      const tokenResponse = await axios.post("https://oauth2.googleapis.com/token", {
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri,
        grant_type: "authorization_code"
      });
  
      // Maintain existing JWT system
      const jwtToken = jwt.sign(
        { userId: "google-user-id" }, // Use your existing user system
        SECRET_KEY,
        { expiresIn: '1h' }
      );
  
      res.json({
        access_token: jwtToken,
        token_type: "Bearer",
        expires_in: 3600,
        refresh_token: tokenResponse.data.refresh_token
      });
    } catch (error) {
      console.error("Token Error:", error.response.data);
      res.status(400).json({ error: "invalid_grant" });
    }
  });



module.exports = router;
