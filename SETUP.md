# PaperPilot Setup Guide

## Quick Start with Ollama

### 1. Install Ollama

**macOS:**
```bash
brew install ollama
```

**Linux:**
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

**Windows:**
Download from [ollama.ai](https://ollama.ai/download)

### 2. Start Ollama Service

```bash
ollama serve
```

Keep this terminal running. Ollama will start on `http://localhost:11434` by default.

### 3. Download a Model

**Recommended: llama3.2:3b** (Fast, good for structured JSON extraction)
```bash
ollama pull llama3.2:3b
```

**Alternative Models:**

For better quality (slower):
```bash
ollama pull llama3.1:8b      # Better quality, larger
ollama pull mistral:7b        # Excellent at following instructions
ollama pull llama3.3:8b      # Latest model
```

### 4. Verify Installation

Check if Ollama is running:
```bash
curl http://localhost:11434/api/tags
```

You should see a list of downloaded models.

### 5. Configure PaperPilot (Optional)

Create `.env.local` in the project root:
```bash
# Optional: Change Ollama API URL (default: http://localhost:11434)
OLLAMA_API_URL=http://localhost:11434

# Optional: Change model (default: llama3.2:3b)
OLLAMA_MODEL=llama3.2:3b
```

### 6. Start PaperPilot

```bash
npm run dev
```

The app will automatically use Ollama for concept extraction. If Ollama is not running, it will fall back to mock concepts.

## Model Recommendations

| Model | Size | Speed | Quality | Best For |
|-------|------|-------|---------|----------|
| `llama3.2:3b` | 3B | ⚡⚡⚡ | ⭐⭐⭐ | Fast iteration, structured tasks |
| `llama3.1:8b` | 8B | ⚡⚡ | ⭐⭐⭐⭐ | Balanced quality/speed |
| `mistral:7b` | 7B | ⚡⚡ | ⭐⭐⭐⭐ | Following complex instructions |
| `llama3.3:8b` | 8B | ⚡⚡ | ⭐⭐⭐⭐⭐ | Best quality, latest features |

## Troubleshooting

### Ollama not connecting?

1. Make sure Ollama is running: `ollama serve`
2. Check the API URL in `.env.local` matches your Ollama instance
3. Verify the model is downloaded: `ollama list`

### Getting JSON parsing errors?

Some models may wrap JSON in markdown. The code handles this automatically, but if issues persist:
- Try a different model (mistral:7b is excellent at JSON)
- Check the model supports JSON format: `ollama show llama3.2:3b`

### Model too slow?

- Use a smaller model: `llama3.2:3b` or `llama3.2:1b`
- Reduce the number of concepts requested in the prompt
- Consider using a GPU-accelerated setup

## Next Steps

1. Add your first paper using the "Add Paper" button
2. Click on a paper node to expand it into concepts
3. Watch the explosion animation as concepts appear!
4. Citations are automatically fetched from Semantic Scholar

Enjoy exploring research papers spatially! 🚀

