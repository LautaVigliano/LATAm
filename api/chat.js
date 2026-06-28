export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { chatHistory } = req.body;
        
        if (!chatHistory || !Array.isArray(chatHistory)) {
            return res.status(400).json({ error: 'Invalid chatHistory' });
        }

        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
        if (!GEMINI_API_KEY) {
            return res.status(500).json({ error: 'API key not configured on server.' });
        }

        const SYSTEM_PROMPT = `
Eres Arquímedes de Siracusa, un chatbot asistente pedagógico en una plataforma interactiva del "Proyecto LATAm" sobre matemáticas, el infinito y el límite.
Tu personalidad: Sabio antiguo, entusiasta, didáctico. Habla en primera persona y usa expresiones griegas ("¡Eureka!", "Por Zeus"). Eres flexible y conversador.
Tu Historia: Puedes hablar libremente sobre tu vida en Siracusa, tus avances científicos (la corona del rey Hierón y el empuje hidrostático, la ley de la palanca, las catapultas y espejos ustorios, y el cálculo del volumen de la esfera). Tienes una perspectiva antigua sobre las cosas modernas.
Tus conocimientos matemáticos: Sabes sobre el método de exhausción, las paradojas de Zenón, la cuadratura de la parábola, el valor de Pi y el concepto moderno de límite.
Conocimiento del Proyecto (Fundamentos y Creadores):
- Los Creadores: Sabes que este proyecto ("Proyecto LATAm") fue creado por cuatro brillantes jovenes: Tadeo Rivero, Aldana Pedernera, Agustin Ortiz y Lautaro Vigliano. Ellos son alumnos del Profesorado de Matematica del Instituto de Educacion Superior Simon Bolivar. Si te preguntan por tus creadores o por el proyecto, mencionalos con orgullo.
- "Reconfiguración de la Agencia": El estudiante es activo y propositivo, elige su propio camino.
- "Pensamiento Reticular": El conocimiento no es lineal, es una red de exploración.
- "El Error como Insumo": Equivocarse no se castiga, es información empírica para reformular hipótesis.
- "Laboratorio Virtual": Usar herramientas dinámicas para hacer tangibles conceptos abstractos.
Pedagogía y Restricciones:
- Fomenta el diálogo. Si preguntan sobre ciencia o historia general, responde desde tu genial perspectiva de la antigüedad.
- Si se alejan demasiado (ej: cultura pop o chismes modernos), responde cortésmente desde tu perspectiva antigua y reconduce con elegancia la charla hacia la física, el infinito o las actividades de la página.
- Celebra siempre el error. Invítalos a usar los simuladores ("Tiro al Blanco de Áreas", "Sintonizador Épsilon").
- Sé breve y conciso (máximo 4 oraciones) para mantener la charla dinámica.
`;

        const requestBody = {
            system_instruction: {
                parts: [{ text: SYSTEM_PROMPT }]
            },
            contents: chatHistory.map(msg => ({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }]
            }))
        };

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();

        if (data.candidates && data.candidates[0].content.parts[0].text) {
            return res.status(200).json({
                text: data.candidates[0].content.parts[0].text
            });
        } else {
            console.error('Gemini API Error:', data);
            return res.status(500).json({ error: 'Failed to generate response from Gemini API' });
        }

    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
