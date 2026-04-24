export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ reply: "Método no permitido" });

  const { message } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) return res.status(500).json({ reply: "Falta la API Key en Vercel." });

  // Usamos el modelo 'latest' que es el más compatible
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: `Eres un profesor de matemáticas de colegio. Responde a: ${message}` }]
        }]
      })
    });

    const data = await response.json();
    
    if (data.error) {
      return res.status(500).json({ reply: "Error de Google: " + data.error.message });
    }

    if (!data.candidates || data.candidates.length === 0) {
      return res.status(500).json({ reply: "La IA no generó una respuesta válida." });
    }

    const botReply = data.candidates[0].content.parts[0].text;
    res.status(200).json({ reply: botReply });

  } catch (error) {
    res.status(500).json({ reply: "Error de conexión con el servidor de Google." });
  }
}
