import { RemovePlantFromWardCmd } from '../../application/commands/remove-plant-from-ward-cmd';
import { RemovePlantFromWardPort } from '../../application/ports/out/remove-plant-from-ward-port.interface';

export class RemovePlantFromWardAdapter implements RemovePlantFromWardPort {
  removePlantFromWard(req: RemovePlantFromWardCmd) {
    throw new Error('Method not implemented.');
  }
}

export const REMOVE_PLANT_FROM_WARD_PORT = 'REMOVE_PLANT_FROM_WARD_PORT';
