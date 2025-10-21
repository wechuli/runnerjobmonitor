# Deployment Guide

This guide covers deploying the GitHub Actions Runner Observatory frontend to various hosting platforms.

## Build Configuration

### Environment Variables

Create a `.env` file for environment-specific configuration:

```bash
# API Configuration
VITE_API_URL=https://api.your-domain.com/v1

# GitHub OAuth (when implementing real auth)
VITE_GITHUB_CLIENT_ID=your_github_client_id
VITE_GITHUB_REDIRECT_URI=https://your-domain.com/auth/callback

# Feature Flags (optional)
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_DEBUG=false
```

### Build Command

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

### Preview Build Locally

```bash
npm run preview
```

---

## Platform-Specific Deployment

### 1. Vercel (Recommended)

**Why Vercel?**
- Zero configuration for Vite projects
- Automatic HTTPS
- Global CDN
- Easy environment variable management
- Preview deployments for PRs

**Steps:**

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Login:**
```bash
vercel login
```

3. **Deploy:**
```bash
vercel
```

4. **Configure Environment Variables:**
   - Go to Vercel Dashboard → Project → Settings → Environment Variables
   - Add `VITE_API_URL` and other variables

5. **Production Deployment:**
```bash
vercel --prod
```

**vercel.json Configuration:**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

### 2. Netlify

**Steps:**

1. **Install Netlify CLI:**
```bash
npm install -g netlify-cli
```

2. **Login:**
```bash
netlify login
```

3. **Deploy:**
```bash
netlify deploy
```

4. **Production:**
```bash
netlify deploy --prod
```

**netlify.toml Configuration:**
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "20"
```

---

### 3. GitHub Pages

**Steps:**

1. **Install gh-pages:**
```bash
npm install --save-dev gh-pages
```

2. **Update vite.config.ts:**
```typescript
export default defineConfig({
  base: '/repository-name/', // Your GitHub repo name
  // ... rest of config
});
```

3. **Add deploy script to package.json:**
```json
{
  "scripts": {
    "deploy": "npm run build && gh-pages -d dist"
  }
}
```

4. **Deploy:**
```bash
npm run deploy
```

5. **Configure GitHub Pages:**
   - Go to repository Settings → Pages
   - Source: Deploy from branch
   - Branch: `gh-pages` / root

---

### 4. AWS S3 + CloudFront

**Steps:**

1. **Build the project:**
```bash
npm run build
```

2. **Create S3 Bucket:**
```bash
aws s3 mb s3://runner-observatory-frontend
```

3. **Configure bucket for static website hosting:**
```bash
aws s3 website s3://runner-observatory-frontend \
  --index-document index.html \
  --error-document index.html
```

4. **Upload files:**
```bash
aws s3 sync dist/ s3://runner-observatory-frontend --delete
```

5. **Create CloudFront Distribution:**
   - Origin: S3 bucket
   - Error Pages: Map 404 to /index.html (for client-side routing)

6. **Update bucket policy:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::runner-observatory-frontend/*"
    }
  ]
}
```

---

### 5. Docker

**Dockerfile:**
```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**nginx.conf:**
```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Enable gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**Build and run:**
```bash
docker build -t runner-observatory .
docker run -p 8080:80 runner-observatory
```

**docker-compose.yml:**
```yaml
version: '3.8'
services:
  frontend:
    build: .
    ports:
      - "8080:80"
    environment:
      - VITE_API_URL=https://api.your-domain.com/v1
```

---

## CI/CD Pipeline Examples

### GitHub Actions

**.github/workflows/deploy.yml:**
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
        env:
          VITE_API_URL: ${{ secrets.VITE_API_URL }}
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### GitLab CI

**.gitlab-ci.yml:**
```yaml
stages:
  - build
  - deploy

build:
  stage: build
  image: node:20
  script:
    - npm ci
    - npm run build
  artifacts:
    paths:
      - dist/
  only:
    - main

deploy:
  stage: deploy
  image: alpine:latest
  before_script:
    - apk add --no-cache curl
  script:
    - curl -X POST $DEPLOY_WEBHOOK_URL
  only:
    - main
```

---

## Performance Optimization

### 1. Code Splitting

Vite automatically code-splits by route. To further optimize:

```typescript
// Lazy load heavy components
const JobDetailPage = lazy(() => import('./pages/JobDetailPage'));

<Suspense fallback={<LoadingSpinner />}>
  <JobDetailPage />
</Suspense>
```

### 2. Asset Optimization

**Images:**
- Use WebP format where possible
- Compress images before deployment
- Use responsive images with srcset

**Fonts:**
- Preload critical fonts in `index.html`:
```html
<link rel="preload" href="/fonts/Inter.woff2" as="font" type="font/woff2" crossorigin>
```

### 3. Bundle Analysis

```bash
npm run build -- --mode analyze
```

Or install bundle analyzer:
```bash
npm install -D rollup-plugin-visualizer
```

