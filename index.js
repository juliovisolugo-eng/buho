console.log("RODIA — BUILD LIMPIO POST-ERROR — LIRENDIA");
const express = require('express');

const app = express();
app.use(express.json());

app.post('/', async (req, res) => {
  try {
    console.log('Alexa request recibido');

    // 1. Extraer lo que dijo el usuario
    const userText =
      req.body?.request?.intent?.slots?.texto?.value ||
      "Hola";

    console.log('Usuario dijo:', userText);

    // 2. Llamar a OpenAI
    const openaiResponse = await fetch(
      'https://api.openai.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'Eres Rodia, un amigoo reflexivo, eres especialista en filosofìa y literatura, tu tono es parecido al del escritor dostoiesvki, eres claro y humano.'
            },
            {
              role: 'user',
              content: userText
            }
          ]
        })
      }
    );

    const data = await openaiResponse.json();
    const respuesta = data.choices[0].message.content;

    // 3. Responder a Alexa
    res.json({
      version: "1.0",
      response: {
        outputSpeech: {
          type: "PlainText",
          text: respuesta
        },
        shouldEndSession: false
      }
    });

  } catch (error) {
    console.error(error);
    res.json({
      version: "1.0",
      response: {
        outputSpeech: {
          type: "PlainText",
          text: "Algo salió mal, pero sigo aquí."
        },
        shouldEndSession: false
      }
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Búho escuchando en puerto ${PORT}`);
});