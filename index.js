const mineflayer = require("mineflayer");
const express = require("express");
const fs = require("fs");

const config = JSON.parse(fs.readFileSync("./config.json"));

const app = express();
app.get("/", (req, res) => res.send("AFK Bot działa ✅"));
app.listen(3000, () => console.log("🌐 Express server running on port 3000"));

let bot;
let afkTask;
let reconnecting = false;

function startBot() {
  console.log("🚀 Próba połączenia z serwerem MC...");

  bot = mineflayer.createBot({
    host: config.host,
    port: config.port,
    username: config.username,
    version: config.version,
    auth: "offline"
  });

  bot.once("spawn", () => {
    console.log("✅ Bot wszedł na serwer");

    setTimeout(() => {
      bot.chat(`/login ${config.password}`);
    }, config.loginDelay);

    afkTask = setInterval(() => {
      bot.setControlState("jump", true);
      setTimeout(() => bot.setControlState("jump", false), 300);
    }, config.afkInterval);
  });

  bot.on("messagestr", (msg) => {
    if (msg.toLowerCase().includes("register")) {
      bot.chat(`/register ${config.password} ${config.password}`);
    }
  });

  function scheduleReconnect() {
    if (reconnecting) return;
    reconnecting = true;
    if (afkTask) clearInterval(afkTask);
    console.log(`🔄 Reconnect za ${config.reconnectDelay / 1000}s`);
    setTimeout(() => {
      reconnecting = false;
      startBot();
    }, config.reconnectDelay);
  }

  bot.on("end", scheduleReconnect);
  bot.on("kicked", scheduleReconnect);
  bot.on("error", (err) => console.log("⚠️ Error:", err.message));
}

startBot();