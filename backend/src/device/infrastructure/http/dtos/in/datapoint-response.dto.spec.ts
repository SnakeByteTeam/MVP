import {
  DatapointExtractedDto,
  DatapointApiResponse,
} from './datapoint-response.dto';

describe('DatapointExtractedDto', () => {
  const sampleResponse: DatapointApiResponse = {
    meta: {
      collection: {
        offset: 0,
        items: 2,
        total: 2,
      },
    },
    data: [
      {
        id: 'dp-1',
        type: 'datapoint',
        attributes: {
          title: 'Power',
          readable: true,
          writable: true,
          value: 'On',
          timestamp: '2026-04-03T10:00:00Z',
          valueType: 'string',
        },
        meta: {
          'vimar:sfType': 'cmd',
          'vimar:sfeType': 'SFE_Cmd_OnOff',
        },
        relationships: {},
      },
      {
        id: 'dp-2',
        type: 'datapoint',
        attributes: {
          title: 'Hidden Value',
          readable: false,
          writable: true,
          value: '25',
          timestamp: '2026-04-03T10:00:00Z',
          valueType: 'number',
        },
        meta: {
          'vimar:sfType': 'sensor',
          'vimar:sfeType': 'SFE_Sensor',
        },
        relationships: {},
      },
    ],
  };

  it('should map a single api datapoint with fromApiResponse', () => {
    const result = DatapointExtractedDto.fromApiResponse(
      sampleResponse.data[0],
    );

    expect(result.id).toBe('dp-1');
    expect(result.name).toBe('Power');
    expect(result.value).toBe('On');
  });

  it('should keep only readable datapoints with fromApiResponses', () => {
    const result = DatapointExtractedDto.fromApiResponses(sampleResponse);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('dp-1');
  });

  it('should convert extracted dto to domain datapoint value', () => {
    const extracted = new DatapointExtractedDto('dp-1', 'Power', 'On');
    const domain = DatapointExtractedDto.toDomain(extracted);

    expect(domain.getDatapointId()).toBe('dp-1');
    expect(domain.getName()).toBe('Power');
    expect(domain.getValue()).toBe('On');
  });
});
