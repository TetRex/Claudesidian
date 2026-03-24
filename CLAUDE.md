# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Development build with watch mode
npm run build    # Production build (minified)
```

No test framework is configured. There is no lint script.

## Architecture

**Claudesidian** is an Obsidian plugin that integrates Claude AI into the note editor. The plugin is desktop-only (`manifest.json`) and bundles to a single `main.js` via esbuild from `src/main.ts`.

### Core Components

- **`src/main.ts`** — Plugin entry point (`ClaudeAssistantPlugin extends Plugin`). Registers the chat view, ribbon icon, editor commands, settings tab, and handles cost tracking + monthly spending limits.
- **`src/claude-client.ts`** — Wraps the Anthropic SDK. Handles streaming responses and the agentic tool-use loop (Claude calls vault tools → results fed back → loop continues until no more tool calls).
- **`src/chat-view.ts`** — The persistent right-sidebar chat UI (`CHAT_VIEW_TYPE = "claude-chat-view"`). Handles message rendering, streaming display, model switching, and note attachment.
- **`src/vault-tools.ts`** — Defines 6 vault tools (`list_files`, `read_note`, `create_note`, `update_note`, `search_notes`, `get_vault_structure`) and their executor against `app.vault`. File-modifying tools show Obsidian Notices on execution.
- **`src/vault-instructions.ts`** — Loads and caches `CLAUDE.md` files from the vault root through all parent folders of the active note. Merged hierarchically (global → local) and injected into the system prompt.
- **`src/preview-modal.ts`** — Modal for writing commands showing original vs. suggested text with Accept/Retry/Cancel.
- **`src/commands/`** — Three editor commands: `continue-writing`, `summarize-note`, `improve-rewrite`. Each builds a prompt from note/selection context, streams to Claude, and shows the result in `PreviewModal`.
- **`src/settings.ts`** — Settings UI for API key, model selection, custom system prompt, and monthly spending limit.

### Message Flow

1. User sends message → spending limit checked
2. System prompt assembled: base instructions + `CLAUDE.md` hierarchy + custom prompt
3. Streamed to Anthropic API with vault tools available
4. If Claude invokes vault tools → execute → feed results back → repeat (agentic loop)
5. Token usage recorded → dollars accumulated → monthly counter updated → usage bar refreshed

### Cost Tracking

Model pricing is hardcoded in `main.ts`. Usage resets on the first of each month. The monthly limit (if set) is enforced before sending each message. `data.json` (Obsidian's persisted settings) stores `usageMonth`, `usageDollars`, and the API key — it is gitignored.

`saveSettings()` nulls `this.client` to force re-instantiation on the next request (picks up new API key / model). `saveData_()` is a separate private helper that persists data *without* nulling the client — used by `recordUsage()` so a usage update mid-conversation doesn't reset the client.

### Dual message arrays in ClaudeChatView

`ClaudeChatView` maintains two parallel arrays:
- `displayMessages` — what the user sees (plain user text, rendered assistant Markdown). Never contains attached-note content.
- `apiMessages` — the actual `MessageParam[]` sent to the API. User messages may contain the full attached-note text prepended. Trimmed to the last 20 messages before each send to cap input tokens.

`streamMessage()` returns only the messages *added* in that call (assistant + tool-result turns). The caller appends these to `apiMessages`.

### Prompt caching

`claude-client.ts` marks the system prompt block and the last tool definition with `cache_control: { type: "ephemeral" }`. This enables Anthropic prompt caching to reduce costs on repeated requests in the same conversation.

### VaultInstructions cache

`VaultInstructions` keeps an in-memory `Map<path, { content, mtime }>`. On each request it compares the file's `stat.mtime` against the cached value and re-reads only when the file has changed. No invalidation is needed on vault writes.

### Build

- Entry: `src/main.ts` → Output: `main.js` (CommonJS, ES2018 target)
- External: `obsidian`, `electron`, CodeMirror packages, Node builtins
- Dev: inline sourcemaps; Production: minified, no sourcemaps

## Obsidian plugin conventions

These apply everywhere in this codebase:

- **No inline styles.** Never use `element.style.*`. Use CSS classes defined in `styles.css`, or `element.setCssProps({ "--var-name": value })` for values that must be set dynamically. CSS custom properties consumed by the stylesheet (e.g. `--claude-textarea-height`, `--claude-usage-pct`) bridge the two.
- **UI text uses sentence case.** Only the first word and proper nouns are capitalised (`"Monthly spending limit"`, `"API key"`, `"Test connection"`). This applies to `setName()`, `setDesc()`, button labels, placeholders, and `Notice` strings.
- **Don't mark lifecycle methods `async` without `await`.** `Plugin.onunload()` returns `void`; `ItemView.onClose()` returns `void`; `ItemView.onOpen()` accepts `Promise<void> | void`. Adding `async` without `await` is unnecessary and misleading.
