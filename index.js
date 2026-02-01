const mineflayer = require("mineflayer");
const express = require("express");
const fs = require("fs");

// ================= KEEP ALIVE =================
const app = express();
app.get("/", (req, res) => res.send("AFK Bot działa ✅"));
app.listen(5000, "0.0.0.0");

// ================= LOAD CONFIG =================
const config = JSON.parse(fs.readFileSync("./config.json"));

let bot;
let afkTask;
let adTask;

function startBot() {
  console.log("🚀 Łączenie z serwerem...");

  bot = mineflayer.createBot({
    host: config.host,
    port: config.port,
    username: config.username,
    version: config.version,
    auth: "offline",
  });

  // ================= SPAWN =================
  bot.once("spawn", () => {
    console.log("✅ Bot wszedł na serwer");

    // AUTHME LOGIN
    setTimeout(() => {
      bot.chat(`/login ${config.password}`);
    }, config.loginDelay);

    // ================= ANTI AFK =================
    afkTask = setInterval(() => {
      bot.setControlState("jump", true);
      setTimeout(() => bot.setControlState("jump", false), 300);
    }, config.afkInterval);

    // ================= CHAT ADS =================
    const ads = [
      "§6[Kebab EKSTRA BÓL] §eTylko u Maćka §a6 Diaxów!",
      "§c[Kebab Misiany] §ePromka! §b2 Diaxy!",
      "§a[Kebab XL] §eDla głodnych burgermanów §d2 Diaxy!",
      "§b[Mega Kebab] §e+ Sos Gratis §a3 Diaxy!",
      "§e[Kebab Premium] §cLIMITED §f2 Diaxy!"
    ];

    adTask = setInterval(() => {
      const msg = ads[Math.floor(Math.random() * ads.length)];
      bot.chat(msg);
    }, 6 * 60 * 1000); // 6 minut
  });

  // ================= AUTO REGISTER =================
  bot.on("messagestr", (msg) => {
    const m = msg.toLowerCase();
    if (m.includes("register")) {
      bot.chat(`/register ${config.password} ${config.password}`);
    }
  });

  // ================= RECONNECT =================
  bot.on("end", () => {
    console.log(`🔄 Rozłączono – reconnect za ${config.reconnectDelay / 1000}s`);

    if (afkTask) clearInterval(afkTask);
    if (adTask) clearInterval(adTask);

    setTimeout(startBot, config.reconnectDelay);
  });

  // ================= ERROR =================
  bot.on("error", (err) => {
    console.log("⚠️ Błąd:", err.message);
  });
}

startBot();