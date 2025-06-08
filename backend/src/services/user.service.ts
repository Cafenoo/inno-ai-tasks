import { DataSource } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { User } from '../entities/user.entity';
import { CustomError } from '../types/error';
import { UserInput } from '../types/user';

export class UserService {
  private static userRepository = AppDataSource.getRepository(User);

  static setDataSource(dataSource: DataSource) {
    this.userRepository = dataSource.getRepository(User);
  }

  static async createUser(userData: UserInput): Promise<User> {
    const user = this.userRepository.create(userData);
    return await this.userRepository.save(user);
  }

  static async getUserById(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['address', 'company']
    });
    if (!user) {
      throw new CustomError('User not found', 404);
    }
    return user;
  }

  static async getAllUsers(page: number = 1, limit: number = 10, filters: any = {}): Promise<{ data: User[], total: number }> {
    const skip = (page - 1) * limit;
    
    // Build where clause based on filters
    const where: any = {};
    if (filters.name) where.name = filters.name;
    if (filters.email) where.email = filters.email;
    if (filters.username) where.username = filters.username;

    const [users, total] = await this.userRepository.findAndCount({
      where,
      relations: ['address', 'company'],
      skip,
      take: limit,
      order: { id: 'ASC' }
    });

    return { data: users, total };
  }

  static async updateUser(id: number, userData: Partial<UserInput>): Promise<User> {
    const user = await this.getUserById(id);
    Object.assign(user, userData);
    return await this.userRepository.save(user);
  }

  static async deleteUser(id: number): Promise<void> {
    const user = await this.getUserById(id);
    await this.userRepository.remove(user);
  }
} 