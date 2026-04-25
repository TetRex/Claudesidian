# VaultPensieve

AI assistant for Obsidian with a chat sidebar, editor commands, inline answers, and vault-aware tool use.

VaultPensieve lets you talk to Anthropic, OpenAI, Gemini, DeepSeek, or a local Ollama model directly inside your vault. It can read notes, search your vault, create or update files through tools, and help with drafting, rewriting, and summarizing without leaving Obsidian.

## Highlights

- Chat sidebar with streaming responses, model switching, chat history, and note attachment
- Writing commands for continue, summarize, and improve/rewrite flows
- Inline fast answers with `:: question`
- Vault tools for reading, searching, creating, and updating notes
- Provider-level spend tracking for built-in Anthropic, OpenAI, Gemini, and DeepSeek models
- Local Ollama support for private, on-device workflows

## Quick Start

### Install

Copy these files into your vault plugin folder:

```text
<your-vault>/.obsidian/plugins/vault-pensieve/
  main.js
  manifest.json
  styles.css
```

Then in Obsidian:

1. Open `Settings -> Community plugins`
2. Turn off Restricted mode
3. Enable `VaultPensieve`

### Configure

1. Open `Settings -> VaultPensieve`
2. Choose a provider
3. Add the provider API key, or configure Ollama locally
4. Click `Test`
5. Open `VaultPensieve` from the ribbon or command palette

## Providers

### Anthropic

Get an API key at [console.anthropic.com](https://console.anthropic.com).

| Model | Input / output cost per 1M tokens |
|---|---|
| Claude Opus 4.6 | $5.00 / $25.00 |
| Claude Sonnet 4.6 | $3.00 / $15.00 |
| Claude Haiku 4.5 | $1.00 / $5.00 |

### OpenAI

| Model | Input / output cost per 1M tokens |
|---|---|
| GPT-5.5 | $5.00 / $30.00 |
| GPT-5.4 mini | $0.75 / $4.50 |
| GPT-5.4 nano | $0.20 / $1.25 |

### Gemini

| Model | Input / output cost per 1M tokens |
|---|---|
| Gemini 2.5 Pro | $1.25 / $10.00 |
| Gemini 2.5 Flash | $0.30 / $2.50 |
| Gemini 2.5 Flash-Lite | $0.10 / $0.40 |

### DeepSeek

| Model | Input / output cost per 1M tokens |
|---|---|
| DeepSeek V4 Flash | $0.14 / $0.28 |
| DeepSeek V4 Pro | $1.74 / $3.48 |

### Ollama

Ollama runs locally and does not require an API key.

1. Install [Ollama](https://ollama.com/download)
2. Pull the default model:

```bash
ollama pull qwen3.6
```

3. Keep Ollama running at `http://localhost:11434`
4. Click `Test` in plugin settings

VaultPensieve uses `qwen3.6` as the default Ollama model. If the plugin can reach Ollama, installed models appear in a dropdown. If not, you can type a model name manually.

## Features

### Chat Sidebar

Open the chat panel from the ribbon icon or via `Command Palette -> Open VaultPensieve`.

- Model switcher in the header
- Streaming assistant responses
- Attach current note as context
- Saved chat history with resume and delete
- New chat action
- Prompt history with up/down keys
- Monthly usage bar for tracked providers
- Output token count per response
- Settings shortcut from the header

Messages render as Markdown, including headings, lists, links, and code blocks.

### Writing Commands

Available from the command palette:

| Command | Behavior |
|---|---|
| Continue writing | Streams a continuation from the text before the cursor |
| Summarize note | Summarizes the current note |
| Improve / rewrite selection | Rewrites the selected text while keeping intent |

Each command opens a preview modal before applying changes. You can accept, retry, or cancel.

### Fast Answer

Type a line that starts with `::`, for example:

```md
:: what are the main themes of this note?
```

Press `Enter` and VaultPensieve replaces that line with a formatted inline Q/A block while the answer streams into the note.

### Vault Tools

The assistant can use these tools when appropriate:

| Tool | Purpose |
|---|---|
| `list_files` | List files in a folder |
| `read_note` | Read a note |
| `create_note` | Create a note with content |
| `update_note` | Replace note content |
| `search_notes` | Full-text search across notes |
| `get_vault_structure` | Return the folder tree |

When a tool changes the vault, the plugin shows an Obsidian notice.

## Settings

| Setting | Description |
|---|---|
| AI provider | Anthropic, OpenAI, Gemini, DeepSeek, or Ollama |
| API key | Provider-specific key for Anthropic, OpenAI, Gemini, or DeepSeek |
| Model | Provider model selection for the active provider |
| Ollama model | Installed model dropdown or manual model name |
| Custom system prompt | Extra instructions appended to every request |
| Monthly spending limit | Estimated monthly cap in dollars, `0` disables the limit |
| Current usage | Estimated monthly spend for tracked providers |
| Test connection | Verifies the current provider configuration |

## Spending Limits

Spend tracking is available for the built-in Anthropic, OpenAI, Gemini, and DeepSeek model lists. Ollama is not tracked.

You can set a monthly dollar limit in settings. Once the limit is reached, VaultPensieve blocks further requests until the next calendar month.

## How It Works

```text
User input
  -> system prompt assembly
  -> selected provider API
  -> streamed text and optional tool calls
  -> tool execution against the vault
  -> updated response stream
  -> usage accounting for tracked models
```

The non-Anthropic providers use an OpenAI-compatible chat completions flow. Anthropic uses the Claude SDK directly.

## Privacy

- API keys are stored in Obsidian plugin data (`data.json`)
- API keys are not logged by the plugin
- Ollama content stays local unless your Ollama server is remote
- Anthropic, OpenAI, Gemini, and DeepSeek requests send the required note content and prompts to the selected provider

## Development

### Commands

```bash
npm install
npm run dev
npm run lint
npm run build
```

### Local Validation

Minimum validation before shipping:

```bash
npm run lint
npm run build
```

Then load the plugin in:

```text
.obsidian/plugins/vault-pensieve/
```

Recommended manual checks:

- Provider setup and test connection flows
- Chat sidebar behavior
- Model switching
- Saved chat history
- Vault tool execution notices
- Writing command preview flows
- `::` fast answer behavior

## Notes

- Custom system prompt is the main place to define tone, formatting, and vault-specific instructions
- Legacy saved provider model values are migrated forward when possible
- DeepSeek legacy `deepseek-chat` and `deepseek-reasoner` values map to the current DeepSeek V4 model list
