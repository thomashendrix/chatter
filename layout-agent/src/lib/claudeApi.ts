export type ModelOption = {
	id: string;
	display_name: string;
};

export type ChatMessage = {
	role: 'user' | 'assistant';
	content: string;
};

const API_BASE_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

export async function listModels(): Promise<ModelOption[]> {
	const response = await fetch(`${API_BASE_URL}/models`);
	if (!response.ok) {
		throw new Error('Unable to load models');
	}

	const payload = await response.json();
	return payload.models ?? [];
}

export async function generateResponse(args: {
	prompt: string;
	model?: string;
	maxTokens?: number;
	history?: ChatMessage[];
}): Promise<{ model: string; response: string }> {
	const promptWithHistory = buildConversationPrompt(args.prompt, args.history ?? []);

	const response = await fetch(`${API_BASE_URL}/generate`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			prompt: promptWithHistory,
			model: args.model,
			max_tokens: args.maxTokens ?? 1000,
		}),
	});

	if (!response.ok) {
		const errorPayload = await response.json().catch(() => ({}));
		throw new Error(errorPayload.detail || 'Generation failed');
	}

	return response.json();
}

export async function streamResponse(args: {
	prompt: string;
	model?: string;
	maxTokens?: number;
	history?: ChatMessage[];
	onChunk: (chunk: string) => void;
}): Promise<void> {
	const promptWithHistory = buildConversationPrompt(args.prompt, args.history ?? []);

	const response = await fetch(`${API_BASE_URL}/generate/stream`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			prompt: promptWithHistory,
			model: args.model,
			max_tokens: args.maxTokens ?? 1000,
		}),
	});

	if (!response.ok) {
		const errorPayload = await response.text().catch(() => '');
		throw new Error(errorPayload || 'Streaming failed');
	}

	const reader = response.body?.getReader();
	if (!reader) {
		throw new Error('Streaming is not supported by this browser');
	}

	const decoder = new TextDecoder();

	while (true) {
		const { done, value } = await reader.read();
		if (done) {
			break;
		}

		const chunk = decoder.decode(value, { stream: true });
		if (chunk) {
			args.onChunk(chunk);
		}
	}

	decoder.decode();
}

export function buildConversationPrompt(prompt: string, history: ChatMessage[]): string {
	if (history.length === 0) {
		return prompt;
	}

	const formattedHistory = history
		.map((message) => `${message.role === 'user' ? 'User' : 'Assistant'}: ${message.content}`)
		.join('\n');

	return `Conversation history:\n${formattedHistory}\n\nUser: ${prompt}`;
}
