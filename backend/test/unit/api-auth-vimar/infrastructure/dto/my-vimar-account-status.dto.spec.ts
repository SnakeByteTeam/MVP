import {
  MyVimarAccountStatusDto,
  MyVimarDisconnectResDto,
} from 'src/api-auth-vimar/infrastructure/dto/my-vimar-account-status.dto';

describe('MyVimar DTOs', () => {
  it('should create account status dto', () => {
    const dto = new MyVimarAccountStatusDto();
    dto.isLinked = true;
    dto.email = 'utente@example.com';

    expect(dto.isLinked).toBe(true);
    expect(dto.email).toBe('utente@example.com');
  });

  it('should create disconnect response dto', () => {
    const dto = new MyVimarDisconnectResDto();
    dto.success = true;

    expect(dto.success).toBe(true);
  });
});
