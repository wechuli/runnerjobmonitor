import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";

export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  synchronize: !isProduction, // don't use synchronize in production
  logging: process.env.NODE_ENV === "development",
  entities: [path.join(__dirname, "/models/*.{ts,js}")],
  migrations: [path.join(__dirname, "/migrations/*.{ts,js}")],
});

export default AppDataSource;
