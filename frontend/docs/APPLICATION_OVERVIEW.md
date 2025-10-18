# Application Overview

## Purpose

The GitHub Actions Runner Observatory is a frontend application designed to visualize and analyze performance metrics from self-hosted GitHub Actions runners. It enables DevOps teams and developers to monitor runner performance, identify bottlenecks, and optimize workflow execution.

## Architecture

### High-Level Structure

```
┌─────────────────┐
│   User Browser  │
└────────┬────────┘
         │
         ├─── Authentication Layer (AuthContext)
         │
         ├─── Routing Layer (React Router)
         │
         ├─── UI Components (Pages + Charts)
         │
         └─── Data Layer (Mock API Service)
```

### Core Components

#### 1. Authentication System

**Location:** `src/contexts/AuthContext.tsx`

**Purpose:** Manages user authentication state across the application.

**Key Features:**
- Simulated GitHub OAuth flow
- Persistent session using localStorage
- Global authentication state via React Context
- Login/logout functionality

**Structure:**
```typescript
interface AuthContextType {
  isAuthenticated: boolean;
  user: { login: string; avatar_url: string } | null;
  login: () => void;
  logout: () => void;
}
```

**Integration Points:**
- `App.tsx` - Wraps entire application
- `LoginPage.tsx` - Calls `login()` function
- `AppLayout.tsx` - Displays user info and logout button
- `ProtectedRoutes` - Guards authenticated routes

**Future Integration:**
To replace with real GitHub OAuth:
1. Update `login()` to redirect to `https://github.com/login/oauth/authorize`
2. Create callback route to handle OAuth code exchange
3. Store JWT/token in secure storage
4. Fetch real user data from GitHub API

---

#### 2. Routing System

**Location:** `src/App.tsx`

**Purpose:** Defines application navigation structure and route protection.

**Route Hierarchy:**
```
/ (Organizations)
└── /orgs/:org/repos (Repositories)
    └── /orgs/:org/repos/:repo/runs (Workflow Runs)
        └── /orgs/:org/repos/:repo/runs/:runId/jobs (Jobs)
            └── /orgs/:org/repos/:repo/runs/:runId/jobs/:jobId (Job Details)
```

**Protected Routes:**
All routes are protected by the `ProtectedRoutes` component, which checks `isAuthenticated` state. Unauthenticated users see only the `LoginPage`.

---

#### 3. Mock API Service

**Location:** `src/services/api.ts`

**Purpose:** Simulates backend API with realistic data and latency.

**Key Functions:**

| Function | Parameters | Returns | Purpose |
|----------|-----------|---------|---------|
| `fetchOrganizations()` | None | `Organization[]` | List all orgs |
| `fetchRepositories()` | `org: string` | `Repository[]` | List repos in org |
| `fetchWorkflowRuns()` | `owner: string, repo: string` | `WorkflowRun[]` | List workflow runs |
| `fetchWorkflowJobs()` | `runId: number` | `WorkflowJob[]` | List jobs in run |
| `fetchJobDetails()` | `jobId: number` | `JobDetails` | Get job with metrics |
| `analyzeJob()` | `jobId: number` | `AnalysisResult` | AI analysis simulation |

**Data Generation:**
- Static mock data for organizations and repositories
- Dynamic mock data for workflow runs (generated with timestamps)
- Time-series metrics generated algorithmically to simulate realistic patterns
- Hardcoded but realistic log output

**Artificial Latency:**
Each function includes a random delay (100-500ms) to simulate network requests:
```typescript
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
await delay(200 + Math.random() * 200);
```

**Swapping with Real API:**

To replace with real backend, maintain the same function signatures:

```typescript
// Current mock implementation
export const fetchOrganizations = async (): Promise<Organization[]> => {
  await delay(200);
  return MOCK_ORGANIZATIONS;
};

// Real API implementation
export const fetchOrganizations = async (): Promise<Organization[]> => {
  const response = await fetch(`${API_BASE_URL}/organizations`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  if (!response.ok) throw new Error('Failed to fetch organizations');
  return response.json();
};
```

No changes needed in UI components.

---

#### 4. Page Components

Each page component follows a consistent pattern:

**Common Structure:**
1. State management with `useState` hooks
2. Data fetching with `useEffect` on mount
3. Loading skeleton during data fetch
4. Error handling
5. Empty state for no data
6. Interactive cards/lists for navigation

**Page Flow:**

##### LoginPage (`src/pages/LoginPage.tsx`)
- Entry point for unauthenticated users
- Features showcase cards
- "Sign in with GitHub" button
- Calls `login()` from AuthContext

