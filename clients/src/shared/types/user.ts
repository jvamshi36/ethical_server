export enum UserRole {
  TRAINEE = 'TRAINEE',
  JUNIOR = 'JUNIOR',
  SENIOR = 'SENIOR',
  TEAM_LEAD = 'TEAM_LEAD',
  DEPARTMENT_HEAD = 'DEPARTMENT_HEAD',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN'
}

export interface User {
  id: string;
  username: string;
  email: string;
  password: string; // Hashed
  role: UserRole;
  departmentId: string;
  headquartersId: string;
  dailyAllowanceRate: number;
  assignedTravelCities: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Headquarters {
  id: string;
  name: string;
  location: string;
  region: string;
  country: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Department {
  id: string;
  name: string;
  headquartersId: string;
  createdAt: Date;
  updatedAt: Date;
}