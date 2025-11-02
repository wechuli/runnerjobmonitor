import mongoose from "mongoose";
import { logger } from "../../app";
import { config } from "./envConfig";

class DatabaseConnection {
  private static instance: DatabaseConnection;
  private isConnected: boolean = false;

  private constructor() {}

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  public async connect(): Promise<void> {
    if (this.isConnected) {
      logger.info("MongoDB is already connected");
      return;
    }

    try {
      const mongoUri = config.MONGO_URI || "";

      if (!mongoUri) {
        throw new Error("MONGO_URI is not defined in environment variables");
      }

      await mongoose.connect(mongoUri);

      this.isConnected = true;
      logger.info("MongoDB connected successfully");

      mongoose.connection.on("error", (error) => {
        logger.error({ error }, "MongoDB connection error");
        this.isConnected = false;
      });

      mongoose.connection.on("disconnected", () => {
        logger.warn("MongoDB disconnected");
        this.isConnected = false;
      });

      // Graceful shutdown
      process.on("SIGINT", async () => {
        await this.disconnect();
        process.exit(0);
      });
    } catch (error) {
      logger.error({ error }, "Failed to connect to MongoDB");
      this.isConnected = false;
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await mongoose.connection.close();
      this.isConnected = false;
      logger.info("MongoDB disconnected successfully");
    } catch (error) {
      logger.error({ error }, "Error disconnecting from MongoDB");
      throw error;
    }
  }

  public getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

export const dbConnection = DatabaseConnection.getInstance();
