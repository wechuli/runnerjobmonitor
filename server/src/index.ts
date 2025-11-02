import { app, logger } from "./app";
import { env } from "./common/utils/envConfig";
import { dbConnection } from "./common/utils/database";

// Initialize database connection
dbConnection
  .connect()
  .then(() => {
    logger.info("Database connected successfully");
  })
  .catch((error) => {
    logger.error({ error }, "Failed to connect to database");
    process.exit(1);
  });

const server = app.listen(env.PORT, () => {
  const { NODE_ENV, HOST, PORT } = env;
  logger.info(`Server (${NODE_ENV}) running on port http://${HOST}:${PORT}`);
});

const onCloseSignal = async () => {
  logger.info("sigint received, shutting down");

  // Close database connection
  await dbConnection.disconnect();

  server.close(() => {
    logger.info("server closed");
    process.exit();
  });
  setTimeout(() => process.exit(1), 10000).unref(); // Force shutdown after 10s
};

process.on("SIGINT", onCloseSignal);
process.on("SIGTERM", onCloseSignal);
