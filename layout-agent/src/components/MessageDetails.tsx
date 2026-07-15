import { Show } from 'solid-js';
import type { Component } from 'solid-js';
import { formatFullDateTime } from '../lib/relativeTime';
import styles from './MessageDetails.module.scss';

type MessageDetailsProps = {
	modelLabel: string;
	createdAt?: string;
	reasoning?: string;
};

export const MessageDetails: Component<MessageDetailsProps> = (props) => {
	return (
		<details class={styles.details}>
			<summary class={styles.summary}>Voir les détails</summary>
			<dl class={styles.meta}>
				<div class={styles.row}>
					<dt>Modèle</dt>
					<dd>{props.modelLabel}</dd>
				</div>
				<div class={styles.row}>
					<dt>Date et heure</dt>
					<dd>
						<Show when={props.createdAt} fallback={<span class={styles.muted}>Non renseignée</span>}>
							{(createdAt) => formatFullDateTime(createdAt())}
						</Show>
					</dd>
				</div>
				<div class={styles.row}>
					<dt>Raisonnement</dt>
					<dd>
						<Show
							when={props.reasoning?.trim()}
							fallback={<span class={styles.muted}>Aucun raisonnement fourni pour cette réponse</span>}
						>
							{(reasoning) => <pre class={styles.reasoning}>{reasoning()}</pre>}
						</Show>
					</dd>
				</div>
			</dl>
		</details>
	);
};
