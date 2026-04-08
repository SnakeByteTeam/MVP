import { AlarmPriority } from '../../alarm/models/alarm-priority.enum';

const MAX_NOTIFICATION_TITLE_LENGTH = 64;

export const DEFAULT_TRIGGERED_NOTIFICATION_TITLE = "C'e un allarme in corso";
export const DEFAULT_RESOLVED_NOTIFICATION_TITLE = 'Allarme risolto';

export function formatTriggeredNotificationTitle(
	alarmName: unknown,
	priority: unknown,
	maxLength: number = MAX_NOTIFICATION_TITLE_LENGTH
): string {
	const normalizedPrioritySymbol = toPrioritySymbol(priority);
	const normalizedAlarmName = normalizeAlarmName(alarmName);
	if (!normalizedAlarmName || !normalizedPrioritySymbol) {
		return DEFAULT_TRIGGERED_NOTIFICATION_TITLE;
	}

	const prefix = `${normalizedPrioritySymbol} `;
	const allowedNameLength = Math.max(1, maxLength - prefix.length);
	const compactAlarmName = normalizedAlarmName.length <= allowedNameLength
		? normalizedAlarmName
		: `${normalizedAlarmName.slice(0, Math.max(allowedNameLength - 1, 1)).trimEnd()}...`;

	return `${prefix}${compactAlarmName}`;
}

function normalizeAlarmName(value: unknown): string | null {
	if (typeof value !== 'string') {
		return null;
	}

	const compact = value.replaceAll(/\s+/g, ' ').trim();
	return compact || null;
}

function toPrioritySymbol(value: unknown): string | null {
	const priority = normalizePriority(value);
	if (priority === null) {
		return null;
	}

	switch (priority) {
		case AlarmPriority.WHITE:
			return 'i';
		case AlarmPriority.GREEN:
			return '•';
		case AlarmPriority.ORANGE:
			return '!';
		case AlarmPriority.RED:
			return '▲';
		default:
			return null;
	}
}

function normalizePriority(value: unknown): AlarmPriority | null {
	if (typeof value === 'number' && Number.isInteger(value)) {
		return isKnownPriority(value) ? value : null;
	}

	if (typeof value !== 'string') {
		return null;
	}

	return normalizePriorityFromString(value.trim().toUpperCase());
}

function normalizePriorityFromString(compact: string): AlarmPriority | null {
	if (!compact) {
		return null;
	}

	const enumValue = toEnumPriority(compact);
	if (enumValue !== null) {
		return enumValue;
	}

	const parsed = Number(compact);
	return Number.isInteger(parsed) && isKnownPriority(parsed) ? parsed : null;
}

function toEnumPriority(compact: string): AlarmPriority | null {
	if (!(compact in AlarmPriority)) {
		return null;
	}

	const enumValue = AlarmPriority[compact as keyof typeof AlarmPriority];
	return typeof enumValue === 'number' && isKnownPriority(enumValue) ? enumValue : null;
}

function isKnownPriority(value: number): value is AlarmPriority {
	return (
		value === AlarmPriority.WHITE ||
		value === AlarmPriority.GREEN ||
		value === AlarmPriority.ORANGE ||
		value === AlarmPriority.RED
	);
}