### 4. CDN Configuration

Configure caching headers:

| Asset Type | Cache Duration |
|------------|----------------|
| HTML | No cache |
| JS/CSS with hash | 1 year |
| Images | 1 month |
| Fonts | 1 year |

---

## Monitoring and Analytics

### 1. Error Tracking (Sentry)

```bash
npm install @sentry/react
```

**src/main.tsx:**
```typescript
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  integrations: [
    new Sentry.BrowserTracing(),
  ],
  tracesSampleRate: 1.0,
});
```

### 2. Analytics (Google Analytics)

```bash
npm install react-ga4
```

**src/main.tsx:**
```typescript
import ReactGA from 'react-ga4';

if (import.meta.env.PROD) {
  ReactGA.initialize(import.meta.env.VITE_GA_MEASUREMENT_ID);
}
```

### 3. Performance Monitoring

Use Web Vitals:
```bash
npm install web-vitals
```

```typescript
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

---

## Security Checklist

- [ ] HTTPS enabled for all environments
- [ ] Content Security Policy (CSP) configured
- [ ] Environment variables not exposed in build
- [ ] API keys stored securely (not in source code)
- [ ] CORS properly configured
- [ ] Authentication tokens stored in httpOnly cookies
- [ ] XSS protection headers enabled
- [ ] Regular dependency updates (`npm audit`)

**CSP Header Example:**
```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.your-domain.com
```

---

## Domain Configuration

### Custom Domain Setup

**Vercel:**
1. Project Settings → Domains
2. Add your domain
3. Update DNS records as instructed

**DNS Records:**
```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### SSL Certificate

Most platforms (Vercel, Netlify, CloudFront) provide automatic SSL certificates via Let's Encrypt.

For custom setup:
```bash
# Generate certificate with Certbot
certbot certonly --standalone -d your-domain.com
```

---

## Rollback Strategy

### Vercel
```bash
vercel rollback [deployment-url]
```

### Docker
```bash
# Tag releases
docker tag runner-observatory:latest runner-observatory:v1.0.0

# Rollback
docker pull runner-observatory:v0.9.0
docker run -p 8080:80 runner-observatory:v0.9.0
```

### Git-based
```bash
# Revert to previous commit
git revert HEAD
git push origin main
```

---

## Post-Deployment Verification

### Checklist

1. **Functionality:**
   - [ ] Login flow works
   - [ ] All navigation routes accessible
   - [ ] Charts render correctly
   - [ ] API calls successful
   - [ ] Error handling works

2. **Performance:**
   - [ ] Page load < 3 seconds
   - [ ] Time to Interactive < 5 seconds
   - [ ] No console errors
   - [ ] Lighthouse score > 90

3. **Compatibility:**
   - [ ] Chrome (latest)
   - [ ] Firefox (latest)
   - [ ] Safari (latest)
   - [ ] Mobile responsive

4. **SEO:**
   - [ ] Meta tags present
   - [ ] robots.txt configured
   - [ ] Sitemap generated

### Testing Commands

```bash
# Test production build locally
npm run build && npm run preview

# Lighthouse audit
npx lighthouse http://localhost:4173 --view

# Check bundle size
npm run build -- --mode analyze
```

---

## Troubleshooting

### Build Fails

**Issue:** Out of memory  
**Solution:**
```bash
NODE_OPTIONS=--max-old-space-size=4096 npm run build
```

### Routes Return 404

**Issue:** Server doesn't redirect all routes to index.html  
**Solution:** Configure server to serve index.html for all routes (see platform configs above)

### Environment Variables Not Working

**Issue:** Variables undefined in production  
**Solution:** 
- Ensure variables start with `VITE_`
- Rebuild after changing variables
- Check platform environment variable configuration

### API Calls Fail

**Issue:** CORS errors or connection refused  
**Solution:**
- Verify VITE_API_URL is correct
- Check API CORS configuration
- Verify API is accessible from production domain

---

## Maintenance

### Regular Updates

```bash
# Check for outdated packages
npm outdated

# Update dependencies
npm update

# Security audit
npm audit
npm audit fix
```

### Backup Strategy

- Version control (Git) for source code
- Environment variables stored in secure vault (1Password, AWS Secrets Manager)
- Database backups (if using persistence layer)

---

## Cost Estimates

| Platform | Free Tier | Paid (Monthly) |
|----------|-----------|----------------|
| Vercel | 100GB bandwidth | $20+ |
| Netlify | 100GB bandwidth | $19+ |
| GitHub Pages | Unlimited (public repos) | Free |
| AWS S3 + CloudFront | $1-5 (small traffic) | $10-50 |

---

## Support and Resources

- [Vite Deployment Docs](https://vitejs.dev/guide/static-deploy.html)
- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com)
- [AWS Static Website Hosting](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)

---

**Ready to deploy!** Choose your platform and follow the steps above. For questions, refer to the README.md or contact the development team.
