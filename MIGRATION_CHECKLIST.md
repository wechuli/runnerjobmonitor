# Migration Checklist: Mock to Real Backend

This checklist guides you through replacing the mock API with a real backend implementation.

## Pre-Migration

### 1. Backend API Ready
- [ ] All endpoints implemented (see `docs/API_INTEGRATION.md`)
- [ ] API responds with correct data structures
- [ ] CORS configured for frontend domain
- [ ] Authentication system ready
- [ ] Error handling implemented
- [ ] Rate limiting configured

### 2. Environment Setup
- [ ] Create `.env` file with `VITE_API_URL`
- [ ] Configure GitHub OAuth credentials
- [ ] Set up staging environment
- [ ] Configure production environment variables

---

## Step-by-Step Migration

### Step 1: Create Configuration File

Create `src/config.ts`:

```typescript
export const config = {
  apiBaseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
  githubClientId: import.meta.env.VITE_GITHUB_CLIENT_ID || '',
  githubRedirectUri: import.meta.env.VITE_GITHUB_REDIRECT_URI || '',
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
};
```

**Status:** [ ] Complete

---

### Step 2: Create HTTP Client Utility

Create `src/lib/http-client.ts`:

```typescript
import { config } from '@/config';

class HttpClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getToken(): string | null {
    return localStorage.getItem('gh_token');
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }
}

export const httpClient = new HttpClient(config.apiBaseUrl);
```

**Status:** [ ] Complete

---

### Step 3: Update Authentication Context

Update `src/contexts/AuthContext.tsx`:

```typescript
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { config } from '@/config';

interface User {
  login: string;
  avatar_url: string;
  id: number;
  email: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: () => void;
  logout: () => void;
  handleCallback: (code: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('gh_token');
    if (token) {
      // Validate token with backend
      validateToken(token);
    }
  }, []);

  const validateToken = async (token: string) => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/auth/validate`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem('gh_token');
      }
    } catch (error) {
      console.error('Token validation failed:', error);
      localStorage.removeItem('gh_token');
    }
  };

  const login = () => {
    const params = new URLSearchParams({
      client_id: config.githubClientId,
      redirect_uri: config.githubRedirectUri,
      scope: 'repo,user',
    });

    window.location.href = `https://github.com/login/oauth/authorize?${params}`;
  };

  const handleCallback = async (code: string) => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/auth/github/callback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) throw new Error('Authentication failed');

      const data = await response.json();
      localStorage.setItem('gh_token', data.access_token);
      setUser(data.user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('gh_token');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, handleCallback }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

**Status:** [ ] Complete

---

### Step 4: Create OAuth Callback Page

Create `src/pages/CallbackPage.tsx`:

```typescript
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export const CallbackPage = () => {
  const navigate = useNavigate();
  const { handleCallback } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    if (code) {
      handleCallback(code)
        .then(() => navigate('/'))
        .catch((error) => {
          console.error('Callback error:', error);
          navigate('/login');
        });
    } else {
      navigate('/login');
    }
  }, [handleCallback, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Authenticating...</p>
    </div>
  );
};
```

**Status:** [ ] Complete

---

### Step 5: Replace Mock API Functions

Update `src/services/api.ts`:

Replace each mock function one at a time:

#### fetchOrganizations

```typescript
import { httpClient } from '@/lib/http-client';
import type { Organization } from '@/types';

export const fetchOrganizations = async (): Promise<Organization[]> => {
  return httpClient.get<Organization[]>('/organizations');
};
```

**Status:** [ ] Complete

#### fetchRepositories

```typescript
export const fetchRepositories = async (org: string): Promise<Repository[]> => {
  return httpClient.get<Repository[]>(`/organizations/${org}/repositories`);
};
```

**Status:** [ ] Complete

#### fetchWorkflowRuns

```typescript
export const fetchWorkflowRuns = async (
  owner: string,
  repo: string
): Promise<WorkflowRun[]> => {
  return httpClient.get<WorkflowRun[]>(`/repositories/${owner}/${repo}/runs`);
};
```

**Status:** [ ] Complete

#### fetchWorkflowJobs

```typescript
export const fetchWorkflowJobs = async (runId: number): Promise<WorkflowJob[]> => {
  return httpClient.get<WorkflowJob[]>(`/runs/${runId}/jobs`);
};
```

**Status:** [ ] Complete

#### fetchJobDetails

