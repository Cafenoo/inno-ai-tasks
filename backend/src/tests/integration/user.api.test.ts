import request from 'supertest';
import app from '../../app';
import { UserService } from '../../services/user.service';
import { UserInput } from '../../types/user';

// Helper function to get auth token
async function getAuthToken() {
  const registerResponse = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });

  if (registerResponse.status === 201) {
    return registerResponse.body.token;
  }

  // If user already exists, try to login
  const loginResponse = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'test@example.com',
      password: 'password123'
    });

  return loginResponse.body.token;
}

describe('User API', () => {
  let authToken: string;

  beforeEach(async () => {
    // Get auth token for each test
    authToken = await getAuthToken();
  });

  describe('POST /api/users', () => {
    const validUserData: UserInput = {
      name: 'John Doe',
      username: 'johndoe',
      email: 'john@example.com',
      phone: '+1234567890',
      website: 'https://johndoe.com',
      address: {
        street: '123 Main St',
        suite: 'Apt 4B',
        city: 'New York',
        zipcode: '10001',
        geo: {
          lat: '40.7128',
          lng: '-74.0060'
        }
      },
      company: {
        name: 'Acme Inc',
        catchPhrase: 'Making things better',
        bs: 'Enterprise solutions'
      }
    };

    it('should create a new user', async () => {
      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validUserData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(validUserData.name);
      expect(response.body.email).toBe(validUserData.email);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });

    it('should validate email format', async () => {
      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ...validUserData,
          email: 'invalid-email'
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toContainEqual(
        expect.objectContaining({
          property: 'email'
        })
      );
    });
  });

  describe('GET /api/users/:id', () => {
    it('should get user by id', async () => {
      // First create a user
      const userData: UserInput = {
        name: 'Jane Doe',
        username: 'janedoe',
        email: 'jane@example.com',
        phone: '+1987654321',
        website: 'https://janedoe.com',
        address: {
          street: '456 Oak St',
          suite: 'Suite 789',
          city: 'Los Angeles',
          zipcode: '90001',
          geo: {
            lat: '34.0522',
            lng: '-118.2437'
          }
        },
        company: {
          name: 'Tech Corp',
          catchPhrase: 'Innovation at its best',
          bs: 'Cutting-edge technology'
        }
      };

      const user = await UserService.createUser(userData);

      const response = await request(app)
        .get(`/api/users/${user.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(user.id);
      expect(response.body.name).toBe(user.name);
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .get('/api/users/999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'User not found');
    });
  });

  describe('GET /api/users', () => {
    beforeEach(async () => {
      // Create test users
      const user1Data: UserInput = {
        name: 'Bob Smith',
        username: 'bobsmith',
        email: 'bob@example.com',
        phone: '+5555555555',
        website: 'https://bobsmith.com',
        address: {
          street: '789 Pine St',
          suite: 'Apt 101',
          city: 'Chicago',
          zipcode: '60601',
          geo: {
            lat: '41.8781',
            lng: '-87.6298'
          }
        },
        company: {
          name: 'Global Corp',
          catchPhrase: 'Connecting the world',
          bs: 'International business'
        }
      };

      const user2Data: UserInput = {
        name: 'Alice Johnson',
        username: 'alicej',
        email: 'alice@example.com',
        phone: '+6666666666',
        website: 'https://alicej.com',
        address: {
          street: '321 Elm St',
          suite: 'Suite 202',
          city: 'Boston',
          zipcode: '02108',
          geo: {
            lat: '42.3601',
            lng: '-71.0589'
          }
        },
        company: {
          name: 'Tech Solutions',
          catchPhrase: 'Innovative technology',
          bs: 'Software development'
        }
      };

      await UserService.createUser(user1Data);
      await UserService.createUser(user2Data);
    });

    it('should get all users with pagination', async () => {
      const response = await request(app)
        .get('/api/users?_page=1&_limit=10')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.headers['x-total-count']).toBeDefined();
      expect(response.headers['link']).toBeDefined();
    });

    it('should filter users by name', async () => {
      const response = await request(app)
        .get('/api/users?name=Bob Smith')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].name).toBe('Bob Smith');
    });

    it('should filter users by email', async () => {
      const response = await request(app)
        .get('/api/users?email=alice@example.com')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].email).toBe('alice@example.com');
    });

    it('should filter users by username', async () => {
      const response = await request(app)
        .get('/api/users?username=bobsmith')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].username).toBe('bobsmith');
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should update user', async () => {
      // First create a user
      const userData: UserInput = {
        name: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        phone: '+1234567890',
        website: 'https://test.com',
        address: {
          street: '123 Test St',
          suite: 'Suite 1',
          city: 'Test City',
          zipcode: '12345',
          geo: {
            lat: '0',
            lng: '0'
          }
        },
        company: {
          name: 'Test Corp',
          catchPhrase: 'Testing is fun',
          bs: 'Quality assurance'
        }
      };

      const user = await UserService.createUser(userData);

      const updateData = {
        name: 'Updated User',
        email: 'updated@example.com'
      };

      const response = await request(app)
        .put(`/api/users/${user.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.name).toBe(updateData.name);
      expect(response.body.email).toBe(updateData.email);
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .put('/api/users/999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Updated User' });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'User not found');
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should delete user', async () => {
      // First create a user
      const userData: UserInput = {
        name: 'Delete Test',
        username: 'deletetest',
        email: 'delete@example.com',
        phone: '+1234567890',
        website: 'https://delete.com',
        address: {
          street: '123 Delete St',
          suite: 'Suite 1',
          city: 'Delete City',
          zipcode: '12345',
          geo: {
            lat: '0',
            lng: '0'
          }
        },
        company: {
          name: 'Delete Corp',
          catchPhrase: 'Deleting is fun',
          bs: 'Data removal'
        }
      };

      const user = await UserService.createUser(userData);

      const response = await request(app)
        .delete(`/api/users/${user.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(204);

      // Verify user is deleted
      const getResponse = await request(app)
        .get(`/api/users/${user.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(getResponse.status).toBe(404);
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .delete('/api/users/999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'User not found');
    });
  });
}); 