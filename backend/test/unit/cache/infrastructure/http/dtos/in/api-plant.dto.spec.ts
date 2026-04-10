import 'reflect-metadata';
import {
  ApiPlantResponseDto,
  ApiRoomDto,
  ApiPlantMetaDto,
} from 'src/cache/infrastructure/http/dtos/in/api-plant.dto';
import { ApiPlantAttributesDto } from 'src/cache/infrastructure/http/dtos/in/api-plant-attributes.dto';

describe('ApiPlantDto', () => {
  it('should instantiate room with required properties', () => {
    const attributes = new ApiPlantAttributesDto();
    attributes.title = 'Living Room';

    const meta = new ApiPlantMetaDto();
    meta.type = ['Room'];

    const dto = new ApiRoomDto();
    dto.id = 'room-1';
    dto.type = 'room';
    dto.attributes = attributes;
    dto.meta = meta;

    expect(dto.id).toBe('room-1');
    expect(dto.type).toBe('room');
    expect(dto.attributes.title).toBe('Living Room');
    expect(dto.meta.type).toEqual(['Room']);
  });

  it('should handle plant attributes', () => {
    const attributes = new ApiPlantAttributesDto();
    attributes.title = 'My Home';

    expect(attributes.title).toBe('My Home');
  });

  it('should handle plant meta type', () => {
    const meta = new ApiPlantMetaDto();
    meta.type = ['Building'];

    expect(meta.type).toEqual(['Building']);
    expect(meta.type).toHaveLength(1);
  });

  it('should handle multiple rooms in response', () => {
    const room1 = new ApiRoomDto();
    room1.id = 'room-1';
    room1.type = 'room';

    const room2 = new ApiRoomDto();
    room2.id = 'room-2';
    room2.type = 'room';

    const response = new ApiPlantResponseDto();
    response.data = [room1, room2];

    expect(response.data).toHaveLength(2);
    expect(response.data[0].id).toBe('room-1');
    expect(response.data[1].id).toBe('room-2');
  });

  it('should handle empty room list', () => {
    const response = new ApiPlantResponseDto();
    response.data = [];

    expect(response.data).toEqual([]);
  });

  it('should handle various room types', () => {
    const roomTitles = ['Bedroom', 'Kitchen', 'Bathroom', 'Office'];

    roomTitles.forEach((title, index) => {
      const attributes = new ApiPlantAttributesDto();
      attributes.title = title;

      const dto = new ApiRoomDto();
      dto.id = `room-${index + 1}`;
      dto.attributes = attributes;

      expect(dto.attributes.title).toBe(title);
    });
  });

  it('should handle meta with multiple types', () => {
    const meta = new ApiPlantMetaDto();
    meta.type = ['Building', 'Structure', 'Plant'];

    expect(meta.type).toHaveLength(3);
    expect(meta.type).toContain('Building');
  });
});
