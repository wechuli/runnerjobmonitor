import AppDataSource from "./data-source";

export async function connectDb() {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  return AppDataSource;
}

export async function disconnectDb() {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
}

export default AppDataSource;
