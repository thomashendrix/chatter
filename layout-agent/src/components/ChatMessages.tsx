import { For, Show } from 'solid-js';
import type { Component } from 'solid-js';
import type { ChatMessage } from '../lib/claudeApi';
import { renderMarkdown } from '../lib/markdown';
import styles from './ChatMessages.module.scss';

type ChatMessagesProps = {
	messages: ChatMessage[];
	loading: boolean;
};

export const ChatMessages: Component<ChatMessagesProps> = (props) => {
	return (
		<div class={styles.list}>
			<Show
				when={props.messages.length > 0}
				fallback={<div class={styles.empty}>Start a conversation...</div>}
			>
				<For each={props.messages}>{(message) => (
					<div
						class={styles.message}
						classList={{
							[styles.user]: message.role === 'user',
							[styles.assistant]: message.role === 'assistant',
						}}
					>
						<div
							class={styles.content}
							classList={{ [styles.plain]: message.role === 'user' }}
							innerHTML={message.role === 'user' ? message.content : renderMarkdown(message.content)}
						/>
					</div>
				)}</For>
			</Show>
			<Show when={props.loading}>
				<div class={styles.loading}>Thinking…</div>
			</Show>
		</div>
	);
};
