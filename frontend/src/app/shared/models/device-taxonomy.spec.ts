import { describe, expect, it } from 'vitest';
import { DeviceType } from '../../features/device-interaction/models/device-type.enum';
import {
	getDeviceTypeLabel,
	getDiscoveredUnmappedSfeCodes,
	getEndpointLabel,
	resolveDeviceType,
} from './device-taxonomy';

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

	it('falls back to light for unknown device signatures', () => {
		const resolved = resolveDeviceType({
			rawType: 'SF_Unknown',
			rawSubType: 'SS_Unknown',
			sfeTypes: ['SFE_Unknown'],
		});

		expect(resolved).toBe(DeviceType.LIGHT);
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
		void getEndpointLabel('SFE_Cmd_FutureFeature');
		void getEndpointLabel('SFE_Cmd_CompletelyNewOne');

		expect(getDiscoveredUnmappedSfeCodes()).toContain('SFE_Cmd_FutureFeature');
		expect(getDiscoveredUnmappedSfeCodes()).toContain('SFE_Cmd_CompletelyNewOne');
	});

	it('returns expected device type label', () => {
		expect(getDeviceTypeLabel(DeviceType.PRESENCE_SENSOR)).toBe('Sensore presenza');
	});
});