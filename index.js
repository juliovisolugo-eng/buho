const express = require('express');
const app = express();

app.use(express.json());

app.post('/', (req, res) => {
  console.log('Solicitud recibida desde Alexa');

  // Extraer lo que dijo el usuario (si existe)
  let textoUsuario = 'Te escucho. Dime algo.';

  try {
    const request = req.body.request;

    if (
      request &&
      request.type === 'IntentRequest' &&
      request.intent &&
      request.intent.slots &&
      request.intent.slots.texto &&
      request.intent.slots.texto.value
    ) {
      textoUsuario = `Dijiste: ${request.intent.slots.texto.value}`;
    }
  } catch (e) {
    console.log('No se pudo leer el mensaje del usuario');
  }

  res.json({
    version: "1.0",
    response: {
      outputSpeech: {
        type: "PlainText",
        text: textoUsuario
      },
      shouldEndSession: false
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Búho escuchando en puerto ${PORT}`);
});