# Claude API Usage

## Start the server

From the project folder, run:

```powershell
python .\quickstart.py --serve
```

By default the API runs on http://127.0.0.1:8000.

You can also choose another port:

```powershell
python .\quickstart.py --serve --port 8001
```

## Endpoints

### Health check

```powershell
Invoke-RestMethod -Uri "http://127.0.0.1:8000/health"
```

### List available models

```powershell
Invoke-RestMethod -Uri "http://127.0.0.1:8000/models"
```

### Generate a response

```powershell
$body = @{ prompt = "Say hello in one short sentence."; model = "claude-sonnet-5" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://127.0.0.1:8000/generate" -Method Post -ContentType "application/json" -Body $body
```

## Example response

```json
{
  "model": "claude-sonnet-5",
  "response": "Hello there!"
}
```
