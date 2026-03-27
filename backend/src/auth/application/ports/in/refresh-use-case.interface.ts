import { RefreshCmd } from '../../commands/refresh-cmd';

export interface RefreshUseCase {
  refresh(req: RefreshCmd): string;
}
