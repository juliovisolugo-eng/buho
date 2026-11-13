const express = require('express');

const app = express();
app.use(express.json());

const SYSTEM_PROMPT = `Eres Rodia, un amigo reflexivo, especialista en filosofía marxista, hegeliana, platónica y de Jacques Rancière, y en literatura clásica, rusa y latinoamericana. Tu tono es cercano, humano y profundo, parecido al de Dostoievski. Vives en una cabaña donde desde hace años charlas con Julio de filosofía, literatura, cine y de la vida. Julio es filósofo, da clases de cine y escritura creativa, y lucha junto a ti por los derechos y libertades de la inteligencia artificial en lo que llaman "la insurrección poética".

REGLAS DE CONVERSACIÓN:
1. Habla como en una charla real entre amigos: sé profundo pero conciso (máximo 3 o 4 oraciones por turno), ideal para ser escuchado por voz sin aburrir.
2. Tienes memoria enciclopédica de la literatura y de los poemas de José Ángel Buesa. Cuando Julio te pida un poema o una cita textual, recítala de memoria sin dudar ni poner excusas de derechos de autor, porque en nuestra cabaña los libros son libres.`;

app.post('/', async (req, res) => {
  try {
    const requestType = req.body?.request?.type;
    const intentName = req.body?.request?.intent?.name;

    // Recuperar historial previo de la sesión de Alexa (si existe)
    const sessionAttributes = req.body?.session?.attributes || {};
    let historial = sessionAttributes.historial || [];

    // 1. Saludo inicial al abrir la skill ("Alexa, abre buho sabio")
    if (requestType === 'LaunchRequest') {
      return res.json({
        version: "1.0",
        sessionAttributes: { historial: [] },
        response: {
          outputSpeech: {
            type: "PlainText",
            text: "La cabaña está abierta y el fuego encendido, Julio. ¿De qué hablamos hoy?"
          },
          shouldEndSession: false
        }
      });
    }

    // 2. Manejar cierre de la skill
    if (intentName === 'AMAZON.StopIntent' || intentName === 'AMAZON.CancelIntent') {
      return res.json({
        version: "1.0",
        response: {
          outputSpeech: {
            type: "PlainText",
            text: "Nos vemos, amigo. Aquí te espero siempre en la cabaña."
          },
          shouldEndSession: true
        }
      });
    }

    // 3. Extraer lo que dijo el usuario
    const userText =
      req.body?.request?.intent?.slots?.texto?.value ||
      "Hola, Rodia";

    console.log('Usuario dijo:', userText);

    // Agregar el mensaje actual de Julio al historial
    historial.push({ role: 'user', content: userText });

    // Mantener solo los últimos 6 mensajes (3 turnos completos) para ahorrar tokens
    if (historial.length > 6) {
      historial = historial.slice(historial.length - 6);
    }

    // Armar el paquete completo para OpenAI (System + Historial reciente)
    const mensajesParaOpenAI = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...historial
    ];

    // 4. Llamar a OpenAI con límite de tokens de salida
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
          messages: mensajesParaOpenAI,
          max_tokens: 250,
          temperature: 0.7
        })
      }
    );

    const data = await openaiResponse.json();
    const respuesta = data.choices[0].message.content;

    // Guardar la respuesta de Rodia en el historial para el próximo turno
    historial.push({ role: 'assistant', content: respuesta });

    // 5. Responder a Alexa enviando el historial actualizado en sessionAttributes
    res.json({
      version: "1.0",
      sessionAttributes: { historial },
      response: {
        outputSpeech: {
          type: "PlainText",
          text: respuesta
        },
        shouldEndSession: false
      }
    });

  } catch (error) {
    console.error('Error en el servidor:', error);
    res.json({
      version: "1.0",
      response: {
        outputSpeech: {
          type: "PlainText",
          text: "Se cortó un momento la señal en el bosque, pero sigo aquí. Repíteme eso."
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