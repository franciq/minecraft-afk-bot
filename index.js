const mineflayer = require("mineflayer");
const express = require("express");

const app = express();
app.get("/", (req, res) => res.send("Bot 24/7 online ✅"));
app.listen(3000);

const HOST = "anarchiaspongebob.aternos.me";        // np. bez-spinyv3.aternos.me
const PORT = 32014;
const USERNAME = "AFK_BOT_24_7";
const PASSWORD = "bot12345";     // hasło AuthMe

let bot;

function startBot() {
  bot = mineflayer.createBot({
    host: HOST,
    port: PORT,
    username: USERNAME,
    version: "1.20.6",
    auth: "offline"
  });

  bot.once("spawn", () => {
    console.log("✅ Bot wszedł na serwer");

    // AUTO LOGIN
    setTimeout(() => {
      bot.chat(`/login ${PASSWORD}`);
    }, 1500);

    // ANTY-AFK
    setInterval(() => {
      bot.setControlState("jump", true);
      setTimeout(() => bot.setControlState("jump", false), 400);
    }, 25000);
  });

  // AUTO REGISTER (1 raz)
  bot.on("messagestr", (msg) => {
    if (msg.toLowerCase().includes("register")) {
      bot.chat(`/register ${PASSWORD} ${PASSWORD}`);
    }
  });

  // SZYBKI RECONNECT
  bot.on("end", () => {
    console.log("🔄 Rozłączono – reconnect za 3s");
    setTimeout(startBot, 3000);
  });

  bot.on("error", (err) => {
    console.log("⚠️ Error:", err.message);
  });
}

startBot();
