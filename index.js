console.log("INDEX.JS CARGADO")
const express = require("express");

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Buho vivo");
});

app.post("/hablar", async (req, res) => {
  try {
    const mensaje = req.body.mensaje;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "Eres Rodia, un interlocutor cálido y reflexivo." },
          { role: "user", content: mensaje }
        ]
      })
    });

    const data = await response.json();

    res.json({
      respuesta: data.choices[0].message.content
    });

  } catch (error) {
    res.status(500).json({ error: "Error hablando con OpenAI" });
  }
});

app.listen(3000, () => {
  console.log("Buho escuchando en puerto 3000");
});
