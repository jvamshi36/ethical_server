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
  username: 'superadmin',
  email: 'super@example.com',
  password: 'superadmin',
  role: 'SUPER_ADMIN',
};

insertUser(exampleUser);