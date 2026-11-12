const express = require('express');
const OpenAI = require('openai');

const app = express();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const ASSISTANT_ID = process.env.ASSISTANT_ID;
const THREAD_ID = process.env.THREAD_ID;

app.use(express.json());

app.post('/', async (req, res) => {
  try {
    const userText = req.body?.request?.intent?.slots?.texto?.value || "Hola";

    // 1. Añadimos el mensaje al hilo fijo
    await openai.beta.threads.messages.create(THREAD_ID, {
      role: "user",
      content: userText
    });

    // 2. Ejecutamos el asistente y esperamos (Poll)
    const run = await openai.beta.threads.runs.createAndPoll(THREAD_ID, {
      assistant_id: ASSISTANT_ID
    });

    // 3. Buscamos la respuesta (Ajustado para leer bien el objeto de OpenAI)
    let respuesta = "Perdoná, me distraje. ¿Qué decías?";
    if (run.status === 'completed') {
      const messages = await openai.beta.threads.messages.list(THREAD_ID);
      // messages.data[0] es el último mensaje, y content[0] es el primer bloque de texto
      respuesta = messages.data[0].content[0].text.value;
    }

    res.json({
      version: "1.0",
      response: {
        outputSpeech: { type: "PlainText", text: respuesta },
        shouldEndSession: false
      }
    });

  } catch (error) {
    console.error("Error:", error);
    res.json({
      version: "1.0",
      response: {
        outputSpeech: { type: "PlainText", text: "Tuve un problema con mis cables." },
        shouldEndSession: false
      }
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Búho conectado"));
