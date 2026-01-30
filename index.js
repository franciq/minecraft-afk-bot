const mineflayer = require("mineflayer");
const express = require("express");

const app = express();
app.get("/", (req, res) => res.send("Bot MC 24/7 działa ✅"));
app.listen(3000);

// ====== USTAWIENIA SERWERA ======
const HOST = "bocker.aternos.host";
const PORT = 32014;
const USERNAME = "AFK_BOT_24_7";
const PASSWORD = "bot12345";        // 🔴 ZMIEŃ NA SWOJE
const MC_VERSION = "1.20.6";

// opóźnienia (Aternos-friendly)
const LOGIN_DELAY = 3500;            // ms
const RECONNECT_DELAY = 10000;       // ms
const AFK_INTERVAL = 25000;          // ms

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

    // AUTO LOGIN (AuthMe)
    setTimeout(() => {
      bot.chat(`/login ${PASSWORD}`);
    }, LOGIN_DELAY);

    // ANTY-AFK
    afkInterval = setInterval(() => {
      bot.setControlState("jump", true);
      setTimeout(() => bot.setControlState("jump", false), 400);
    }, AFK_INTERVAL);
  });

  // AUTO REGISTER (pierwsze wejście)
  bot.on("messagestr", (msg) => {
    const m = msg.toLowerCase();
    if (m.includes("register")) {
      console.log("📝 Rejestracja AuthMe...");
      bot.chat(`/register ${PASSWORD} ${PASSWORD}`);
    }
  });

  // ROZŁĄCZENIE / KICK / ECONNRESET
  bot.on("end", () => {
    console.log(`🔄 Rozłączono – reconnect za ${RECONNECT_DELAY / 1000}s`);

    if (afkInterval) clearInterval(afkInterval);

    setTimeout(startBot, RECONNECT_DELAY);
  });

  bot.on("error", (err) => {
    console.log("⚠️ Error:", err?.message || err);
    // nie crashujemy bota
  });
}

startBot();