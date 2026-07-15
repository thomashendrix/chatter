import { createEffect, createMemo, createSignal, Show, onMount } from 'solid-js';
import type { Component } from 'solid-js';
import { useNavigate, useParams } from '@solidjs/router';
import { ChatHeader } from './components/ChatHeader';
import { ChatMessages } from './components/ChatMessages';
import { ConversationSidebar } from './components/ConversationSidebar';
import { PromptComposer } from './components/PromptComposer';
import { listModels, streamResponse, type ChatMessage, type ModelOption } from './lib/claudeApi';
import {
	type Conversation,
	buildConversationTitle,
	createConversationId,
	loadStoredConversations,
	saveConversations,
} from './lib/conversations';
import styles from './App.module.scss';

const App: Component = () => {
	const params = useParams();
	const navigate = useNavigate();
	const [models, setModels] = createSignal<ModelOption[]>([]);
	const [selectedModel, setSelectedModel] = createSignal('');
	const [conversations, setConversations] = createSignal<Conversation[]>(loadStoredConversations());
	const [activeConversationId, setActiveConversationId] = createSignal<string | null>(params.id ?? null);
	const [input, setInput] = createSignal('');
	const [loading, setLoading] = createSignal(false);
	const [error, setError] = createSignal('');

	const activeConversation = createMemo(() => {
		const id = activeConversationId();
		return conversations().find((conversation) => conversation.id === id) ?? null;
	});

	const sortedConversations = createMemo(() => {
		return [...conversations()].sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
	});

	createEffect(() => {
		saveConversations(conversations());
	});

	createEffect(() => {
		const requestedId = params.id;
		if (requestedId) {
			setActiveConversationId(requestedId);
			return;
		}

		if (conversations().length > 0) {
			const latestConversation = sortedConversations()[0];
			if (latestConversation) {
				setActiveConversationId(latestConversation.id);
				navigate(`/c/${latestConversation.id}`, { replace: true });
			}
		}
	});

	onMount(async () => {
		try {
			const availableModels = await listModels();
			setModels(availableModels);
			if (availableModels.length > 0 && !selectedModel()) {
				setSelectedModel(availableModels[0].id);
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to load models');
		}

		if (conversations().length === 0) {
			startNewConversation();
		}
	});

	const startNewConversation = () => {
		const newConversation: Conversation = {
			id: createConversationId(),
			title: 'New conversation',
			messages: [],
			updatedAt: new Date().toISOString(),
		};

		setConversations((prev) => [newConversation, ...prev]);
		setActiveConversationId(newConversation.id);
		navigate(`/c/${newConversation.id}`, { replace: true });
	};

	const updateConversation = (conversationId: string, messages: ChatMessage[], title?: string) => {
		setConversations((prev) =>
			prev
				.map((conversation) =>
					conversation.id === conversationId
						? { ...conversation, messages, title: title ?? conversation.title, updatedAt: new Date().toISOString() }
						: conversation,
				)
				.sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt)),
		);
	};

	const sendPrompt = async () => {
		const prompt = input().trim();
		if (!prompt) return;

		const currentConversationId = activeConversationId();
		if (!currentConversationId) {
			startNewConversation();
			return;
		}

		const currentMessages = activeConversation()?.messages ?? [];
		const userMessage: ChatMessage = { role: 'user', content: prompt };
		const nextMessages = [...currentMessages, userMessage];
		const title = buildConversationTitle(prompt);

		updateConversation(currentConversationId, nextMessages, title);
		setInput('');
		setLoading(true);
		setError('');

		try {
			let assistantContent = '';
			let assistantReasoning = '';
			let responseModel = selectedModel();
			let createdAt: string | undefined;

			const buildAssistantMessage = (): ChatMessage => ({
				role: 'assistant',
				content: assistantContent,
				model: responseModel || undefined,
				createdAt,
				reasoning: assistantReasoning || undefined,
			});

			await streamResponse({
				prompt,
				model: selectedModel(),
				history: nextMessages,
				onEvent: (event) => {
					if (event.type === 'meta') {
						responseModel = event.model;
						return;
					}

					if (event.type === 'thinking') {
						assistantReasoning += event.text;
						updateConversation(currentConversationId, [...nextMessages, buildAssistantMessage()], title);
						return;
					}

					if (event.type === 'text') {
						assistantContent += event.text;
						updateConversation(currentConversationId, [...nextMessages, buildAssistantMessage()], title);
						return;
					}

					if (event.type === 'error') {
						throw new Error(event.message);
					}
				},
			});

			createdAt = new Date().toISOString();
			updateConversation(currentConversationId, [...nextMessages, buildAssistantMessage()], title);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to generate response');
		} finally {
			setLoading(false);
		}
	};

	const selectConversation = (conversationId: string) => {
		setActiveConversationId(conversationId);
		navigate(`/c/${conversationId}`);
	};

	return (
		<div class={styles.page}>
			<div class={styles.layout}>
				<ConversationSidebar
					conversations={sortedConversations()}
					activeConversationId={activeConversationId()}
					onSelectConversation={selectConversation}
					onNewConversation={startNewConversation}
				/>

				<main class={styles.main}>
					<ChatHeader
						models={models()}
						selectedModel={selectedModel()}
						onModelChange={setSelectedModel}
					/>

					<div class={styles.panel}>
						<ChatMessages
							messages={activeConversation()?.messages ?? []}
							models={models()}
							loading={loading()}
						/>

						<div class={styles.composerShell}>
							<PromptComposer input={input()} loading={loading()} onInputChange={setInput} onSend={sendPrompt} />
						</div>
					</div>

					<Show when={error()}>
						<div class={styles.error}>{error()}</div>
					</Show>
				</main>
			</div>
		</div>
	);
};

export default App;
