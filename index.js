const mineflayer = require("mineflayer");
const express = require("express");

const app = express();
app.get("/", (req, res) => res.send("Bot MC 24/7 działa ✅"));
app.listen(3000);

const HOST = "anarchiaspongebob.aternos.me";  // dynamiczny host Aternos
const PORT = 32014;
const USERNAME = "AFK_BOT_24_7";
const PASSWORD = "bot12345";         // AuthMe
const MC_VERSION = "1.20.6";

const LOGIN_DELAY = 3500;
const RECONNECT_DELAY = 10000;
const AFK_INTERVAL = 25000;

let bot;
let afkInterval;

function startBot() {
  console.log("🚀 Próba połączenia z serwerem...");

  bot = mineflayer.createBot({
    host: HOST,
    port: PORT,
    username: USERNAME,
    version: MC_VERSION,
    auth: "offline"
  });

  bot.once("spawn", () => {
    console.log("✅ Bot wszedł na serwer");

    setTimeout(() => {
      bot.chat(`/login ${PASSWORD}`);
    }, LOGIN_DELAY);

    afkInterval = setInterval(() => {
      bot.setControlState("jump", true);
      setTimeout(() => bot.setControlState("jump", false), 400);
    }, AFK_INTERVAL);
  });

  bot.on("messagestr", (msg) => {
    if (msg.toLowerCase().includes("register")) {
      console.log("📝 Rejestracja AuthMe...");
      bot.chat(`/register ${PASSWORD} ${PASSWORD}`);
    }
  });

  bot.on("end", () => {
    console.log(`🔄 Rozłączono – reconnect za ${RECONNECT_DELAY / 1000}s`);
    if (afkInterval) clearInterval(afkInterval);
    setTimeout(startBot, RECONNECT_DELAY);
  });

  bot.on("error", (err) => {
    console.log("⚠️ Error:", err?.message || err);
  });
}

startBot();