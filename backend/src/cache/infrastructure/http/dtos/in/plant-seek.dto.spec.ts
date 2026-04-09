import 'reflect-metadata';
import { PlantSeekResponseDto } from './plant-seek.dto';

describe('PlantSeekResponseDto', () => {
  it('should create valid plant seek response', () => {
    const dto: PlantSeekResponseDto = {
      api: {
        templates: {
          plantId: {
            values: ['plant-1', 'plant-2', 'plant-3'],
          },
        },
      },
    };

    expect(dto.api).toBeDefined();
    expect(dto.api.templates).toBeDefined();
    expect(dto.api.templates.plantId).toBeDefined();
    expect(dto.api.templates.plantId.values).toHaveLength(3);
    expect(dto.api.templates.plantId.values).toContain('plant-1');
  });

  it('should handle empty plant list', () => {
    const dto: PlantSeekResponseDto = {
      api: {
        templates: {
          plantId: {
            values: [],
          },
        },
      },
    };

    expect(dto.api.templates.plantId.values).toEqual([]);
  });

  it('should handle single plant', () => {
    const dto: PlantSeekResponseDto = {
      api: {
        templates: {
          plantId: {
            values: ['plant-1'],
          },
        },
      },
    };

    expect(dto.api.templates.plantId.values).toHaveLength(1);
    expect(dto.api.templates.plantId.values[0]).toBe('plant-1');
  });

  it('should handle many plants', () => {
    const plantIds = Array.from({ length: 10 }, (_, i) => `plant-${i + 1}`);
    const dto: PlantSeekResponseDto = {
      api: {
        templates: {
          plantId: {
            values: plantIds,
          },
        },
      },
    };

    expect(dto.api.templates.plantId.values).toHaveLength(10);
  });
});
