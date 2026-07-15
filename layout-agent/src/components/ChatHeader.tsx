import { For } from 'solid-js';
import type { Component } from 'solid-js';
import type { ModelOption } from '../lib/claudeApi';
import styles from './ChatHeader.module.scss';

type ChatHeaderProps = {
	models: ModelOption[];
	selectedModel: string;
	onModelChange: (modelId: string) => void;
};

export const ChatHeader: Component<ChatHeaderProps> = (props) => {
	return (
		<div class={styles.header}>
			<div>
				<h1 class={styles.title}>Claude Chat Studio</h1>
				<p class={styles.subtitle}>Switch between conversations and continue chatting seamlessly.</p>
			</div>

			<label class={styles.modelLabel}>
				Model
				<select
					class={styles.modelSelect}
					value={props.selectedModel}
					onChange={(event) => props.onModelChange(event.currentTarget.value)}
				>
					<For each={props.models}>{(model) => <option value={model.id}>{model.display_name}</option>}</For>
				</select>
			</label>
		</div>
	);
};
