# Quick Start Guide

## Getting Started in 3 Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Open Browser
Navigate to `http://localhost:5173`

---

## First Time User Flow

1. **Login** - Click "Sign in with GitHub" (simulated authentication)
2. **Select Organization** - Choose from the list of 3 mock organizations
3. **Browse Repositories** - View repositories in the selected organization
4. **View Workflow Runs** - See recent workflow executions
5. **Inspect Jobs** - Click on any job to view detailed metrics
6. **Analyze Performance** - Click "Analyze Job" to get AI-powered insights

---

## Key Features to Test

### 📊 Metrics Visualization
- CPU, Memory, Disk, and Process charts on job detail page
- Interactive tooltips on hover
- Time-series data with realistic patterns

### 🤖 AI Analysis
- Click "Analyze Job" button on job detail page
- Wait 2-3 seconds for simulated analysis
- View summary, insights, and recommendations

### 🔐 Authentication
- Simulated login persists in localStorage
- Click "Sign Out" in header to test logout flow

### 🧭 Navigation
- Breadcrumb navigation shows current path
- Click any breadcrumb to navigate back
- All cards are clickable to drill down

---

## Mock Data Overview

### Organizations (3)
- ACME Corporation
- GitHub Demo  
- DevOps Team

### Repositories (2-3 per org)
Each org has multiple repos with realistic names

### Workflow Runs (4 per repo)
Mix of success, failure, and in-progress states

### Jobs (1-3 per run)
Realistic job names like "lint", "test", "build"

### Metrics
Time-series data generated with:
- 15-second intervals
- Realistic CPU spikes during build phases
- Gradual memory growth
- Stable disk usage

---

## Customization Guide

### Change Theme Colors

Edit `src/index.css`:

```css
:root {
  --primary: oklch(0.35 0.05 250);    /* Deep slate blue */
  --accent: oklch(0.55 0.18 250);     /* Vibrant blue */
  --chart-1: oklch(0.55 0.18 250);    /* CPU chart color */
  --chart-2: oklch(0.6 0.15 140);     /* Memory chart color */
  /* ... */
}
```

### Add New Chart Type

1. Create new component in `src/components/charts/`
2. Import in `JobDetailPage.tsx`
3. Add to metrics grid with Card wrapper

Example:
```tsx
// src/components/charts/NetworkChart.tsx
import { LineChart, Line, /* ... */ } from 'recharts';

export const NetworkChart = ({ data }) => {
  // Transform data and render chart
};

// In JobDetailPage.tsx
import { NetworkChart } from '@/components/charts/NetworkChart';

<Card>
  <CardHeader>
    <CardTitle>Network Usage</CardTitle>
  </CardHeader>
  <CardContent>
    <NetworkChart data={metrics} />
  </CardContent>
</Card>
```

### Modify Mock Data

Edit `src/services/api.ts`:

```typescript
// Add new organization
const MOCK_ORGANIZATIONS: Organization[] = [
  // ... existing orgs
  {
    id: 4,
    login: 'my-new-org',
    name: 'My New Organization',
    description: 'Custom organization for testing',
    avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=MO',
  },
];

// Add repositories for new org
const MOCK_REPOSITORIES: Record<string, Repository[]> = {
  // ... existing repos
  'my-new-org': [
    {
      id: 401,
      name: 'my-repo',
      full_name: 'my-new-org/my-repo',
      description: 'Custom repository',
      private: false,
      owner: 'my-new-org',
    },
  ],
};
```

---

## Integrating Real Backend

### Step 1: Update API Base URL

Create `src/config.ts`:
```typescript
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
```

### Step 2: Replace Mock Functions

In `src/services/api.ts`:

```typescript
// Before
export const fetchOrganizations = async (): Promise<Organization[]> => {
  await delay(200);
  return MOCK_ORGANIZATIONS;
};

// After
export const fetchOrganizations = async (): Promise<Organization[]> => {
  const response = await fetch(`${API_BASE_URL}/organizations`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('gh_token')}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch organizations: ${response.statusText}`);
  }
  
  return response.json();
};
```

### Step 3: Update Authentication

In `src/contexts/AuthContext.tsx`:

```typescript
const login = async () => {
  // Redirect to GitHub OAuth
  const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
  const redirectUri = `${window.location.origin}/auth/callback`;
  window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=repo,user`;
};

// Create callback route to handle OAuth response
// Exchange code for token
// Store token securely
```

---

## Common Issues

### Charts Not Displaying
**Problem:** Empty or missing chart components  
**Solution:** 
- Check browser console for errors
- Verify Recharts is installed: `npm list recharts`
- Ensure data prop matches `MetricDataPoint[]` type

### Authentication Loop
**Problem:** Stuck on login page after clicking sign in  
**Solution:**
- Clear localStorage: `localStorage.clear()`
- Check AuthProvider wraps App in `src/App.tsx`
- Verify isAuthenticated updates in AuthContext

### Routes Not Working  
**Problem:** 404 or blank pages  
**Solution:**
- Verify BrowserRouter wraps all Routes
- Check URL params match route definitions
- Ensure all page components are imported correctly

### Styling Not Applied
**Problem:** Components look unstyled  
**Solution:**
- Check `src/index.css` is imported in `src/main.css`
- Verify Tailwind is configured in `tailwind.config.js`
- Clear browser cache and hard refresh

---

## Development Tips

### Hot Module Replacement
Vite provides instant HMR. Edit any file and see changes immediately without full page reload.

### TypeScript Errors
Run type checking:
```bash
npx tsc --noEmit
```

### Linting
Fix common issues:
```bash
npm run lint
```

### Production Build
Test production build locally:
```bash
npm run build
npm run preview
```

---

## Project Structure Reference

```
src/
├── components/
│   ├── charts/          # Recharts visualizations (4 charts)
│   ├── layout/          # AppLayout with header
│   └── ui/              # shadcn components (40+)
├── contexts/
│   └── AuthContext.tsx  # Global auth state
├── pages/               # 6 page components
│   ├── LoginPage.tsx
│   ├── OrganizationsPage.tsx
│   ├── RepositoriesPage.tsx
│   ├── WorkflowRunsPage.tsx
│   ├── JobsPage.tsx
│   └── JobDetailPage.tsx
├── services/
│   └── api.ts           # Mock API (swap with real backend)
├── types/
│   └── index.ts         # TypeScript definitions
├── App.tsx              # Router setup
├── index.css            # Theme and global styles
└── main.tsx             # Entry point
```

---

## Resources

- [React Router Docs](https://reactrouter.com/)
- [Recharts Documentation](https://recharts.org/)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Phosphor Icons](https://phosphoricons.com/)

---

## Next Steps

1. ✅ Run the application and explore all features
2. 📝 Read `docs/APPLICATION_OVERVIEW.md` for architecture details
3. 🎨 Customize theme colors to match your brand
4. 🔌 Plan backend API integration
5. 🚀 Deploy to production (Vercel, Netlify, etc.)

**Happy coding! 🚀**
