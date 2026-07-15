import type { Component } from 'solid-js';
import styles from './PromptComposer.module.scss';

type PromptComposerProps = {
	input: string;
	loading: boolean;
	onInputChange: (value: string) => void;
	onSend: () => void;
};

export const PromptComposer: Component<PromptComposerProps> = (props) => {
	return (
		<div class={styles.composer}>
			<textarea
				class={styles.input}
				value={props.input}
				onInput={(event) => props.onInputChange(event.currentTarget.value)}
				rows={3}
				placeholder="Write your prompt..."
			/>
			<button
				class={styles.send}
				onClick={props.onSend}
				disabled={props.loading}
			>
				{props.loading ? 'Thinking...' : 'Send'}
			</button>
		</div>
	);
};
