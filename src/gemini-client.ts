import { OpenAICompatibleClient } from "./openai-compatible";

export class GeminiClient extends OpenAICompatibleClient {
	constructor(apiKey: string, model: string) {
		super({
			baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai",
			model,
			apiKey,
			providerName: "Gemini",
		});
	}
}
