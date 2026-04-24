export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ reply: "Método no permitido" });

  const { message } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) return res.status(500).json({ reply: "Falta la API Key en Vercel." });

  // Cambiamos a gemini-1.5-pro y versión v1 estable
  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: `Eres un profesor de matemáticas. Responde de forma clara a: ${message}` }]
        }]
      })
    });

    const data = await response.json();
    
    // Si el modelo Pro también falla, intentamos una última ruta genérica
    if (data.error) {
       const fallbackUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
       const fallbackRes = await fetch(fallbackUrl, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ contents: [{ parts: [{ text: message }] }] })
       });
       const fallbackData = await fallbackRes.json();
       
       if (fallbackData.error) {
         return res.status(500).json({ reply: "Error de Google: " + fallbackData.error.message });
       }
       return res.status(200).json({ reply: fallbackData.candidates[0].content.parts[0].text });
    }

    const botReply = data.candidates[0].content.parts[0].text;
    res.status(200).json({ reply: botReply });

  } catch (error) {
    res.status(500).json({ reply: "Error de conexión." });
  }
}
