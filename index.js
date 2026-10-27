
import express from "express";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Messenger AI Bot is running!");
});

app.get("/webhook", (req, res) => {
  if (
    req.query["hub.mode"] === "subscribe" &&
    req.query["hub.verify_token"] === process.env.META_VERIFY_TOKEN
  ) {
    return res.status(200).send(req.query["hub.challenge"]);
  }
  res.sendStatus(403);
});

app.post("/webhook", async (req, res) => {
  res.sendStatus(200);

  if (req.body.object !== "page") return;

  for (const entry of req.body.entry || []) {
    for (const event of entry.messaging || []) {
      if (!event.message || event.message.is_echo) continue;

      const sender = event.sender?.id;
      const text = event.message.text?.trim();
      if (!sender || !text) continue;

      let reply = "কমান্ড বুঝিনি। help লিখে দেখো।";

      if (text.toLowerCase() === "help") {
        reply = "🤖 BOT MENU\nhelp\nping\njoke\nquiz\nai";
      } else if (text.toLowerCase() === "ping") {
        reply = "🏓 Pong! Bot online.";
      } else if (text.toLowerCase() === "joke") {
        reply = "😂 শিক্ষক: পড়া শিখেছ? ছাত্র: বই খুললেই ঘুম আসে!";
      } else if (text.toLowerCase() === "quiz") {
        reply = "🧠 বাংলাদেশের রাজধানী কী? উত্তর: answer Dhaka";
      } else if (text.toLowerCase() === "answer dhaka") {
        reply = "✅ সঠিক উত্তর!";
      } else if (text.toLowerCase().startsWith("ai ")) {
        reply = "🤖 AI ফিচারটি চালু করতে API key সেটআপ করতে হবে।";
      }

      try {
        await fetch(
          `https://graph.facebook.com/${process.env.GRAPH_API_VERSION || "v25.0"}/me/messages?access_token=${process.env.PAGE_ACCESS_TOKEN}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              recipient: { id: sender },
              messaging_type: "RESPONSE",
              message: { text: reply }
            })
          }
        );
      } catch (error) {
        console.error(error);
      }
    }
  }
});

app.listen(process.env.PORT || 10000, () => {
  console.log("Bot started");
});
