# Chatter

A local Claude chat studio: a SolidJS front end paired with a thin FastAPI proxy to the Anthropic API. Conversations stay in the browser; the API key never leaves your machine.

---

## What it is

Chatter is a small, intentional workspace for talking to Claude models you choose from a local catalog. It favours clarity over chrome: multi-conversation history, streamed replies, markdown rendering, and a **Voir les détails** panel that surfaces which model answered, when, and any extended reasoning the API returned.

| Layer | Stack | Role |
| --- | --- | --- |
| **UI** | SolidJS · Vite · SCSS modules · `@solidjs/router` | Chat shell, sidebar, streaming transcript |
| **API** | FastAPI · Anthropic Python SDK | Model list, generate, NDJSON stream (+ adaptive thinking) |
| **State** | `localStorage` | Conversation persistence across reloads |

```
Browser (layout-agent :3000)
        │  /api/*
        ▼
Vite proxy ──► FastAPI (server :8000) ──► Anthropic
```

---

## Repository layout

```
.
├── layout-agent/          # SolidJS client
│   └── src/
│       ├── components/    # Sidebar, messages, composer, message details
│       ├── lib/           # API client, markdown, conversations
│       └── styles/        # Shared SCSS tokens
├── server/
│   ├── layout-agent.py    # FastAPI app + CLI
│   └── models.txt         # Local model catalog (id | display name)
├── prompts-log.md         # Agent prompt journal (project tooling)
└── .cursor/               # Project rules & skills
```

Put your Anthropic key in `server/apikey.txt` (or root `apikey.txt` — both are gitignored). Never commit secrets.

---

## Prerequisites

- **Node.js** 18+ (npm is fine)
- **Python** 3.10+ with `anthropic`, `fastapi`, and `uvicorn`
- A valid Anthropic API key

```bash
pip install anthropic fastapi uvicorn
```

---

## Quick start

### 1. API server

```bash
# From the repo root — create the key file once
echo YOUR_ANTHROPIC_API_KEY > server/apikey.txt

python server/layout-agent.py --serve --host 127.0.0.1 --port 8000
```

Optional CLI:

```bash
python server/layout-agent.py --list-models
python server/layout-agent.py --model claude-sonnet-5 --prompt "Say hello."
```

### 2. Front end

```bash
cd layout-agent
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Vite proxies `/api` to `http://127.0.0.1:8000`.

Override the API base with `VITE_API_URL` if you do not use the proxy.

---

## Features

- **Multi-conversation UI** — create, switch, and resume chats stored locally
- **Model picker** — driven by `server/models.txt`
- **Streaming replies** — NDJSON events: `meta`, `thinking`, `text`, `error`
- **Reply details** — model label, completion timestamp, reasoning when present
- **Markdown** — assistant messages rendered via `marked`, with compact typography tuned for chat

---

## HTTP API

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/health` | Liveness |
| `GET` | `/models` | Catalog from `models.txt` |
| `POST` | `/generate` | Non-streaming `{ prompt, model?, max_tokens? }` → `{ model, response }` |
| `POST` | `/generate/stream` | Streaming NDJSON (`application/x-ndjson`) |

Stream event shapes:

```json
{"type":"meta","model":"claude-sonnet-5"}
{"type":"thinking","text":"..."}
{"type":"text","text":"..."}
{"type":"error","message":"..."}
```

The server requests **adaptive thinking** when supported and falls back to a plain text stream if the model rejects it.

---

## Development notes

- Indentation in `layout-agent` follows project conventions: **tabs**, SolidJS (not React), SCSS modules only.
- Prompt journal: `.cursor/skills/log-prompts` appends to `prompts-log.md` at the repo root.
- Default git branch for this remote: **`master`** (`git push` after the initial upstream is set).

---

## License

MIT (see `layout-agent/package.json`). Treat API keys and conversation contents as private.
