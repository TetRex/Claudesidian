import type { MessageParam } from "@anthropic-ai/sdk/resources/messages";
import type { StreamCallbacks, ToolDefinition, ToolExecutor } from "./claude-client";
import { OpenAICompatibleClient } from "./openai-compatible";

export class OllamaClient extends OpenAICompatibleClient {
	private baseUrl: string;
	private model: string;

	constructor(baseUrl: string, model: string) {
		super({
			baseUrl: `${baseUrl.replace(/\/$/, "")}/v1`,
			model,
			providerName: "Ollama",
		});
		this.baseUrl = baseUrl.replace(/\/$/, "");
		this.model = model;
	}

	async testConnection(): Promise<void> {
		let response: Response;
		try {
			response = await fetch(`${this.baseUrl}/api/tags`);
		} catch {
			throw new Error(`Cannot connect to Ollama at ${this.baseUrl}. Make sure Ollama is running.`);
		}
		if (!response.ok) {
			throw new Error(`Ollama returned ${response.status}. Make sure Ollama is running.`);
		}
	}

	async streamMessage(
		systemPrompt: string,
		messages: MessageParam[],
		callbacks: StreamCallbacks,
		tools?: ToolDefinition[],
		toolExecutor?: ToolExecutor
	): Promise<MessageParam[]> {
		const wrappedCallbacks: StreamCallbacks = {
			...callbacks,
			onUsage: () => callbacks.onUsage?.(0, 0),
		};

		return super.streamMessage(
			systemPrompt,
			messages,
			wrappedCallbacks,
			tools,
			toolExecutor
		);
	}
}
