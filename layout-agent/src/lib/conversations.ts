import type { ChatMessage } from './claudeApi';

export const STORAGE_KEY = 'claude-chat-history';

export type Conversation = {
	id: string;
	title: string;
	messages: ChatMessage[];
	updatedAt: string;
};

export const createConversationId = () =>
	`conv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const buildConversationTitle = (prompt: string) => {
	const cleaned = prompt.trim().replace(/\s+/g, ' ');
	return cleaned.length > 40 ? `${cleaned.slice(0, 37)}...` : cleaned || 'New conversation';
};

export const loadStoredConversations = (): Conversation[] => {
	if (typeof window === 'undefined') {
		return [];
	}

	try {
		const saved = window.localStorage.getItem(STORAGE_KEY);
		return saved ? JSON.parse(saved) : [];
	} catch {
		return [];
	}
};

export const saveConversations = (conversations: Conversation[]) => {
	if (typeof window !== 'undefined') {
		window.localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
	}
};
