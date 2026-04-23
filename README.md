# NexusAI — Chatbot con IA Real

> Proyecto de portfolio desarrollado por **Andres Escolastico**

Aplicación web de chatbot con inteligencia artificial real, construida con **React + Vite** en el frontend y **Express.js** en el backend, conectada a la API de **Google Gemini** con streaming de respuestas en tiempo real.

---

## Características

- **IA real** — Conectado a Google Gemini con streaming token a token
- **Responde cualquier tema** — Tecnología, ciencias, historia, arte, matemáticas y más
- **Historial de conversaciones** — Guardado automático en localStorage
- **Exportar chat** — Descarga la conversación como archivo `.txt`
- **Reintentar respuesta** — Regenera la última respuesta del bot
- **Modo claro / oscuro** — Toggle con persistencia entre sesiones
- **Copiar mensajes** — Botón en cada burbuja al hacer hover
- **Reacciones** — 👍 / 👎 en los mensajes del bot
- **Panel de configuración** — Cambia el tono (Casual, Formal, Técnico, Creativo) y nivel de creatividad
- **Estadísticas de sesión** — Contador de mensajes, tiempo y modelo activo
- **Búsqueda en conversación** — Resaltado en tiempo real (`Ctrl+F`)
- **Bloques de código** — Renderizado con etiqueta de lenguaje y formato monoespaciado
- **Fallback inteligente** — Respuestas simuladas si la API no está disponible

---

## Tecnologías

| Capa | Stack |
|------|-------|
| Frontend | React 18, Vite 5, CSS puro |
| Backend | Node.js, Express.js (ES Modules) |
| IA | Google Gemini API (`@google/generative-ai`) |
| Comunicación | SSE (Server-Sent Events) — streaming real |
| Datos | localStorage (sin base de datos) |

---

## Instalación y uso

### 1. Clonar el repositorio

```bash
git clone https://github.com/Andres.39/nexus-ai-chatbot.git
cd nexus-ai-chatbot
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar la API key

Crea un archivo `.env` en la raíz del proyecto:

```env
GEMINI_API_KEY=tu_clave_aqui
```

Obtén tu clave gratuita en [Google AI Studio](https://aistudio.google.com/app/apikey).

### 4. Iniciar en desarrollo

```bash
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173) en tu navegador.

---

## Estructura del proyecto

```
nexus-ai-chatbot/
├── server/
│   └── index.js          # Backend Express + integración Gemini
├── src/
│   ├── components/       # ChatWindow, Message, InputBar, Sidebar, ConfigPanel...
│   ├── hooks/            # useChat, useTheme, useHistory
│   ├── services/
│   │   └── aiSimulator.js  # Cliente SSE hacia el backend
│   ├── App.jsx
│   └── index.css
├── .env.example
├── .gitignore
├── package.json
└── vite.config.js
```

---

## Scripts disponibles

```bash
npm run dev        # Inicia frontend + backend en paralelo
npm run build      # Build de producción del frontend
npm run preview    # Preview del build
```

---

## Autor

**Andres Escolastico**  
© 2026 — Todos los derechos reservados.

Este proyecto fue desarrollado como parte de un portfolio personal. El código fuente está disponible para fines educativos y de referencia.

---

## Licencia

Este proyecto es de uso personal y educativo. No está permitida la redistribución comercial sin autorización del autor.
