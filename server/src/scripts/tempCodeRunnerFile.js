import { AppDataSource } from '../config/data-source.js';
import { User } from '../entities/User.js';
import bcrypt from 'bcrypt';

const insertUser = async (userData) => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    const userRepository = AppDataSource.getRepository(User);

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    userData.password = hashedPassword;

    const user = userRepository.create(userData);
    await userRepository.save(user);
    console.log('User successfully inserted:', user);
  } catch (error) {
    console.error('Error inserting user:', error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
};

// Example usage
const exampleUser = {
  username: 'testuser1',
  email: 'test1@example.com',
  password: 'password123',
  role: 'EMPLOYEE',
  departmentId: '550e8400-e29b-41d4-a716-446655440000',
  headquartersId: '550e8400-e29b-41d4-a716-446655440001',
  dailyAllowanceRate: 50,
  assignedTravelCities: ['New York', 'London', 'Tokyo']
};

insertUser(exampleUser);