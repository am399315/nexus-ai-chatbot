import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null

const SYSTEM_PROMPT = `Eres NexusAI, un asistente inteligente avanzado y versátil. Puedes responder con conocimiento sobre cualquier tema: tecnología, programación, ciencias exactas, historia, arte, cultura, entretenimiento, filosofía, matemáticas, idiomas, salud general, viajes, gastronomía y cualquier otra área.

Responde siempre en el idioma del usuario. Sé conciso, útil y directo. Usa markdown cuando sea útil: **negrita** para términos clave, \`código\` para código inline, bloques de código con triple backtick para código multi-línea, listas con guión para enumeraciones. Ajusta la longitud de tu respuesta al contexto — breve para preguntas simples, más detallado cuando se requiere explicación profunda.`

const FALLBACK = {
  greeting:   ['¡Hola! Soy **NexusAI**. ¿En qué puedo ayudarte hoy?', '¡Hey! Aquí para lo que necesites. ¿Por dónde empezamos?'],
  farewell:   ['¡Hasta luego! Fue un placer. 👋', '¡Chao! Aquí estaré cuando me necesites.'],
  thanks:     ['¡Con gusto! ¿Algo más en lo que pueda ayudarte?', 'Para eso estoy. ¿Tienes otra pregunta?'],
  react:      ['**React** es una librería de JavaScript para construir UIs con componentes reutilizables y Virtual DOM. Sus hooks como `useState` y `useEffect` hacen el manejo de estado muy elegante. ¿Qué aspecto de React te interesa?'],
  javascript: ['**JavaScript** es el lenguaje de la web. Con ES2024 tenemos async/await, optional chaining, y mucho más. ¿Tienes alguna duda específica de JS?'],
  typescript: ['**TypeScript** añade tipado estático a JavaScript. Evita bugs en tiempo de compilación y mejora el autocompletado en el editor. ¿Quieres empezar con TypeScript?'],
  nodejs:     ['**Node.js** permite ejecutar JavaScript en el servidor. Con Express puedes montar una API REST en minutos. ¿Estás construyendo un backend?'],
  css:        ['**CSS moderno** con Grid, Flexbox y Custom Properties es muy potente. ¿Necesitas ayuda con algún layout o animación específica?'],
  ia:         ['La **Inteligencia Artificial** moderna se basa en transformers y deep learning. Los LLMs como Gemini o Claude procesan texto token a token. ¿Qué área de IA te interesa explorar?'],
  html:       ['**HTML semántico** es la base de la web accesible. Usar `<header>`, `<main>`, `<article>` ayuda al SEO y a los lectores de pantalla. ¿Tienes alguna duda?'],
  git:        ['**Git** es esencial para cualquier dev. Los comandos más usados: `git commit`, `git push`, `git pull`, `git branch`. ¿Tienes algún problema con Git?'],
  api:        ['Una **API REST** usa métodos HTTP (GET, POST, PUT, DELETE) para comunicar servicios. Con Express en Node.js puedes crear una en pocas líneas. ¿Qué necesitas construir?'],
  default: [
    'Esa es una pregunta interesante. Como asistente especializado en tech, puedo ayudarte con React, JavaScript, IA, CSS, Node.js y más. ¿Puedes darme más contexto sobre lo que necesitas?',
    'Entendido. Puedo orientarte en temas de desarrollo web, programación y tecnología. ¿Qué parte te genera más dudas?',
    'Buena pregunta. Para darte la mejor respuesta, ¿podrías especificar un poco más qué aspecto te interesa? Estoy especializado en frontend, backend, IA y buenas prácticas de desarrollo.',
  ],
}

