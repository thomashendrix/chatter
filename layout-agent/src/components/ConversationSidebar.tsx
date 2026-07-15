import { For } from 'solid-js';
import type { Component } from 'solid-js';
import type { Conversation } from '../lib/conversations';
import { RelativeTime } from './RelativeTime';
import styles from './ConversationSidebar.module.scss';

type ConversationSidebarProps = {
	conversations: Conversation[];
	activeConversationId: string | null;
	onSelectConversation: (conversationId: string) => void;
	onNewConversation: () => void;
};

export const ConversationSidebar: Component<ConversationSidebarProps> = (props) => {
	return (
		<aside class={styles.sidebar}>
			<div class={styles.header}>
				<strong class={styles.title}>Past conversations</strong>
				<button class={styles.newButton} onClick={props.onNewConversation}>
					New
				</button>
			</div>

			<div class={styles.list}>
				<For each={props.conversations}>{(conversation) => (
					<button
						class={styles.item}
						classList={{ [styles.active]: props.activeConversationId === conversation.id }}
						onClick={() => props.onSelectConversation(conversation.id)}
					>
						<div class={styles.itemTitle}>{conversation.title}</div>
						<RelativeTime class={styles.itemMeta} date={conversation.updatedAt} />
					</button>
				)}</For>
			</div>
		</aside>
	);
};
