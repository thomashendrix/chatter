import { createEffect, createMemo, createSignal, onCleanup } from 'solid-js';
import type { Component } from 'solid-js';
import {
	formatAbsoluteTime,
	formatRelativeTime,
	refreshIntervalMs,
	toDate,
} from '../lib/relativeTime';

type RelativeTimeProps = {
	date: string | number | Date;
	class?: string;
};

export const RelativeTime: Component<RelativeTimeProps> = (props) => {
	const [now, setNow] = createSignal(Date.now());

	createEffect(() => {
		const date = props.date;
		let timeoutId = 0;

		const schedule = () => {
			setNow(Date.now());
			timeoutId = window.setTimeout(schedule, refreshIntervalMs(date, Date.now()));
		};

		schedule();
		onCleanup(() => window.clearTimeout(timeoutId));
	});

	const label = createMemo(() => formatRelativeTime(props.date, now()));
	const absolute = createMemo(() => formatAbsoluteTime(props.date, now()));
	const dateTime = createMemo(() => {
		const parsed = toDate(props.date);
		return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
	});

	return (
		<time class={props.class} dateTime={dateTime()} title={absolute()}>
			{label()}
		</time>
	);
};
