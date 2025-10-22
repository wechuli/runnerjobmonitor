# Deployment Guide

This guide covers deploying the GitHub Actions Runner Observability Tool to production.

## Prerequisites

- Node.js 18+ installed on the server
- Domain name configured (for HTTPS)
- SSL/TLS certificates
- GitHub App credentials
- GCP Storage bucket
- Gemini API key

## Production Considerations

### 1. Database

**SQLite** (current setup) is suitable for:

- Development
- Single-server deployments
- Low to moderate traffic

**PostgreSQL** is recommended for production:

- Better concurrency handling
- More robust for high traffic
- Better backup/restore options
- Supports replication

To migrate to PostgreSQL:

1. Update your `.env`/configuration to point DATABASE_URL at PostgreSQL:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

2. Update environment variable:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
```

3. Run migrations (TypeORM):

```bash
cd server
npx typeorm migration:run
```

### 2. Environment Variables

Create a production `.env` file:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/runner_monitor"

# Server
PORT=3001
NODE_ENV=production

# GitHub App
GITHUB_APP_ID=your_production_app_id
GITHUB_APP_PRIVATE_KEY_PATH=/path/to/private-key.pem
GITHUB_WEBHOOK_SECRET=your_production_webhook_secret
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret

# GCP
GCP_PROJECT_ID=your_project_id
GCP_STORAGE_BUCKET=your_production_bucket
GCP_SERVICE_ACCOUNT_KEY_PATH=/path/to/service-account-key.json

# Gemini
GEMINI_API_KEY=your_production_api_key

# Frontend
FRONTEND_URL=https://your-domain.com
```

**Security Best Practices:**

- Never commit `.env` files to version control
- Use environment-specific files (`.env.production`, `.env.staging`)
- Use secrets management (AWS Secrets Manager, HashiCorp Vault)
- Rotate secrets regularly
- Use least-privilege access

### 3. Backend Deployment

#### Option A: Traditional Server (VPS, EC2, etc.)

1. **Install dependencies:**

```bash
cd backend
npm ci --production
```

2. **Build the application:**

```bash
npm run build
```

3. **Run migrations:**

```bash
npx prisma migrate deploy
```

4. **Start with PM2 (recommended):**

```bash
npm install -g pm2
pm2 start dist/index.js --name runner-monitor-backend
pm2 save
pm2 startup
```

5. **Configure reverse proxy (nginx):**

```nginx
server {
    listen 80;
    server_name api.your-domain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
```

6. **Enable HTTPS with Let's Encrypt:**

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.your-domain.com
```

#### Option B: Docker

1. **Create `backend/Dockerfile`:**

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --production

COPY . .

RUN npx prisma generate
RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]
```

2. **Build and run:**

```bash
docker build -t runner-monitor-backend .
docker run -p 3001:3001 --env-file .env runner-monitor-backend
```

#### Option C: Cloud Platforms

**Heroku:**

```bash
heroku create your-app-name
heroku addons:create heroku-postgresql:hobby-dev
git push heroku main
```

**Railway:**

- Connect GitHub repository
- Configure environment variables
- Deploy automatically on push

**Google Cloud Run:**

```bash
gcloud builds submit --tag gcr.io/PROJECT-ID/runner-monitor-backend
gcloud run deploy --image gcr.io/PROJECT-ID/runner-monitor-backend
```

### 4. Frontend Deployment

1. **Build the frontend:**

```bash
cd frontend
npm run build
```

2. **Deploy to static hosting:**

**Vercel:**

```bash
npm install -g vercel
vercel --prod
```

**Netlify:**

```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

**AWS S3 + CloudFront:**

```bash
aws s3 sync dist/ s3://your-bucket-name/
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

**nginx:**

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/runner-monitor/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3001;
    }
}
```

### 5. Database Backups

**PostgreSQL automated backups:**

```bash
# Create backup script
#!/bin/bash
BACKUP_DIR="/backups/postgres"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
pg_dump -U username dbname > $BACKUP_DIR/backup_$TIMESTAMP.sql
find $BACKUP_DIR -type f -mtime +7 -delete  # Keep 7 days
```

**Cron job:**

```bash
0 2 * * * /path/to/backup-script.sh
```

### 6. Monitoring

**Application Monitoring:**

- Use PM2 for process monitoring
- Set up logging (Winston, Pino)
- Monitor API response times
- Track error rates

**Infrastructure Monitoring:**

- CPU, memory, disk usage
- Database performance
- Network latency
- SSL certificate expiration

**Tools:**

- DataDog
- New Relic
- Prometheus + Grafana
- Sentry (error tracking)

### 7. Scaling

**Horizontal Scaling:**

1. Deploy multiple backend instances
2. Use a load balancer (nginx, HAProxy, AWS ALB)
3. Ensure stateless backend (no in-memory sessions)
4. Use Redis for shared caching

**Database Scaling:**

1. Set up read replicas
2. Implement connection pooling
3. Add database indexes for frequent queries
4. Consider sharding for very large datasets

**CDN for Frontend:**

- Use CloudFront, Cloudflare, or Fastly
- Cache static assets
- Enable gzip/brotli compression

### 8. Security Checklist

- [ ] Enable HTTPS everywhere
- [ ] Set secure HTTP headers (HSTS, CSP, etc.)
- [ ] Implement rate limiting
- [ ] Enable CORS with specific origins
- [ ] Validate webhook signatures
- [ ] Use prepared statements (Prisma does this)
- [ ] Regular dependency updates
- [ ] Security scanning (Snyk, npm audit)
- [ ] Implement logging and monitoring
- [ ] Set up firewall rules
- [ ] Use environment variables for secrets
- [ ] Enable database encryption at rest
- [ ] Regular backups and disaster recovery plan

### 9. Performance Optimization

**Backend:**

- Enable gzip compression
- Implement caching (Redis)
- Use database indexes
- Optimize queries
- Enable connection pooling
- Use CDN for static assets

**Frontend:**

- Code splitting
- Lazy loading
- Image optimization
- Minification and compression
- Service worker for offline support
- Preload critical resources

### 10. Continuous Deployment

**GitHub Actions:**

```yaml
name: Deploy

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
          node-version: "18"

      - name: Install dependencies
        run: |
          cd backend && npm ci
          cd ../frontend && npm ci

      - name: Build
        run: |
          cd backend && npm run build
          cd ../frontend && npm run build

      - name: Deploy Backend
        run: |
          # Your deployment script

      - name: Deploy Frontend
        run: |
          # Your deployment script
```

### 11. Rollback Strategy

**Quick Rollback:**

1. Keep previous builds
2. Use blue-green deployment
3. Maintain database migration history
4. Have automated health checks
5. Document rollback procedures

**Database Migration Rollback:**

```bash
npx prisma migrate resolve --rolled-back MIGRATION_NAME
```

### 12. Health Checks

Use TypeORM's DataSource to run a simple query against the DB:

```typescript
import AppDataSource from "./src/data-source";

app.get("/health", async (req, res) => {
  try {
    await AppDataSource.query("SELECT 1");
    res.json({
      status: "healthy",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({ status: "unhealthy", database: "disconnected" });
  }
});
```

**Monitoring:**

- Set up uptime monitoring (UptimeRobot, Pingdom)
- Configure alerts for downtime
- Monitor response times

## Support

For deployment issues:

1. Check application logs
2. Verify environment variables
3. Test database connectivity
4. Check firewall rules
5. Verify SSL certificates
6. Review nginx/proxy configuration

For more help, open an issue on GitHub.
