import { DataSource } from "typeorm";
import * as dotenv from 'dotenv';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "expense_management",
  synchronize: process.env.NODE_ENV !== "production", // Auto-create tables in development
  logging: process.env.NODE_ENV !== "production",
  entities: ["src/entities/**/*.js"],
  migrations: ["src/migrations/**/*.js"],
  subscribers: ["src/subscribers/**/*.js"],
});