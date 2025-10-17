# GitHub Actions Runner Observability Tool

A comprehensive web application for monitoring and analyzing self-hosted or ephemeral GitHub Actions runners. Provides real-time resource metrics visualization, job log management, and AI-powered performance analysis using Google Gemini.

## Features

- 📊 **Real-time Metrics Collection**: Monitor CPU, memory, disk, and network usage during workflow runs
- 🔍 **Job Visualization**: Browse organizations, repositories, workflow runs, and detailed job information
- 📝 **Log Management**: Automatic job log collection and storage in Google Cloud Platform
- 🤖 **AI-Powered Analysis**: Get intelligent performance insights and recommendations from Google Gemini
- 🔐 **GitHub App Integration**: Secure integration using GitHub App with webhook support
- 📈 **Interactive Charts**: Visualize resource usage over time with interactive charts

## Architecture

This is a monorepo containing:
- **Backend**: Express.js + TypeScript + Prisma ORM
- **Frontend**: React + TypeScript + Chakra UI

For detailed architecture information, see [docs/01_ARCHITECTURE.md](docs/01_ARCHITECTURE.md).

## Prerequisites

- Node.js 18+ and npm
- GitHub account with admin access to install GitHub Apps
- Google Cloud Platform account (for log storage)
- Google Gemini API key (for AI analysis)

## Quick Start

### 1. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your credentials (see Setup Instructions below)
```

### 3. Initialize Database

```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
```

### 4. Run the Application

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Access the app at http://localhost:5173

## Complete Setup Instructions

For detailed setup instructions including GitHub App creation, GCP configuration, and runner integration, see the full documentation in this README below or check the [docs/](docs/) folder.

### GitHub App Setup

1. Go to GitHub Settings → Developer settings → GitHub Apps → New GitHub App
2. Configure webhook URL: `http://your-server:3001/webhooks/github`
3. Set permissions: Actions (Read), Contents (Read), Metadata (Read)
4. Subscribe to events: `workflow_job`, `installation`
5. Generate and download private key

### GCP Storage Setup

1. Create a GCP project and enable Cloud Storage API
2. Create a storage bucket
3. Create service account with Storage Object Admin role
4. Download service account key JSON

### Environment Variables

Edit `backend/.env`:

```env
DATABASE_URL="file:./dev.db"
PORT=3001
GITHUB_APP_ID=your_app_id
GITHUB_APP_PRIVATE_KEY_PATH=./private-key.pem
GITHUB_WEBHOOK_SECRET=your_webhook_secret
GCP_PROJECT_ID=your_project_id
GCP_STORAGE_BUCKET=your_bucket_name
GCP_SERVICE_ACCOUNT_KEY_PATH=./service-account-key.json
GEMINI_API_KEY=your_gemini_api_key
FRONTEND_URL=http://localhost:5173
```

## Usage

1. Navigate to http://localhost:5173
2. Select an organization
3. Choose a repository
4. View workflow runs
5. Analyze job details with metrics and AI insights

## API Documentation

See [docs/02_API_ENDPOINTS.md](docs/02_API_ENDPOINTS.md) for complete API documentation.

## Documentation

- [Architecture](docs/01_ARCHITECTURE.md) - System architecture and data flow
- [API Endpoints](docs/02_API_ENDPOINTS.md) - REST API documentation
- [Gemini Integration](docs/03_GEMINI_INTEGRATION.md) - AI analysis details

## Development

```bash
# Backend
cd backend
npm run dev          # Development mode with hot reload
npm run build        # Build for production
npx prisma studio    # Open database GUI

# Frontend
cd frontend
npm run dev          # Development server
npm run build        # Build for production
npm run lint         # Lint code
```

## License

MIT License

## Support

For issues and questions, open an issue on GitHub or check the documentation in the `docs/` folder.
