import { OpenAICompatibleClient } from "./openai-compatible";

export class OpenRouterClient extends OpenAICompatibleClient {
	constructor(apiKey: string, model: string) {
		super({
			baseUrl: "https://openrouter.ai/api/v1",
			model,
			apiKey,
			providerName: "OpenRouter",
			headers: {
				"X-Title": "VaultPensieve",
			},
		});
	}
}
