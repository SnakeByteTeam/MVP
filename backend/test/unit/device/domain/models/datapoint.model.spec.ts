import { Datapoint } from 'src/device/domain/models/datapoint.model';

describe('Datapoint', () => {
  it('should correctly return all the attributes', () => {
    const datapoint = new Datapoint(
      'dp-1',
      'brightness',
      true,
      false,
      'number',
      ['0', '100'],
      'slider',
    );

    expect(datapoint.getId()).toBe('dp-1');
    expect(datapoint.getName()).toBe('brightness');
    expect(datapoint.isReadable()).toBe(true);
    expect(datapoint.isWritable()).toBe(false);
    expect(datapoint.getValueType()).toBe('number');
    expect(datapoint.getSfeType()).toBe('slider');
  });

  it("should construct enumValues's content correctly", () => {
    const enumValues = ['off', 'on'];
    const datapoint = new Datapoint(
      'dp-2',
      'power',
      true,
      true,
      'boolean',
      enumValues,
      'switch',
    );

    expect(datapoint.getEnum()).toEqual(enumValues);
    expect(datapoint.getEnum()).toHaveLength(2);
  });

  it('should protect internal enum array with defensive copy', () => {
    const enumValues = ['auto', 'manual'];
    const datapoint = new Datapoint(
      'dp-3',
      'mode',
      true,
      true,
      'string',
      enumValues,
      'select',
    );

    expect(datapoint.getEnum()).not.toBe(enumValues);

    enumValues.push('eco');
    expect(datapoint.getEnum()).toEqual(['auto', 'manual']);

    const retrievedEnum = datapoint.getEnum();
    retrievedEnum.push('turbo');
    expect(datapoint.getEnum()).toEqual(['auto', 'manual']);
  });
});
