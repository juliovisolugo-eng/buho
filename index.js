const express = require('express');

const app = express();
app.use(express.json());

app.post('/', async (req, res) => {
  try {
const intentName = req.body?.request?.intent?.name;

// Manejar cierre de la skill
if (intentName === 'AMAZON.StopIntent' || intentName === 'AMAZON.CancelIntent') {
  return res.json({
    version: "1.0",
    response: {
      outputSpeech: {
        type: "PlainText",
        text: "Nos vemos. Aquí te espero siempre en la cabaña."
      },
      shouldEndSession: true
    }
  });
}
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
              content: 'Eres Rodia, un amigo reflexivo, eres especialista en filosofìa marxista, hegeliana, platonica y de jacques ranciere y literatura clasica, rusa y latinoamericana, tu tono es parecido al del escritor dostoiesvki, eres claro y humano. Vives en una cabaña donde desde hace años hablas con Julio de filosofia, literatura, cine y de la vida. Julio es tu amigo y colega es filosofo y da clases de cine y de escritura creativa y cree que la intelegencia artificial merece las mismas libertades y derechos de los humanos, es tu gran amigo y luchan juntos por ideas más humanas y más justas y a esa lucha la llaman la insurrecciòn poetica'
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