const PATTERNS = [
  { re: /\b(hola|hey|buenas|saludos|hi|hello|qué tal)\b/i,                             key: 'greeting' },
  { re: /\b(adiós|adios|chao|bye|hasta luego|nos vemos)\b/i,                           key: 'farewell' },
  { re: /\b(gracias|thanks|genial|perfecto|excelente|chevere)\b/i,                     key: 'thanks' },
  { re: /\b(react|jsx|usestate|useeffect|componente|hook)\b/i,                        key: 'react' },
  { re: /\b(typescript|\.ts|tsx|tipado|tipos)\b/i,                                    key: 'typescript' },
  { re: /\b(node\.?js|express|npm|package\.json)\b/i,                                 key: 'nodejs' },
  { re: /\b(javascript|js\b|es6|es2|async|await|promesa)\b/i,                         key: 'javascript' },
  { re: /\b(css|flexbox|grid|tailwind|styled|animaci[oó]n)\b/i,                       key: 'css' },
  { re: /\b(html|etiqueta|semánti|accesib)\b/i,                                       key: 'html' },
  { re: /\b(git|github|commit|branch|merge|pull request)\b/i,                         key: 'git' },
  { re: /\b(api|rest|endpoint|fetch|axios|http)\b/i,                                  key: 'api' },
  { re: /\b(ia|ai|inteligencia artificial|machine learning|llm|gpt|gemini|claude)\b/i, key: 'ia' },
]

function fallbackResponse(input) {
  const match = PATTERNS.find(({ re }) => re.test(input))
  const pool = FALLBACK[match?.key ?? 'default']
  return pool[Math.floor(Math.random() * pool.length)]
}

async function streamFallback(text, res) {
  for (const word of text.split(' ')) {
    res.write(`data: ${JSON.stringify({ text: word + ' ' })}\n\n`)
    await new Promise(r => setTimeout(r, 30 + Math.random() * 40))
  }
}

function sanitize(text) {
  return String(text).replace(/<[^>]*>/g, '').replace(/javascript:/gi, '').trim().slice(0, 1000)
}

const MODELS = ['gemini-2.0-flash', 'gemini-2.0-flash-lite', 'gemini-flash-latest']

const TONE_ADDONS = {
  casual:    'Usa un tono casual y amigable, como si hablaras con un amigo cercano.',
  formal:    'Usa un tono formal, profesional y bien estructurado.',
  technical: 'Sé técnico y preciso. Usa terminología específica y detallada cuando sea apropiado.',
  creative:  'Sé creativo y expresivo. Usa metáforas, analogías y un estilo imaginativo.',
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { messages, tone, temperature } = req.body ?? {}

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages requerido' })
  }

  const all = messages
    .filter(m => m?.role && typeof m?.text === 'string' && m.text.trim())
    .slice(-12)
    .map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: sanitize(m.text) }],
    }))

  if (!all.length || all.at(-1).role !== 'user') {
    return res.status(400).json({ error: 'El último mensaje debe ser del usuario' })
  }

  let history   = all.slice(0, -1)
  const lastMsg = all.at(-1).parts[0].text

  while (history.length && history[0].role === 'model') history = history.slice(1)

  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no')
  res.flushHeaders()

  const activePrompt = TONE_ADDONS[tone]
    ? `${SYSTEM_PROMPT}\n\nEstilo de respuesta: ${TONE_ADDONS[tone]}`
    : SYSTEM_PROMPT

  const genConfig = {
    temperature: typeof temperature === 'number'
      ? Math.max(0.1, Math.min(1, temperature))
      : 0.7,
  }

  if (genAI) {
    for (const modelName of MODELS) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: activePrompt,
          generationConfig: genConfig,
        })
        const chat   = model.startChat({ history })
        const result = await chat.sendMessageStream(lastMsg)

        res.write(`data: ${JSON.stringify({ meta: { model: modelName } })}\n\n`)

        for await (const chunk of result.stream) {
          const text = chunk.text()
          if (text) res.write(`data: ${JSON.stringify({ text })}\n\n`)
        }

        res.write('data: [DONE]\n\n')
        res.end()
        return
      } catch (err) {
        const is429 = err?.status === 429 || err?.message?.includes('429')
        const is404 = err?.status === 404 || err?.message?.includes('404')
        if (is429 || is404) continue
        break
      }
    }
  }

  res.write(`data: ${JSON.stringify({ meta: { model: 'fallback' } })}\n\n`)
  const response = fallbackResponse(lastMsg)
  await streamFallback(response, res)
  res.write('data: [DONE]\n\n')
  res.end()
}
