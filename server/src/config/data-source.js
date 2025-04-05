import { DataSource } from 'typeorm';
import { User } from '../entities/User.js';
import { Expense } from '../entities/Expense.js';
import { Department } from '../entities/Department.js';
import { Headquarters } from '../entities/Headquarters.js';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '1234',
  database: process.env.DB_NAME || 'ethical',
  entities: [User, Expense, Department, Headquarters],
  synchronize: true,
  logging: false
});

export { AppDataSource };