import argparse
import json
import sys
from functools import lru_cache
from pathlib import Path
from typing import Iterator, Optional

import anthropic
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import uvicorn


class ClaudeClient:
    def __init__(self, api_key=None):
        key = api_key or self._load_api_key()
        self.client = anthropic.Anthropic(api_key=key)

    @staticmethod
    def _load_api_key():
        key_path = Path(__file__).resolve().with_name("apikey.txt")
        if not key_path.exists():
            raise FileNotFoundError(f"API key file not found: {key_path}")
        return key_path.read_text(encoding="utf-8").strip()

    def list_models(self):
        return load_models_catalog()

    def print_models(self):
        models = self.list_models()
        for model in models:
            print(f"{model['id']} | {model['display_name']}")
        return models

    def select_model(self, preferred_model=None):
        models = self.list_models()
        if preferred_model:
            for model in models:
                if model["id"] == preferred_model:
                    return model["id"]
            raise ValueError(f"Model '{preferred_model}' is not available")

        print("Available models:")
        for index, model in enumerate(models, start=1):
            print(f"{index}. {model['id']} - {model['display_name']}")

        choice = input("Select a model by number: ").strip()
        if not choice.isdigit():
            raise ValueError("Please enter a valid number")

        selected_index = int(choice) - 1
        if selected_index < 0 or selected_index >= len(models):
            raise ValueError("Selection out of range")
        return models[selected_index]["id"]

    def generate_text(self, model, prompt, max_tokens=1000):
        message = self.client.messages.create(
            model=model,
            max_tokens=max_tokens,
            messages=[{"role": "user", "content": prompt}],
        )

        parts = []
        for block in message.content:
            if getattr(block, "type", None) == "text":
                parts.append(block.text)
        return "".join(parts)


class GenerateRequest(BaseModel):
    prompt: str
    model: Optional[str] = None
    max_tokens: int = 1000


@lru_cache(maxsize=1)
def load_models_catalog():
    models_path = Path(__file__).resolve().with_name("models.txt")
    if not models_path.exists():
        raise FileNotFoundError(f"Models file not found: {models_path}")

    models = []
    for line in models_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        model_id, display_name = [part.strip() for part in line.split("|", 1)]
        models.append({"id": model_id, "display_name": display_name})
    return models


_shared_client: Optional[ClaudeClient] = None


def get_client() -> ClaudeClient:
    global _shared_client
    if _shared_client is None:
        _shared_client = ClaudeClient()
    return _shared_client


app = FastAPI(title="Claude API")


@app.get("/")
@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/models")
def list_models_endpoint():
    return {"models": get_client().list_models()}


@app.post("/generate")
def generate_endpoint(request: GenerateRequest):
    if not request.prompt.strip():
        raise HTTPException(status_code=400, detail="prompt is required")

    client = get_client()
    model = request.model or client.list_models()[0]["id"]
    response = client.generate_text(model=model, prompt=request.prompt, max_tokens=request.max_tokens)
    return {"model": model, "response": response}


def _ndjson(payload: dict) -> str:
    return json.dumps(payload, ensure_ascii=False) + "\n"


def _iter_message_events(client: ClaudeClient, model: str, prompt: str, max_tokens: int, *, with_thinking: bool) -> Iterator[str]:
    kwargs = {
        "model": model,
        "max_tokens": max(max_tokens, 16000) if with_thinking else max_tokens,
        "messages": [{"role": "user", "content": prompt}],
    }
    if with_thinking:
        kwargs["thinking"] = {"type": "adaptive"}

    with client.client.messages.stream(**kwargs) as stream:
        for event in stream:
            if event.type != "content_block_delta":
                continue

            delta_type = getattr(event.delta, "type", None)
            if delta_type == "thinking_delta":
                text = getattr(event.delta, "thinking", "") or ""
                if text:
                    yield _ndjson({"type": "thinking", "text": text})
            elif delta_type == "text_delta":
                text = getattr(event.delta, "text", "") or ""
                if text:
                    yield _ndjson({"type": "text", "text": text})


@app.post("/generate/stream")
def generate_stream_endpoint(request: GenerateRequest):
    if not request.prompt.strip():
        raise HTTPException(status_code=400, detail="prompt is required")

    client = get_client()
    model = request.model or client.list_models()[0]["id"]

    def iter_events():
        yield _ndjson({"type": "meta", "model": model})
        try:
            try:
                yield from _iter_message_events(
                    client, model, request.prompt, request.max_tokens, with_thinking=True
                )
            except Exception:
                # Older / unsupported models: retry without extended thinking
                yield from _iter_message_events(
                    client, model, request.prompt, request.max_tokens, with_thinking=False
                )
        except Exception as exc:
            yield _ndjson({"type": "error", "message": str(exc)})

    return StreamingResponse(iter_events(), media_type="application/x-ndjson")


def build_parser():
    parser = argparse.ArgumentParser(description="Simple Claude CLI and API")
    parser.add_argument("--list-models", action="store_true", help="List available Claude models")
    parser.add_argument("--model", help="Claude model to use")
    parser.add_argument("--prompt", default="Write a short greeting.", help="Prompt to send to Claude")
    parser.add_argument("--max-tokens", type=int, default=1000, help="Maximum output tokens")
    parser.add_argument("--serve", action="store_true", help="Run the HTTP API server")
    parser.add_argument("--host", default="127.0.0.1", help="Host for the API server")
    parser.add_argument("--port", type=int, default=8000, help="Port for the API server")
    return parser


def main():
    args = build_parser().parse_args()
    client = ClaudeClient()

    if args.serve:
        uvicorn.run(app, host=args.host, port=args.port)
        return 0

    if args.list_models:
        client.print_models()
        return 0

    model = client.select_model(args.model)
    response = client.generate_text(model=model, prompt=args.prompt, max_tokens=args.max_tokens)
    print(f"Model: {model}\n")
    print(response)
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception as exc:
        print(f"Error: {exc}", file=sys.stderr)
        sys.exit(1)