##### OrganizationsPage (`src/pages/OrganizationsPage.tsx`)
- Lists all organizations
- Fetches data via `fetchOrganizations()`
- Clicking org navigates to `/orgs/:org/repos`
- Shows organization avatar, name, and description

##### RepositoriesPage (`src/pages/RepositoriesPage.tsx`)
- Lists repositories for selected organization
- Uses `:org` param from URL
- Fetches via `fetchRepositories(org)`
- Breadcrumb navigation shows path
- Clicking repo navigates to workflow runs

##### WorkflowRunsPage (`src/pages/WorkflowRunsPage.tsx`)
- Lists recent workflow runs for a repository
- Shows run status with color-coded badges
- Displays branch, event type, actor, timestamp
- Clicking run navigates to jobs list

##### JobsPage (`src/pages/JobsPage.tsx`)
- Lists all jobs in a workflow run
- Shows job status and duration
- Displays runner name
- Clicking job navigates to detailed analysis

##### JobDetailPage (`src/pages/JobDetailPage.tsx`)
- **Most complex page** - combines multiple features
- Fetches detailed metrics and logs
- Renders four separate chart components
- "Analyze Job" button triggers AI analysis
- Shows analysis results with insights and recommendations

---

#### 5. Chart Components

**Location:** `src/components/charts/`

**Purpose:** Visualize time-series metrics using Recharts library.

**Individual Chart Components:**

##### CpuChart (`CpuChart.tsx`)
- Displays CPU usage percentage over time
- Uses `LineChart` from Recharts
- Y-axis domain: 0-100%
- Color: `--chart-1` (vibrant blue)

##### MemoryChart (`MemoryChart.tsx`)
- Displays memory usage percentage over time
- Uses `AreaChart` with gradient fill
- Y-axis domain: 0-100%
- Color: `--chart-2` (green)

##### DiskChart (`DiskChart.tsx`)
- Displays disk usage percentage over time
- Uses `LineChart`
- Y-axis domain: 0-100%
- Color: `--chart-3` (orange)

##### ProcessChart (`ProcessChart.tsx`)
- Displays top process CPU and memory usage
- Uses `LineChart` with dual lines
- Legend shows CPU % and Memory %
- Colors: `--chart-4` (purple) and `--chart-5` (red)

**Chart Configuration:**
All charts share common styling:
- Consistent margins and padding
- Color scheme from CSS variables
- Responsive container (100% width, 300px height)
- Tooltip with custom styling
- Grid lines with muted colors
- Accessible labels and axes

**Data Transformation:**
Each chart component transforms raw `MetricDataPoint[]` data:
```typescript
const chartData = data.map((point) => ({
  time: new Date(point.timestamp).toLocaleTimeString(),
  cpu: point.system.cpu.usage_percent,
}));
```

---

## Data Flow

### 1. Authentication Flow

```
User clicks "Sign in with GitHub"
    ↓
LoginPage calls login()
    ↓
AuthContext updates isAuthenticated = true
    ↓
localStorage stores auth state
    ↓
App re-renders with ProtectedRoutes
    ↓
User sees OrganizationsPage
```

### 2. Navigation Flow

```
User on OrganizationsPage
    ↓
useEffect triggers fetchOrganizations()
    ↓
Mock API returns Organization[]
    ↓
State updates with setOrganizations()
    ↓
Component renders list of cards
    ↓
User clicks organization card
    ↓
React Router navigates to /orgs/:org/repos
    ↓
Process repeats for each level
```

### 3. Job Analysis Flow

```
User on JobDetailPage
    ↓
useEffect fetches fetchJobDetails(jobId)
    ↓
Mock API generates time-series metrics
    ↓
State updates with setJobDetails()
    ↓
Four chart components render
    ↓
User clicks "Analyze Job"
    ↓
handleAnalyze() calls analyzeJob(jobId)
    ↓
2-3 second delay simulates AI processing
    ↓
AnalysisResult returned with insights
    ↓
Analysis card displays summary, insights, recommendations
```

---

## State Management

### Local Component State

Most state is managed locally within components using `useState`:

```typescript
const [data, setData] = useState<Type[]>([]);
const [loading, setLoading] = useState(true);
```

**Benefits:**
- Simple and straightforward
- No external dependencies
- Sufficient for this application's complexity

### Global State (AuthContext)

Authentication state is shared globally:
- `isAuthenticated` - Boolean indicating auth status
- `user` - Object with login and avatar_url
- Persisted to `localStorage` for session continuity

