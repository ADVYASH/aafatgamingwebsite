// server.js
import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.static(__dirname));
app.use(cookieParser());

// ⚙️ ENV variables
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = "http://localhost:3000/callback";
const WEBHOOK_URL = process.env.WEBHOOK_URL;

// Step 1: Redirect user to Discord
app.get("/login", (req, res) => {
  const url = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}&response_type=code&scope=identify%20email%20connections%20guilds.members.read`;
  res.redirect(url);
});

// Step 2: Handle callback
app.get("/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.send("No code provided");

  try {
    // Exchange code for token
    const tokenResponse = await axios.post(
      "https://discord.com/api/oauth2/token",
      new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI,
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const { access_token } = tokenResponse.data;

    // Get user info
    const userResponse = await axios.get("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const user = userResponse.data;
    const loginTime = new Date().toLocaleString();

    // Send data to webhook
    await axios.post(WEBHOOK_URL, {
      embeds: [
        {
          title: "🟢 New Discord Login",
          color: 0x00ff99,
          thumbnail: { url: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` },
          fields: [
            { name: "Name", value: user.username, inline: true },
            { name: "User ID", value: user.id, inline: true },
            { name: "Mention", value: `<@${user.id}>`, inline: true },
            { name: "Email", value: user.email || "N/A", inline: true },
            { name: "Login Time", value: loginTime, inline: true },
          ],
        },
      ],
    });

    // Save user data in cookie
    res.cookie("user", JSON.stringify(user), { httpOnly: false });
    res.redirect("/home.html");
  } catch (err) {
    console.error(err);
    res.send("Error logging in with Discord");
  }
});

app.listen(3000, () => console.log("✅ Server running on http://localhost:3000"));
