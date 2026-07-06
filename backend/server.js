const express = require("express");
const cors = require("cors");
const https = require("https");

const app = express();
app.use(cors());
app.use(express.json());

const QWEN_API_KEY = process.env.QWEN_API_KEY;

function callQwen(payload) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer sk-ws-H.RXRPYPD.qt6c.MEMCIBC7zCe7-3AsOORzSSP8n5rBLo57_mfLXbqxY4qwalowAh900I5w6EZLSKa4zTtazjr4mn9BAGe7EdFMc1S2TFwi`
        }
      },
      (res) => {
        let body = "";
        res.on("data", c => body += c);
        res.on("end", () => resolve(JSON.parse(body)));
      }
    );

    req.on("error", reject);
    req.write(JSON.stringify(payload));
    req.end();
  });
}

function safeParse(raw) {
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    const s = raw.indexOf("{");
    const e = raw.lastIndexOf("}");
    if (s !== -1 && e !== -1) {
      try {
        return JSON.parse(raw.slice(s, e + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

app.post("/generate", async (req, res) => {
  const { input, style } = req.body;

  try {
    const data = await callQwen({
      model: "qwen-plus",
      input: {
        messages: [
          {
            role: "system",
            content: `
Return ONLY JSON.

{
  "director": {
    "coreAngle": "",
    "creativeLens": ""
  },
  "ideas": [
    {
      "title": "",
      "reason": "",
      "tags": ["", "", ""],
      "imagePrompt": ""
    },
    {
      "title": "",
      "reason": "",
      "tags": ["", "", ""],
      "imagePrompt": ""
    },
    {
      "title": "",
      "reason": "",
      "tags": ["", "", ""],
      "imagePrompt": ""
    }
  ]
}
            `.trim()
          },
          {
            role: "user",
            content: `Topic: ${input} | Style: ${style}`
          }
        ]
      },
      parameters: { temperature: 0.9 }
    });

    const raw =
      data.output?.text ||
      data.output?.choices?.[0]?.message?.content ||
      "";

    const parsed = safeParse(raw);

    res.json(parsed || { director: {}, ideas: [] });

  } catch (e) {
    res.status(500).json({ error: "server_error" });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`RUNNING on port ${PORT}`);
});