import { marked } from 'marked';

export const renderMarkdown = (content: string) => {
	const raw = content || '';
	return marked.parse(raw, { breaks: true }) as string;
};
