import { DeviceType } from '../../features/device-interaction/models/device-type.enum';

interface DeviceTypeRule {
	readonly deviceType: DeviceType;
	readonly tokens: ReadonlyArray<string>;
}

export interface DeviceTypeResolutionInput {
	readonly rawType?: string;
	readonly rawSubType?: string;
	readonly rawName?: string;
	readonly sfeTypes?: ReadonlyArray<string | null | undefined>;
}

const PRIMARY_DEVICE_TYPE_RULES: ReadonlyArray<DeviceTypeRule> = [
	{ deviceType: DeviceType.THERMOSTAT, tokens: ['THERMOSTAT', 'HVAC', 'CLIMATE'] },
	{ deviceType: DeviceType.FALL_SENSOR, tokens: ['FALL', 'MANDOWN'] },
	{ deviceType: DeviceType.PRESENCE_SENSOR, tokens: ['PRESENCE', 'MOTION'] },
	{ deviceType: DeviceType.ALARM_BUTTON, tokens: ['ALARM_BUTTON', 'PANIC_BUTTON', 'SOS_BUTTON', 'SCENARIO', 'SCENE'] },
	{ deviceType: DeviceType.ENTRANCE_DOOR, tokens: ['DOOR', 'LOCK', 'GATE', 'PORTA'] },
	{ deviceType: DeviceType.BLIND, tokens: ['BLIND', 'SHUTTER'] },
];

const LIGHT_DEVICE_TYPE_RULES: ReadonlyArray<DeviceTypeRule> = [
	{ deviceType: DeviceType.LIGHT, tokens: ['LIGHT', 'LAMP'] },
];

const SFE_DEVICE_TYPE_RULES: ReadonlyArray<DeviceTypeRule> = [
	{
		deviceType: DeviceType.THERMOSTAT,
		tokens: [
			'SFE_CMD_CHANGEOVERMODE',
			'SFE_CMD_HVACMODE',
			'SFE_CMD_OFFBEHAVIOUR',
			'SFE_CMD_ONBEHAVIOUR',
			'SFE_STATE_HVACMODE',
			'SFE_STATE_TEMPERATURE',
		],
	},
	{ deviceType: DeviceType.BLIND, tokens: ['SFE_CMD_BLIND'] },
	{ deviceType: DeviceType.PRESENCE_SENSOR, tokens: ['SFE_STATE_PRESENCE'] },
	{ deviceType: DeviceType.FALL_SENSOR, tokens: ['SFE_STATE_MANDOWN', 'SFE_STATE_FALL'] },
];

const DEVICE_TYPE_LABELS: Readonly<Record<DeviceType, string>> = {
	[DeviceType.UNKNOWN]: 'Sconosciuto',
	[DeviceType.THERMOSTAT]: 'Termostato',
	[DeviceType.FALL_SENSOR]: 'Sensore caduta',
	[DeviceType.PRESENCE_SENSOR]: 'Sensore presenza',
	[DeviceType.LIGHT]: 'Luce',
	[DeviceType.ALARM_BUTTON]: 'Pulsante allarme',
	[DeviceType.ENTRANCE_DOOR]: 'Controllo accesso',
	[DeviceType.BLIND]: 'Tapparella',
};

const ENDPOINT_LABELS: Readonly<Record<string, string>> = {
	SFE_CMD_ONOFF: 'Comando accensione/spegnimento',
	SFE_CMD_BLIND: 'Comando movimento tapparella',
	SFE_CMD_CHANGEOVERMODE: 'Comando cambio modalita HVAC',
	SFE_CMD_HVACMODE: 'Comando modalita HVAC',
	SFE_CMD_OFFBEHAVIOUR: 'Comando comportamento in assenza',
	SFE_CMD_ONBEHAVIOUR: 'Comando comportamento in presenza',
	SFE_CMD_TIMEDDYNAMICMODE: 'Comando modalita dinamica temporizzata',
	SFE_CMD_DOWNKEY_ACTIVESCENE: 'Comando attivazione scenario',
	SFE_STATE_ONOFF: 'Stato acceso/spento',
	SFE_STATE_TEMPERATURE: 'Temperatura',
	SFE_STATE_PRESENCE: 'Presenza rilevata',
	SFE_STATE_MANDOWN: 'Stato uomo a terra',
	SFE_STATE_FALL: 'Stato caduta rilevata',
	SFE_STATE_HVACMODE: 'Stato modalita HVAC',
	SFE_SENSOR: 'Sensore generico',
	SFE_STATUS: 'Stato generico dispositivo',
	SFE_UNKNOWN: 'Endpoint sconosciuto',
};

