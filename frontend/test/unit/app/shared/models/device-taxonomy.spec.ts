import { describe, expect, it } from 'vitest';
import { DeviceType } from 'src/app/features/device-interaction/models/device-type.enum';
import {
	getDeviceTypeLabel,
	getDiscoveredUnmappedSfeCodes,
	getEndpointLabel,
	resolveDeviceType,
} from 'src/app/shared/models/device-taxonomy';

describe('device-taxonomy', () => {
	it('resolves thermostat when type token is explicit', () => {
		const resolved = resolveDeviceType({
			rawType: 'SF_Thermostat',
		});

		expect(resolved).toBe(DeviceType.THERMOSTAT);
	});

	it('infers thermostat from endpoint sfeType when raw type is ambiguous', () => {
		const resolved = resolveDeviceType({
			rawType: 'SF_Light',
			sfeTypes: ['SFE_Cmd_ChangeOverMode'],
		});

		expect(resolved).toBe(DeviceType.THERMOSTAT);
	});

	it('infers thermostat from HVAC command endpoint when raw type is ambiguous', () => {
		const resolved = resolveDeviceType({
			rawType: 'SF_Unknown',
			sfeTypes: ['SFE_Cmd_HVACMode'],
		});

		expect(resolved).toBe(DeviceType.THERMOSTAT);
	});

	it('infers entrance door from italian device name when raw type is ambiguous', () => {
		const resolved = resolveDeviceType({
			rawType: 'SF_Light',
			rawName: 'Porta di Ingresso',
			sfeTypes: ['SFE_Cmd_OnOff'],
		});

		expect(resolved).toBe(DeviceType.ENTRANCE_DOOR);
	});

	it('infers scenario devices from name instead of falling back to light', () => {
		const resolved = resolveDeviceType({
			rawType: 'SF_Unknown',
			rawName: 'Nome scenario Stella',
			sfeTypes: ['SFE_Cmd_DownKey_ActiveScene'],
		});

		expect(resolved).toBe(DeviceType.ALARM_BUTTON);
	});

	it('falls back to unknown for unknown device signatures', () => {
		const resolved = resolveDeviceType({
			rawType: 'SF_Unknown',
			rawSubType: 'SS_Unknown',
			sfeTypes: ['SFE_Unknown'],
		});

		expect(resolved).toBe(DeviceType.UNKNOWN);
	});

	it('returns readable label for known endpoint code', () => {
		expect(getEndpointLabel('SFE_Cmd_ChangeOverMode')).toBe('Comando cambio modalita HVAC');
	});

	it('returns readable label for fall state endpoint code', () => {
		expect(getEndpointLabel('SFE_State_Fall')).toBe('Stato caduta rilevata');
	});

	it('returns readable labels for newly observed runtime thermostat commands', () => {
		expect(getEndpointLabel('SFE_Cmd_HVACMode')).toBe('Comando modalita HVAC');
		expect(getEndpointLabel('SFE_Cmd_OffBehaviour')).toBe('Comando comportamento in assenza');
		expect(getEndpointLabel('SFE_Cmd_OnBehaviour')).toBe('Comando comportamento in presenza');
	});

	it('returns readable label for active scene command', () => {
		expect(getEndpointLabel('SFE_Cmd_DownKey_ActiveScene')).toBe('Comando attivazione scenario');
	});

	it('returns readable label for timed dynamic light command', () => {
		expect(getEndpointLabel('SFE_Cmd_TimedDynamicMode')).toBe('Comando modalita dinamica temporizzata');
	});

	it('returns raw endpoint code for unknown values', () => {
		expect(getEndpointLabel('SFE_Cmd_FutureFeature')).toBe('Comando future feature');
	});

	it('tracks unknown endpoint codes discovered at runtime', () => {
		getEndpointLabel('SFE_Cmd_FutureFeature');
		getEndpointLabel('SFE_Cmd_CompletelyNewOne');

		expect(getDiscoveredUnmappedSfeCodes()).toContain('SFE_Cmd_FutureFeature');
		expect(getDiscoveredUnmappedSfeCodes()).toContain('SFE_Cmd_CompletelyNewOne');
	});

	it('returns expected device type label', () => {
		expect(getDeviceTypeLabel(DeviceType.PRESENCE_SENSOR)).toBe('Sensore presenza');
	});

	it('returns expected fallback label for unknown device type', () => {
		expect(getDeviceTypeLabel(DeviceType.UNKNOWN)).toBe('Sconosciuto');
	});

	it('resolves LIGHT when type token matches', () => {
		expect(resolveDeviceType({ rawType: 'SF_Light' })).toBe(DeviceType.LIGHT);
	});

	it('resolves BLIND from primary token', () => {
		expect(resolveDeviceType({ rawType: 'SF_Blind' })).toBe(DeviceType.BLIND);
	});

	it('resolves BLIND from SFE type', () => {
		expect(resolveDeviceType({ rawType: 'SF_Unknown', sfeTypes: ['SFE_Cmd_Blind'] })).toBe(DeviceType.BLIND);
	});

	it('resolves PRESENCE_SENSOR from SFE state', () => {
		expect(resolveDeviceType({ rawType: 'SF_Unknown', sfeTypes: ['SFE_State_Presence'] })).toBe(DeviceType.PRESENCE_SENSOR);
	});

	it('resolves FALL_SENSOR from SFE state mandown', () => {
		expect(resolveDeviceType({ rawType: 'SF_Unknown', sfeTypes: ['SFE_State_ManDown'] })).toBe(DeviceType.FALL_SENSOR);
	});

	it('resolves FALL_SENSOR from SFE state fall', () => {
		expect(resolveDeviceType({ rawType: 'SF_Unknown', sfeTypes: ['SFE_State_Fall'] })).toBe(DeviceType.FALL_SENSOR);
	});

	it('returns SFE_UNKNOWN label for null/empty sfeType', () => {
		expect(getEndpointLabel(null)).toBe('Endpoint sconosciuto');
		expect(getEndpointLabel(undefined)).toBe('Endpoint sconosciuto');
		expect(getEndpointLabel('   ')).toBe('Endpoint sconosciuto');
	});

	it('humanizes SFE_State_* pattern for unknown codes', () => {
		expect(getEndpointLabel('SFE_State_NewSensor')).toBe('Stato new sensor');
	});

	it('returns raw value for non-SFE unknown codes', () => {
		expect(getEndpointLabel('CUSTOM_CODE_XYZ')).toBe('CUSTOM_CODE_XYZ');
	});

	it('returns all device type labels correctly', () => {
		expect(getDeviceTypeLabel(DeviceType.THERMOSTAT)).toBe('Termostato');
		expect(getDeviceTypeLabel(DeviceType.FALL_SENSOR)).toBe('Sensore caduta');
		expect(getDeviceTypeLabel(DeviceType.PRESENCE_SENSOR)).toBe('Sensore presenza');
		expect(getDeviceTypeLabel(DeviceType.LIGHT)).toBe('Luce');
		expect(getDeviceTypeLabel(DeviceType.ALARM_BUTTON)).toBe('Pulsante allarme');
		expect(getDeviceTypeLabel(DeviceType.ENTRANCE_DOOR)).toBe('Controllo accesso');
		expect(getDeviceTypeLabel(DeviceType.BLIND)).toBe('Tapparella');
	});

	it('resolveDeviceType handles empty input gracefully', () => {
		expect(resolveDeviceType({})).toBe(DeviceType.UNKNOWN);
		expect(resolveDeviceType({ sfeTypes: [] })).toBe(DeviceType.UNKNOWN);
		expect(resolveDeviceType({ sfeTypes: [null, undefined] })).toBe(DeviceType.UNKNOWN);
	});
});