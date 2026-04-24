export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ reply: "Método no permitido" });

  const { message } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) return res.status(500).json({ reply: "Falta la API Key en Vercel." });

  // URL corregida para llaves creadas en 2026
  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: `Eres un profesor de matemáticas. Responde a: ${message}` }]
        }]
      })
    });

    const data = await response.json();
    
    // Si esta URL falla, intentamos la v1beta automáticamente
    if (data.error) {
       const betaUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
       const betaRes = await fetch(betaUrl, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ contents: [{ parts: [{ text: message }] }] })
       });
       const betaData = await betaRes.json();
       
       if (betaData.error) {
         return res.status(500).json({ reply: "Error de Google: " + betaData.error.message });
       }
       return res.status(200).json({ reply: betaData.candidates[0].content.parts[0].text });
    }

    const botReply = data.candidates[0].content.parts[0].text;
    res.status(200).json({ reply: botReply });

  } catch (error) {
    res.status(500).json({ reply: "Error de conexión." });
  }
}
