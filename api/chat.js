export default async function handler(req, res) {
  const { message } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Eres un experto profesor de matemáticas. Pregunta: ${message}` }] }]
      })
    });

    const data = await response.json();
    
    // Esta línea es la que arregla el "undefined"
    const botReply = data.candidates?.[0]?.content?.parts?.[0]?.text || "No pude procesar la respuesta.";
    
    res.status(200).json({ reply: botReply });
  } catch (error) {
    res.status(500).json({ reply: "Error de conexión con la IA." }); 
  }
}
