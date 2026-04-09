import { AlarmPriority } from '../../alarm/models/alarm-priority.enum';

const PRIORITY_TITLE_PREFIX = /^[i\u2022!\u25b2]\s+/u;

export function extractPriorityFromNotificationTitle(title: unknown): AlarmPriority | null {
	if (typeof title !== 'string') {
		return null;
	}

	const compactTitle = title.trim();
	if (compactTitle.startsWith('i ')) {
		return AlarmPriority.WHITE;
	}
	if (compactTitle.startsWith('\u2022 ')) {
		return AlarmPriority.GREEN;
	}
	if (compactTitle.startsWith('! ')) {
		return AlarmPriority.ORANGE;
	}
	if (compactTitle.startsWith('\u25b2 ')) {
		return AlarmPriority.RED;
	}

	return null;
}

export function stripPriorityFromNotificationTitle(title: unknown): string {
	if (typeof title !== 'string') {
		return '';
	}

	const compactTitle = title.replaceAll(/\s+/g, ' ').trim();
	return compactTitle.replace(PRIORITY_TITLE_PREFIX, '').trim();
}
