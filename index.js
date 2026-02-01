const mineflayer = require("mineflayer");
const express = require("express");
const fs = require("fs-extra");

// ================= KEEP ALIVE =================
const app = express();
app.get("/", (req, res) => res.send("AFK Bot działa ✅"));
app.listen(5000, "0.0.0.0");

// ================= LOAD CONFIG =================
const config = fs.readJsonSync("./config.json");

let bot;
let afkTask;
let adTask;

// ===== timer reklam do pliku =====
const AD_FILE = "./ad_timer.json";

function loadNextAdTime() {
  if (fs.existsSync(AD_FILE)) {
    const data = fs.readJsonSync(AD_FILE);
    return data.nextAdAt;
  }
  return Date.now() + config.adInterval;
}

function saveNextAdTime(time) {
  fs.writeJsonSync(AD_FILE, { nextAdAt: time });
}

// ================= BOT START =================
function startBot() {
  console.log("🚀 Łączenie z serwerem...");

  bot = mineflayer.createBot({
    host: config.host,
    port: config.port,
    username: config.username,
    version: config.version,
    auth: "offline"
  });

  // ================= SPAWN =================
  bot.once("spawn", () => {
    console.log("✅ Bot wszedł na serwer");

    // ===== LOGIN AUTHME =====
    setTimeout(() => {
      bot.chat(`/login ${config.password}`);
      console.log("🔐 Wysłano /login");
    }, config.loginDelay);

    // ===== START AFK + ADS (PO LOGINIE) =====
    setTimeout(() => {
      console.log("🟢 Start anti-AFK i reklam");

      // ---- ANTI AFK ----
      afkTask = setInterval(() => {
        bot.look(bot.entity.yaw + Math.PI / 2, bot.entity.pitch, true);
        bot.setControlState("forward", true);
        setTimeout(() => bot.setControlState("forward", false), 400);
        bot.swingArm("right");
      }, config.afkInterval);

      // ---- CHAT ADS ----
      const ads = [
        "[Kebab EKSTRA BÓL] Tylko u Maćka 6 Diaxów!",
        "[Kebab Misiany] Promka! 2 Diaxy!",
        "[Kebab XL] Dla głodnych burgermanów 2 Diaxy!",
        "[Mega Kebab] + Sos Gratis 3 Diaxy!",
        "[Kebab Premium] LIMITED 2 Diaxy!"
      ];

      let nextAdAt = loadNextAdTime();

      function scheduleAd() {
        const delay = Math.max(0, nextAdAt - Date.now());
        adTask = setTimeout(() => {
          const msg = ads[Math.floor(Math.random() * ads.length)];
          bot.chat(msg);
          console.log("📢 Reklama:", msg);

          nextAdAt = Date.now() + config.adInterval;
          saveNextAdTime(nextAdAt);

          scheduleAd();
        }, delay);
      }

      scheduleAd();

    }, config.loginDelay + 3000);
  });

  // ================= AUTO REGISTER =================
  bot.on("messagestr", (msg) => {
    const m = msg.toLowerCase();
    if (m.includes("register")) {
      bot.chat(`/register ${config.password} ${config.password}`);
      console.log("📝 Wysłano /register");
    }
  });

  // ================= RECONNECT =================
  bot.on("end", () => {
    console.log(`🔄 Rozłączono – reconnect za ${config.reconnectDelay / 1000}s`);
    if (afkTask) clearInterval(afkTask);
    if (adTask) clearTimeout(adTask);
    setTimeout(startBot, config.reconnectDelay);
  });

  // ================= ERROR =================
  bot.on("error", (err) => {
    console.log("⚠️ Błąd:", err.message);
  });
}

startBot();