# Atrium

Design agents, save them on this device, and run them against a shared desk.

## Run it

You need Node.js 22.

```bash
npm install
npm run dev
```

Then open http://localhost:8080.

Agents, threads, desk records, and API keys are stored in this browser only. They are not in this repository. A fresh copy starts with the starter teams.

## Models

Open Models in the header.

- OpenRouter, Google AI, GitHub Copilot, xAI, or any other OpenAI-compatible base URL: paste a key. Keys stay in this browser.
- The included Grok key is not in this download. To use xAI without pasting a key, start the app with `XAI_API_KEY` set in the environment and leave "Use the included Grok key" on.
- Ollama and llama-server are called from the browser. For Ollama, set `OLLAMA_ORIGINS` so this page is allowed. For llama.cpp, start llama-server with CORS enabled. From another machine, turn on "Use a tunnel" and paste an https address from Cloudflare or ngrok. Atrium does not start the tunnel.

Runs stop after 4 steps.
