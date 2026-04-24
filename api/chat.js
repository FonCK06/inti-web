export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ reply: "Método no permitido" });
  }

  const { message } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ reply: "Error: No se encontró la API Key en Vercel." });
  }

  // HEMOS CAMBIADO v1beta POR v1 AQUÍ:
  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: `Eres un experto profesor de matemáticas de colegio. Responde de forma clara y paso a paso en español: ${message}` }]
        }]
      })
    });

    const data = await response.json();
    
    if (data.error) {
      return res.status(500).json({ reply: "Error de Google: " + data.error.message });
    }

    const botReply = data.candidates?.[0]?.content?.parts?.[0]?.text || "La IA no devolvió texto.";
    res.status(200).json({ reply: botReply });

  } catch (error) {
    res.status(500).json({ reply: "Error de conexión con el servidor." });
  }
}
