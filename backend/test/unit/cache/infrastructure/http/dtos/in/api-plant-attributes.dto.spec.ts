import 'reflect-metadata';
import { ApiPlantAttributesDto } from 'src/cache/infrastructure/http/dtos/in/api-plant-attributes.dto';

describe('ApiPlantAttributesDto', () => {
  it('should instantiate with title property', () => {
    const dto = new ApiPlantAttributesDto();
    dto.title = 'My Home';

    expect(dto.title).toBe('My Home');
  });

  it('should handle empty string title', () => {
    const dto = new ApiPlantAttributesDto();
    dto.title = '';

    expect(dto.title).toBe('');
  });

  it('should handle various title values', () => {
    const titles = [
      'House',
      'Apartment',
      'Office',
      'Store',
      'My Test Plant',
      'Plant-123',
    ];

    titles.forEach((title) => {
      const dto = new ApiPlantAttributesDto();
      dto.title = title;

      expect(dto.title).toBe(title);
    });
  });

  it('should handle long title values', () => {
    const longTitle =
      'This is a very long title for a plant that contains many characters';
    const dto = new ApiPlantAttributesDto();
    dto.title = longTitle;

    expect(dto.title).toBe(longTitle);
    expect(dto.title.length).toBeGreaterThan(50);
  });

  it('should handle special characters in title', () => {
    const dto = new ApiPlantAttributesDto();
    dto.title = 'Plant #1 - Main (Primary) + Home';

    expect(dto.title).toBe('Plant #1 - Main (Primary) + Home');
  });

  it('should handle unicode characters', () => {
    const dto = new ApiPlantAttributesDto();
    dto.title = 'Casa Principale 🏠';

    expect(dto.title).toBe('Casa Principale 🏠');
  });
});
