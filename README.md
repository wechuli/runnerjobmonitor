# GitHub Actions Runner Observatory

A comprehensive web application for visualizing observability data from self-hosted GitHub Actions runners. Monitor performance metrics, analyze workflow execution, and receive AI-powered insights to optimize your CI/CD infrastructure.

![GitHub Actions Runner Observatory](https://img.shields.io/badge/React-19.0-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue) ![License](https://img.shields.io/badge/license-MIT-green)

## Features

- 🔐 **GitHub OAuth Simulation** - Simulated authentication flow ready for real OAuth integration
- 📊 **Multi-Level Navigation** - Drill down through Organizations → Repositories → Workflow Runs → Jobs
- 📈 **Real-time Metrics** - Visualize CPU, Memory, Disk, and Process metrics using Recharts
- 🤖 **AI-Powered Analysis** - Get intelligent recommendations to optimize runner performance
- 📝 **Job Logs** - View complete execution logs with timestamps
- 🎨 **Modern UI** - Built with shadcn/ui components and Tailwind CSS

## Tech Stack

- **Framework:** React 19 with TypeScript
- **Routing:** React Router v6
- **UI Components:** shadcn/ui (Radix UI primitives)
- **Styling:** Tailwind CSS v4
- **Charts:** Recharts
- **Icons:** Phosphor Icons
- **Build Tool:** Vite

## Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher

## Installation

1. **Clone the repository:**

```bash
git clone <repository-url>
cd spark-template
```

2. **Install dependencies:**

```bash
npm install
```

3. **Start the development server:**

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Project Structure

```
src/
├── components/
│   ├── charts/          # Recharts visualization components
│   │   ├── CpuChart.tsx
│   │   ├── MemoryChart.tsx
│   │   ├── DiskChart.tsx
│   │   └── ProcessChart.tsx
│   ├── layout/          # Layout components
│   │   └── AppLayout.tsx
│   └── ui/              # shadcn UI components
├── contexts/
│   └── AuthContext.tsx  # Authentication state management
├── pages/              # Page components
│   ├── LoginPage.tsx
│   ├── OrganizationsPage.tsx
│   ├── RepositoriesPage.tsx
│   ├── WorkflowRunsPage.tsx
│   ├── JobsPage.tsx
│   └── JobDetailPage.tsx
├── services/
│   └── api.ts          # Mock API service (ready to swap with real backend)
├── types/
│   └── index.ts        # TypeScript type definitions
├── App.tsx             # Main application component with routing
└── index.css           # Global styles and theme configuration
```

## Usage

### Authentication

1. Navigate to the application homepage
2. Click **"Sign in with GitHub"**
3. You will be automatically authenticated (simulated)

### Navigating the Application

1. **Organizations** - Select an organization to view its repositories
2. **Repositories** - Choose a repository to see its workflow runs
3. **Workflow Runs** - Click on a run to view its jobs
4. **Jobs** - Select a job to view detailed metrics and analysis
5. **Job Details** - View charts, logs, and click **"Analyze Job"** for AI insights

### Mock Data

The application uses simulated data from `src/services/api.ts`. All API functions include artificial latency to mimic real network requests. This makes it easy to test loading states and user experience.

## Replacing Mock API with Real Backend

The mock API in `src/services/api.ts` is designed as a swappable module. To integrate a real backend:

1. Keep the same function signatures and return types
2. Replace the mock implementations with actual HTTP calls (e.g., using `fetch` or `axios`)
3. Update the base URL and endpoints as needed
4. No changes required in UI components

Example:

```typescript
// Before (Mock)
export const fetchOrganizations = async (): Promise<Organization[]> => {
  await delay(200);
  return MOCK_ORGANIZATIONS;
};

// After (Real API)
export const fetchOrganizations = async (): Promise<Organization[]> => {
  const response = await fetch('/api/v1/organizations');
  return response.json();
};
```

## Authentication Integration

The `AuthContext` is structured to easily integrate real GitHub OAuth:

1. Replace the `login()` function to redirect to GitHub OAuth
2. Handle the OAuth callback to exchange code for token
3. Store the token securely
4. Update the `user` state with real user data from GitHub API

## Customization

### Theme Colors

Edit `src/index.css` to customize the color palette:

```css
:root {
  --primary: oklch(0.35 0.05 250);
  --accent: oklch(0.55 0.18 250);
  /* ... */
}
```

### Charts

Each chart component in `src/components/charts/` can be customized:
- Adjust colors by modifying the `stroke` and `fill` props
- Change chart types (Line, Area, Bar) by importing different Recharts components
- Modify dimensions in the `ResponsiveContainer` height prop

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## Documentation

For detailed information about the application architecture and data flow, see:
- [Application Overview](docs/APPLICATION_OVERVIEW.md)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance Considerations

- Charts are rendered with Recharts for optimal performance
- Logs are displayed in a ScrollArea to handle large outputs
- Mock API includes realistic latency for testing loading states
- All components are optimized for React 19's concurrent rendering

## Contributing

This is a demonstration project. The mock API and simulated authentication are designed to be replaced with real implementations in a production environment.

## License

MIT License - see LICENSE file for details

## Support

For questions or issues, please refer to the documentation or open an issue in the repository.

---

**Note:** This application currently uses simulated data and authentication. It is designed as a frontend-only prototype that can be integrated with a real backend and GitHub OAuth in production.
