import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { CustomError } from '../types/error';

export class UserController {
  static async createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await UserService.createUser(req.body);
      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  }

  static async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        throw new CustomError('Invalid user ID', 400);
      }
      const user = await UserService.getUserById(id);
      res.json(user);
    } catch (error) {
      if (error instanceof CustomError && error.statusCode === 404) {
        res.status(404).json({ error: 'User not found' });
      } else {
        next(error);
      }
    }
  }

  static async getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query._page as string) || 1;
      const limit = parseInt(req.query._limit as string) || 10;
      
      // Extract filter parameters
      const filters: any = {};
      if (req.query.name) filters.name = req.query.name;
      if (req.query.email) filters.email = req.query.email;
      if (req.query.username) filters.username = req.query.username;

      const { data: users, total } = await UserService.getAllUsers(page, limit, filters);
      
      // Set pagination headers
      res.setHeader('X-Total-Count', total);
      res.setHeader('Link', UserController.generatePaginationLinks(req, page, limit, total));
      
      res.json(users);
    } catch (error) {
      next(error);
    }
  }

  static async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        throw new CustomError('Invalid user ID', 400);
      }
      const user = await UserService.updateUser(id, req.body);
      res.json(user);
    } catch (error) {
      if (error instanceof CustomError && error.statusCode === 404) {
        res.status(404).json({ error: 'User not found' });
      } else {
        next(error);
      }
    }
  }

  static async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        throw new CustomError('Invalid user ID', 400);
      }
      await UserService.deleteUser(id);
      res.status(204).send();
    } catch (error) {
      if (error instanceof CustomError && error.statusCode === 404) {
        res.status(404).json({ error: 'User not found' });
      } else {
        next(error);
      }
    }
  }

  private static generatePaginationLinks(req: Request, page: number, limit: number, total: number): string {
    const totalPages = Math.ceil(total / limit);
    const baseUrl = `${req.protocol}://${req.get('host')}${req.path}`;
    const links = [];

    if (page > 1) {
      links.push(`<${baseUrl}?_page=${page - 1}&_limit=${limit}>; rel="prev"`);
    }
    if (page < totalPages) {
      links.push(`<${baseUrl}?_page=${page + 1}&_limit=${limit}>; rel="next"`);
    }
    links.push(`<${baseUrl}?_page=1&_limit=${limit}>; rel="first"`);
    links.push(`<${baseUrl}?_page=${totalPages}&_limit=${limit}>; rel="last"`);

    return links.join(', ');
  }
} 