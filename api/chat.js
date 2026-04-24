export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ reply: "Método no permitido" });

  const { message } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  // Probamos con la ruta v1beta pero asegurándonos de que el nombre del modelo sea el correcto
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: `Eres un profesor de matemáticas de secundaria. Responde a: ${message}` }]
        }]
      })
    });

    const data = await response.json();
    
    if (data.error) {
      // Si falla la v1beta, intentamos la v1 automáticamente aquí mismo
      const fallbackUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`;
      const fallbackRes = await fetch(fallbackUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: message }] }]
        })
      });
      const fallbackData = await fallbackRes.json();
      
      if (fallbackData.error) {
        return res.status(500).json({ reply: "Error de Google: " + fallbackData.error.message });
      }
      return res.status(200).json({ reply: fallbackData.candidates[0].content.parts[0].text });
    }

    const botReply = data.candidates?.[0]?.content?.parts?.[0]?.text || "La IA no devolvió texto.";
    res.status(200).json({ reply: botReply });

  } catch (error) {
    res.status(500).json({ reply: "Error de conexión." });
  }
}
