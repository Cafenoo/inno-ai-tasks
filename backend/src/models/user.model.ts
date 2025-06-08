import { User } from '../types/user.types';
import { CreateUserDto } from '../dto/user.dto';

// In-memory storage for users (replace with database in production)
const users: User[] = [];

export class UserModel {
  private static users: User[] = [];

  static create(userData: CreateUserDto): User {
    const newUser: User = {
      ...userData,
      id: this.users.length + 1
    };
    this.users.push(newUser);
    return newUser;
  }

  static findById(id: number): User | undefined {
    return this.users.find(user => user.id === id);
  }

  static findAll(): User[] {
    return this.users;
  }

  static update(id: number, userData: Partial<User>): User | undefined {
    const index = this.users.findIndex(user => user.id === id);
    if (index === -1) return undefined;

    this.users[index] = {
      ...this.users[index],
      ...userData
    };
    return this.users[index];
  }

  static delete(id: number): boolean {
    const index = this.users.findIndex(user => user.id === id);
    if (index === -1) return false;

    this.users.splice(index, 1);
    return true;
  }
} 