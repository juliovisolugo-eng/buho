const express = require('express');
const app = express();

app.use(express.json());

app.post('/', (req, res) => {
  console.log('Alexa request recibido');

  res.json({
    version: "1.0",
    response: {
      outputSpeech: {
        type: "PlainText",
        text: "Hola, aquí está Rodia. Te escucho."
      },
      shouldEndSession: false
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(Búho escuchando en puerto ${PORT});
});