**Why Context vs Redux:**
- Only one piece of global state (auth)
- No complex state interactions
- Context API is sufficient and built-in

---

## Styling Approach

### Tailwind CSS + CSS Variables

**Theme Definition:** `src/index.css`

```css
:root {
  --primary: oklch(0.35 0.05 250);
  --accent: oklch(0.55 0.18 250);
  /* ... */
}
```

**Benefits:**
- Consistent color palette
- Easy theme customization
- Type-safe with Tailwind
- Works with shadcn components

### Component Library: shadcn/ui

**Pre-installed components:**
- Card, Button, Badge, Separator
- Breadcrumb, Skeleton, ScrollArea
- All components in `src/components/ui/`

**Customization:**
Components use theme variables automatically:
```tsx
<Button className="bg-primary text-primary-foreground">
  Click me
</Button>
```

### Typography

**Fonts:**
- **Inter** - UI text (headings, body, labels)
- **JetBrains Mono** - Code/logs

**Hierarchy:**
- H1: 32px, SemiBold, tight tracking
- H2: 24px, Medium
- Body: 14px, Regular, 1.6 line-height
- Code: 13px, Mono

---

## Performance Optimizations

### 1. Lazy Loading
Routes could be code-split with React.lazy():
```typescript
const JobDetailPage = lazy(() => import('./pages/JobDetailPage'));
```

### 2. Memoization
Charts could be wrapped in `React.memo()` to prevent unnecessary re-renders when parent state changes but chart data doesn't.

### 3. Virtualization
For very large log files, consider react-window or react-virtual for virtualized scrolling.

### 4. Debouncing
If adding search/filter features, debounce input handlers to reduce re-renders.

---

## Testing Strategy

### Unit Tests
- Test individual chart components with sample data
- Test utility functions in `api.ts` (e.g., metric generation)
- Test AuthContext state transitions

### Integration Tests
- Test navigation flow from orgs → repos → runs → jobs → details
- Test authentication flow (login/logout)
- Test data fetching and loading states

### E2E Tests
- Full user journey: login → navigate hierarchy → analyze job
- Test all interactive elements (buttons, cards, links)

---

## Future Enhancements

### Real-Time Updates
- WebSocket connection for live metrics
- Update charts as new data arrives
- Notification system for job completion

### Advanced Filtering
- Filter runs by status, branch, actor
- Date range pickers
- Search functionality

### Data Export
- Export metrics as CSV
- Download analysis reports as PDF
- Copy logs to clipboard

### Comparison Mode
- Compare metrics across multiple jobs
- Side-by-side chart view
- Diff analysis for similar workflows

### Custom Dashboards
- User-configurable dashboard
- Pin favorite repositories
- Custom metric alerts

---

## Troubleshooting

### Charts Not Rendering
- Check that Recharts is installed: `npm list recharts`
- Verify data structure matches `MetricDataPoint` type
- Check browser console for errors

### Authentication Loop
- Clear localStorage: `localStorage.clear()`
- Check AuthContext provider wraps entire app

### Routes Not Working
- Verify BrowserRouter wraps all Routes
- Check URL params match route definitions
- Ensure Navigate fallback exists for 404s

---

## API Contract

For backend developers implementing the real API:

### Base URL
```
https://api.runner-observatory.example.com/v1
```

### Endpoints

#### GET /organizations
Returns list of organizations user has access to.

**Response:**
```typescript
Organization[] = [
  {
    id: number;
    login: string;
    name: string;
    description: string;
    avatar_url: string;
  }
]
```

#### GET /organizations/:org/repositories
Returns repositories in organization.

**Response:** `Repository[]`

#### GET /repositories/:owner/:repo/runs
Returns recent workflow runs.

**Response:** `WorkflowRun[]`

#### GET /runs/:runId/jobs
Returns jobs for specific workflow run.

**Response:** `WorkflowJob[]`

#### GET /jobs/:jobId/details
Returns detailed metrics and logs for job.

**Response:**
```typescript
{
  job: WorkflowJob;
  metrics: MetricDataPoint[];
  logs: string;
}
```

#### POST /jobs/:jobId/analyze
Triggers AI analysis of job performance.

**Response:** `AnalysisResult`

---

## Conclusion

This application is architected as a pure frontend prototype with a clear separation between UI and data layers. The mock API service acts as an abstraction boundary, making it straightforward to swap simulated data with real backend integration. All components follow React best practices and are designed for maintainability and extensibility.
