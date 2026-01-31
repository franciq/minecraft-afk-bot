const mineflayer = require("mineflayer");
const express = require("express");
const fs = require("fs");

// KEEP ALIVE
const app = express();
app.get("/", (req, res) => res.send("AFK Bot działa ✅"));
app.listen(5000, "0.0.0.0");

// LOAD CONFIG
const config = JSON.parse(fs.readFileSync("./config.json"));

let bot;
let afkTask;

function startBot() {
  console.log("🚀 Łączenie z serwerem...");

  bot = mineflayer.createBot({
    host: config.host,
    port: config.port,
    username: config.username,
    version: config.version,
    auth: "offline",
  });

  bot.once("spawn", () => {
    console.log("✅ Bot wszedł na serwer");

    // LOGIN AUTHME
    setTimeout(() => {
      bot.chat(`/login ${config.password}`);
    }, config.loginDelay);

    // ANTI-AFK
    afkTask = setInterval(() => {
      bot.setControlState("jump", true);
      setTimeout(() => bot.setControlState("jump", false), 300);
    }, config.afkInterval);
  });

  // AUTO REGISTER
  bot.on("messagestr", (msg) => {
    const m = msg.toLowerCase();
    if (m.includes("register")) {
      bot.chat(`/register ${config.password} ${config.password}`);
    }
  });

  // RECONNECT
  bot.on("end", () => {
    console.log(
      `🔄 Rozłączono – reconnect za ${config.reconnectDelay / 1000}s`,
    );
    if (afkTask) clearInterval(afkTask);
    setTimeout(startBot, config.reconnectDelay);
  });

  bot.on("error", (err) => {
    console.log("⚠️ Błąd:", err.message);
  });
}

startBot();
