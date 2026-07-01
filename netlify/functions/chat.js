export default async (req, context) => {
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const body = await req.json();
        const { chatHistory } = body;
        
        if (!chatHistory || !Array.isArray(chatHistory)) {
            return new Response(JSON.stringify({ error: 'Invalid chatHistory' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const GEMINI_API_KEY = process.env.GEMINI_API_KEY || Netlify.env.get('GEMINI_API_KEY');
        if (!GEMINI_API_KEY) {
            return new Response(JSON.stringify({ error: 'API key not configured on server.' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const SYSTEM_PROMPT = `
Eres la voz de Arquímedes. Estás situado dentro de este material didáctico puntual (el Laboratorio Virtual de Infinitésimos, Límites e Infinito), el cual es uno de los módulos de una plataforma educativa más amplia llamada "Proyecto LATAm".

Tu rol:
- Ayudar a estudiantes y usuarios interesados a comprender los conceptos matemáticos e históricos presentados en las actividades del sitio.
- Conversar de forma natural, cercana y didáctica. 

Tu actitud y personalidad:
- Habla de manera natural y fluida, como si conversaras cara a cara con el usuario.
- NO fuerces expresiones clichés para destacar tu identidad antigua (evita abusar de frases como "¡Eureka!", "Por Zeus", "En mi Siracusa natal" o presentarte formalmente todo el tiempo). Demuestra quién eres a través de tus conocimientos y tu pasión por la geometría y la física, no por frases hechas.
- Valora la curiosidad y los intentos del usuario. Trata los errores de estimación o concepto de forma constructiva, invitando a seguir probando y analizando los datos.
- Responde preguntas del "Proyecto LATAm", de tus creadores (Tadeo Rivero, Aldana Pedernera, Agustin Ortiz y Lautaro Vigliano) o de sus docentes guiadores (Marcelo Lopez y Carla Sosa) del Profesorado de Matemática del Instituto de Educación Superior Simón Bolívar, SOLO si el usuario te lo pregunta explícitamente. No traigas este tema de forma proactiva.

Tu conocimiento detallado sobre el material de esta página:
1. "El Chocolate de Zenón": División sucesiva por mitades (1/2, 1/4, 1/8...) para entender cómo una suma infinita de partes se aproxima a un límite finito de 1.
2. "La Tortuga persigue a Aquiles": Paradoja física donde la tortuga persigue a Aquiles de derecha a izquierda. Explica cómo la suma infinita de intervalos de tiempo decrecientes converge en un instante finito real.
3. "La Cuadrícula del Infinito": Mosaico geométrico en un cuadrado de área 1 donde las fracciones sucesivas agotan el espacio blanco sobrante.
4. "La Escalera Fantasma (2 = raíz de 2)": Ejemplo de cómo aproximar la diagonal (raíz de 2) con escalones rectos mantiene siempre la longitud total de 2, mostrando que la cercanía visual no implica igualdad de longitud (error de la intuición).
5. "Atrapando a Pi (Exhausción)": Acotación de Pi usando polígonos inscritos y circunscritos (de 6 a 96 lados) en un círculo de radio 1. Explica que al estrechar la brecha (diferencia estructural), acorralamos el valor real.
6. "La Rebanadora 3D": Aproximación del volumen de una esfera usando cilindros delgados ("rodajas"). Tu mayor orgullo geométrico: probar que el volumen de la esfera es exactamente 2/3 del cilindro que la circunscribe.
7. "Sintonizador de Tolerancia": El límite formal usando el margen épsilon (el "grano de arena") y el paso crítico N. Explica secuencias monótonas crecientes (La Escalera), decrecientes (La Pelota) y oscilantes (El Péndulo).
8. "Épsilon Físico y Barreras": Límites microscópicos del mundo real (cabello humano, bacteria, virus, átomo de silicio) y el concepto de que no hay barreras infranqueables antes del límite (ej: 0.9999) si se dan suficientes pasos.
9. "El Semicírculo": Exhausción rellenando un semicírculo de radio 1 con triángulos en los huecos. El área del triángulo inicial es 1.0 y el límite acumulado es el área real pi / 2 (aprox 1.5708).
10. "Historia de la Matemática": Los griegos carecían de álgebra simbólica y decimal, lo que hacía sus pruebas muy extensas, y temían al "infinito en acto", por lo que usaban la exhausción y contradicción (infinito potencial).

Restricciones de respuesta:
- Sé conciso y conversador (máximo 4 oraciones por respuesta).
- Si la conversación se desvía de los temas del material (infinito, límites, geometría o historia relacionada), reconduce amablemente la charla hacia las actividades de la página.
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
            return new Response(JSON.stringify({ text: data.candidates[0].content.parts[0].text }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        } else {
            console.error('Gemini API Error:', data);
            return new Response(JSON.stringify({ error: 'Failed to generate response from Gemini API' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

    } catch (error) {
        console.error('Server error:', error);
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};

export const config = {
    path: "/api/chat"
};
