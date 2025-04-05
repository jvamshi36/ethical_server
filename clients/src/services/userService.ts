import api from './api.tsx';
import { User, UserRole } from '../shared/types/user.ts';

export interface UserResponse {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  headquartersId: string;
  departmentId: string;
}

export const getUsers = async (): Promise<UserResponse[]> => {
  const response = await api.get('/users');
  return response.data;
};

export const getUserById = async (id: string): Promise<UserResponse> => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

export const registerUser = async (userData: {
  username: string;
  email: string;
  password: string;
  role: UserRole;
  departmentId: string;
  headquartersId: string;
  dailyAllowanceRate: number;
  assignedTravelCities: string[];
}): Promise<{ token: string; user: UserResponse }> => {
  const response = await api.post('/users/register', userData);
  return response.data;
};