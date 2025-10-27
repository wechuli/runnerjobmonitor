# Express TypeScript Starter Template

A production-ready Express.js starter template with TypeScript, featuring modern tooling and best practices.

## ✨ Features

- 🚀 **Express.js 5** - Fast, minimalist web framework
- 📘 **TypeScript** - Type safety and better developer experience
- 🔒 **Security** - Helmet.js for HTTP headers, CORS configured
- 📝 **Logging** - Structured logging with Pino
- 🧪 **Testing** - Jest with Supertest for API testing
- 🐳 **Docker** - Multi-stage Dockerfile with Node 24
- 🔄 **CI/CD** - GitHub Actions workflow included
- ⚡ **Dev Experience** - Hot reload with tsx
- 🛡️ **Type Safety** - Zod for runtime validation
- 📊 **Request Tracing** - Automatic request ID generation

## 🏗️ Project Structure

```
.
├── src/
│   ├── app.ts                      # Express app setup
│   ├── index.ts                    # Server entry point
│   └── common/
│       ├── middleware/
│       │   ├── errorHandler.ts    # Global error handling
│       │   └── requestLogger.ts   # Request logging middleware
│       └── utils/
│           └── envConfig.ts       # Environment configuration
├── __tests__/
│   └── main.test.ts               # Test files
├── Dockerfile                      # Multi-stage Docker build
├── .github/workflows/ci.yaml      # CI/CD pipeline
└── package.json
```

## 🚀 Quick Start

### Prerequisites

- Node.js 24+
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/wechuli/actionslogshipper.git
   cd actionslogshipper
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

4. **Start development server**
   ```bash
   npm run start:dev
   ```

The server will start at `http://localhost:8080`

## 📜 Available Scripts

| Script               | Description                              |
| -------------------- | ---------------------------------------- |
| `npm run start:dev`  | Start development server with hot reload |
| `npm run build`      | Build TypeScript to JavaScript           |
| `npm run start:prod` | Start production server                  |
| `npm test`           | Run tests with coverage                  |

## 🐳 Docker

### Build the image

```bash
docker build -t actionslogshipper .
```

### Run the container

```bash
docker run -p 3000:3000 --env-file .env actionslogshipper
```

### Pull from GitHub Container Registry

```bash
docker pull ghcr.io/wechuli/actionslogshipper:latest
```

## 🧪 Testing

Run the test suite:

```bash
npm test
```

Tests include:

- Unit tests for core functionality
- Integration tests with Supertest
- Code coverage reports

## 🔧 Environment Variables

| Variable                         | Default                 | Description             |
| -------------------------------- | ----------------------- | ----------------------- |
| `NODE_ENV`                       | `production`            | Environment mode        |
| `HOST`                           | `localhost`             | Server host             |
| `PORT`                           | `8080`                  | Server port             |
| `CORS_ORIGIN`                    | `http://localhost:8080` | CORS origin             |
| `COMMON_RATE_LIMIT_MAX_REQUESTS` | `1000`                  | Rate limit max requests |
| `COMMON_RATE_LIMIT_WINDOW_MS`    | `1000`                  | Rate limit window (ms)  |

## 🏗️ Built With

- [Express.js](https://expressjs.com/) - Web framework
- [TypeScript](https://www.typescriptlang.org/) - Language
- [Pino](https://getpino.io/) - Logger
- [Helmet](https://helmetjs.github.io/) - Security middleware
- [Zod](https://zod.dev/) - Schema validation
- [Jest](https://jestjs.io/) - Testing framework

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## 📬 Support

If you have any questions or issues, please open an [issue](https://github.com/wechuli/actionslogshipper/issues).
