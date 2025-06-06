import { UserNotFoundException } from './user.exception.js';

describe('UserNotFoundException', () => {
  it('should be defined', () => {
    expect(new UserNotFoundException()).toBeDefined();
  });
});
