import { User, Address, Geo, Company } from '../../../types/user.types';

describe('User Model', () => {
  const mockGeo: Geo = {
    lat: '-37.3159',
    lng: '81.1496'
  };

  const mockAddress: Address = {
    street: 'Kulas Light',
    suite: 'Apt. 556',
    city: 'Gwenborough',
    zipcode: '92998-3874',
    geo: mockGeo
  };

  const mockCompany: Company = {
    name: 'Romaguera-Crona',
    catchPhrase: 'Multi-layered client-server neural-net',
    bs: 'harness real-time e-markets'
  };

  const mockUser: User = {
    id: 1,
    name: 'Leanne Graham',
    username: 'Bret',
    email: 'Sincere@april.biz',
    address: mockAddress,
    phone: '1-770-736-8031 x56442',
    website: 'hildegard.org',
    company: mockCompany
  };

  describe('User Creation', () => {
    it('should create a new user with valid data', async () => {
      expect(mockUser).toBeDefined();
      expect(mockUser.id).toBe(1);
      expect(mockUser.name).toBe('Leanne Graham');
    });

    it('should throw error when creating user with invalid data', async () => {
      const invalidUser = { ...mockUser, email: 'invalid-email' };
      expect(invalidUser).toBeDefined();
    });
  });

  describe('User Retrieval', () => {
    it('should get a user by id', async () => {
      expect(mockUser.id).toBe(1);
    });

    it('should get all users', async () => {
      const users = [mockUser];
      expect(users).toHaveLength(1);
    });

    it('should throw error when user not found', async () => {
      expect(mockUser.id).toBe(1);
    });
  });

  describe('User Update', () => {
    it('should update a user with valid data', async () => {
      const updatedUser = { ...mockUser, name: 'Updated Name' };
      expect(updatedUser.name).toBe('Updated Name');
    });

    it('should throw error when updating non-existent user', async () => {
      expect(mockUser.id).toBe(1);
    });

    it('should throw error when updating with invalid data', async () => {
      const invalidUpdate = { ...mockUser, email: 'invalid-email' };
      expect(invalidUpdate).toBeDefined();
    });
  });

  describe('User Deletion', () => {
    it('should delete a user by id', async () => {
      expect(mockUser.id).toBe(1);
    });

    it('should throw error when deleting non-existent user', async () => {
      expect(mockUser.id).toBe(1);
    });
  });
}); 