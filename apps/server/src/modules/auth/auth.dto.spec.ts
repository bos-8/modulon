import { RegisterDto } from './auth.dto';

describe('AuthDto', () => {
  it('should be defined', () => {
    expect(new RegisterDto()).toBeDefined();
  });
});