const discoveredUnmappedSfeCodes = new Set<string>();

export function resolveDeviceType(input: DeviceTypeResolutionInput): DeviceType {
	const normalizedRawValues = [input.rawType, input.rawSubType, input.rawName]
		.map((value) => normalize(value))
		.filter((value) => value.length > 0);

	const primaryMatch = resolveFromRules(normalizedRawValues, PRIMARY_DEVICE_TYPE_RULES);
	if (primaryMatch) {
		return primaryMatch;
	}

	const normalizedSfeTypes = (input.sfeTypes ?? [])
		.map((value) => normalize(value))
		.filter((value) => value.length > 0);

	const sfeMatch = resolveFromRules(normalizedSfeTypes, SFE_DEVICE_TYPE_RULES);
	if (sfeMatch) {
		return sfeMatch;
	}

	const lightMatch = resolveFromRules(normalizedRawValues, LIGHT_DEVICE_TYPE_RULES);
	if (lightMatch) {
		return lightMatch;
	}

	return DeviceType.UNKNOWN;
}

export function getDeviceTypeLabel(type: DeviceType): string {
	return DEVICE_TYPE_LABELS[type] ?? 'Dispositivo';
}

export function getEndpointLabel(sfeType: string | null | undefined): string {
	const rawValue = (sfeType ?? '').trim();
	if (!rawValue) {
		return ENDPOINT_LABELS['SFE_UNKNOWN'];
	}

	const normalizedSfeType = normalize(rawValue);
	const knownLabel = ENDPOINT_LABELS[normalizedSfeType];
	if (knownLabel) {
		return knownLabel;
	}

	discoveredUnmappedSfeCodes.add(rawValue);
	return humanizeUnknownSfeCode(rawValue, normalizedSfeType);
}

export function getDiscoveredUnmappedSfeCodes(): string[] {
	return Array.from(discoveredUnmappedSfeCodes.values()).sort((left, right) => left.localeCompare(right));
}

function resolveFromRules(
	normalizedValues: ReadonlyArray<string>,
	rules: ReadonlyArray<DeviceTypeRule>,
): DeviceType | null {
	for (const rule of rules) {
		if (normalizedValues.some((value) => includesAny(value, rule.tokens))) {
			return rule.deviceType;
		}
	}

	return null;
}

function includesAny(value: string, tokens: ReadonlyArray<string>): boolean {
	return tokens.some((token) => value.includes(token));
}

function normalize(value: string | null | undefined): string {
	return (value ?? '').trim().toUpperCase();
}

function humanizeUnknownSfeCode(rawValue: string, normalizedValue: string): string {
	if (!normalizedValue.startsWith('SFE_')) {
		return rawValue;
	}

	const cmdPattern = /^SFE_(?:Cmd|CMD)_(.+)$/;
	const cmdMatch = cmdPattern.exec(rawValue);
	if (cmdMatch?.[1]) {
		return `Comando ${humanizeSfeSuffix(cmdMatch[1])}`;
	}

	const statePattern = /^SFE_(?:State|STATE)_(.+)$/;
	const stateMatch = statePattern.exec(rawValue);
	if (stateMatch?.[1]) {
		return `Stato ${humanizeSfeSuffix(stateMatch[1])}`;
	}

	if (/^SFE_(?:Sensor|SENSOR)$/.test(rawValue)) {
		return 'Sensore';
	}

	if (/^SFE_(?:Status|STATUS)$/.test(rawValue)) {
		return 'Stato';
	}

	return rawValue;
}

function humanizeSfeSuffix(value: string): string {
	return value
		.replaceAll('_', ' ')
		.replaceAll(/([a-z])([A-Z])/g, '$1 $2')
		.replaceAll(/\s+/g, ' ')
		.trim()
		.toLowerCase();
}