```typescript
export const fetchJobDetails = async (jobId: number): Promise<JobDetails> => {
  return httpClient.get<JobDetails>(`/jobs/${jobId}/details`);
};
```

**Status:** [ ] Complete

#### analyzeJob

```typescript
export const analyzeJob = async (jobId: number): Promise<AnalysisResult> => {
  return httpClient.post<AnalysisResult>(`/jobs/${jobId}/analyze`);
};
```

**Status:** [ ] Complete

---

### Step 6: Add Error Handling

Create `src/lib/error-handler.ts`:

```typescript
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const handleApiError = (error: unknown): string => {
  if (error instanceof ApiError) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
};
```

Update all page components to use error handler:

```typescript
try {
  const data = await fetchOrganizations();
  setOrganizations(data);
} catch (error) {
  const errorMessage = handleApiError(error);
  toast.error(errorMessage);
}
```

**Status:** [ ] Complete

---

### Step 7: Add Loading States

Ensure all page components have proper loading states:

```typescript
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchData();
      setData(data);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  loadData();
}, []);
```

**Status:** [ ] Complete

---

### Step 8: Update Router

Add callback route to `src/App.tsx`:

```typescript
import { CallbackPage } from '@/pages/CallbackPage';

<Routes>
  <Route path="/auth/callback" element={<CallbackPage />} />
  <Route element={<AppLayout />}>
    {/* existing routes */}
  </Route>
</Routes>
```

**Status:** [ ] Complete

---

### Step 9: Environment Variables

Create `.env.development`:

```bash
VITE_API_URL=http://localhost:3000/api/v1
VITE_GITHUB_CLIENT_ID=your_dev_client_id
VITE_GITHUB_REDIRECT_URI=http://localhost:5173/auth/callback
```

Create `.env.production`:

```bash
VITE_API_URL=https://api.your-domain.com/v1
VITE_GITHUB_CLIENT_ID=your_prod_client_id
VITE_GITHUB_REDIRECT_URI=https://your-domain.com/auth/callback
```

**Status:** [ ] Complete

---

## Testing

### Unit Testing Checklist

- [ ] Test HTTP client with mock server
- [ ] Test authentication flow
- [ ] Test error handling
- [ ] Test all API service functions

### Integration Testing Checklist

- [ ] Test login flow end-to-end
- [ ] Test navigation through all pages
- [ ] Test error states (network errors, 404s, etc.)
- [ ] Test loading states
- [ ] Test logout and session expiry

### Manual Testing Checklist

- [ ] Login with real GitHub account
- [ ] Navigate through organizations
- [ ] View repositories
- [ ] Check workflow runs
- [ ] View job details
- [ ] Test analyze job feature
- [ ] Verify charts render correctly
- [ ] Test logout

---

## Rollback Plan

If issues arise during migration:

### Keep Mock API Available

In `src/services/api.ts`, add a flag:

```typescript
import { config } from '@/config';

const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true';

export const fetchOrganizations = async (): Promise<Organization[]> => {
  if (USE_MOCK_API) {
    await delay(200);
    return MOCK_ORGANIZATIONS;
  }
  
  return httpClient.get<Organization[]>('/organizations');
};
```

Toggle with environment variable:
```bash
VITE_USE_MOCK_API=true npm run dev
```

**Status:** [ ] Implemented

---

## Post-Migration

### Cleanup

- [ ] Remove mock data constants (if no longer needed)
- [ ] Remove delay function
- [ ] Update documentation
- [ ] Archive mock implementation (git tag)

### Monitoring

- [ ] Set up error tracking (Sentry)
- [ ] Monitor API response times
- [ ] Track authentication success rate
- [ ] Monitor for CORS issues

### Documentation Updates

- [ ] Update README.md with real API info
- [ ] Remove references to mock data
- [ ] Add troubleshooting for real API issues
- [ ] Update deployment guide

---

## Troubleshooting

### Common Issues

**CORS Errors**
```
Solution: Verify backend CORS configuration includes your frontend domain
```

**401 Unauthorized**
```
Solution: Check token storage and Authorization header format
```

**Network Errors**
```
Solution: Verify API_URL is correct and backend is accessible
```

**Data Structure Mismatch**
```
Solution: Verify backend response matches TypeScript types
```

---

## Contact

For assistance during migration:
- Backend Team: [contact info]
- DevOps Team: [contact info]
- Documentation: `docs/API_INTEGRATION.md`

---

**Migration Complete:** [ ] Yes [ ] No  
**Date Completed:** _______________  
**Completed By:** _______________
