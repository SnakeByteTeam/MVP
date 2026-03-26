import { Expose } from 'class-transformer';

export class ApiPlantAttributesDto {
  @Expose() title: string;
}
