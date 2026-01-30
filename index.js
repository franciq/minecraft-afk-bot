const mineflayer = require("mineflayer");
const express = require("express");

const app = express();
app.get("/", (req, res) => {
  res.send("Bot działa 24/7 ✅");
});
app.listen(3000);

const bot = mineflayer.createBot({
  host: "IP_SERWERA", // np. bez-spinyv3.aternos.me
  port: 25565,
  username: "AFK_BOT_24_7",
  version: "1.20.6",
  auth: "offline"
});

bot.on("spawn", () => {
  console.log("Bot wszedł na serwer");

  // skakanie co 30s (anty-AFK)
  setInterval(() => {
    bot.setControlState("jump", true);
    setTimeout(() => bot.setControlState("jump", false), 500);
  }, 30000);
});

bot.on("end", () => {
  console.log("Rozłączono, reconnect...");
  setTimeout(() => process.exit(1), 5000);
});
