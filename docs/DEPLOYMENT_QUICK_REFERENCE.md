# Cloud Run Deployment - Quick Reference

## 📁 Files Created/Modified

### Client

- ✅ `client/Dockerfile` - Multi-stage build with Nginx
- ✅ `client/nginx.conf` - Nginx configuration for SPA routing
- ✅ `client/.dockerignore` - Optimize build context
- ✅ `.github/workflows/deploy-client.yaml` - Client deployment workflow

### Server

- ✅ `server/Dockerfile` - Updated for Cloud Run (port 8080, Prisma support)
- ✅ `.github/workflows/deploy-server.yaml` - Server deployment workflow

### Documentation

- ✅ `docs/GCP_DEPLOYMENT_SETUP.md` - Complete setup guide

## 🚀 Quick Setup Commands

```bash
# 1. Set variables
export PROJECT_ID="your-project-id"
export REGION="us-central1"
export GITHUB_REPO="wechuli/github-actions-runne"

# 2. Enable APIs
gcloud services enable cloudresourcemanager.googleapis.com iam.googleapis.com \
  iamcredentials.googleapis.com run.googleapis.com \
  artifactregistry.googleapis.com secretmanager.googleapis.com

# 3. Create Artifact Registry
gcloud artifacts repositories create github-actions-runner \
  --repository-format=docker --location=$REGION

# 4. Create Service Account
gcloud iam service-accounts create github-actions-deployer \
  --display-name="GitHub Actions Deployer"

# 5. Grant permissions (run all 4 commands from the setup guide)
# See GCP_DEPLOYMENT_SETUP.md for detailed IAM commands

# 6. Setup Workload Identity
gcloud iam workload-identity-pools create github-actions-pool --location="global"

gcloud iam workload-identity-pools providers create-oidc github-actions-provider \
  --location="global" \
  --workload-identity-pool="github-actions-pool" \
  --issuer-uri="https://token.actions.githubusercontent.com" \
  --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository" \
  --attribute-condition="assertion.repository=='${GITHUB_REPO}'"

# 7. Get provider name (copy this for GitHub secrets)
gcloud iam workload-identity-pools providers describe github-actions-provider \
  --location="global" --workload-identity-pool="github-actions-pool" \
  --format="value(name)"

# 8. Allow impersonation
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')
gcloud iam service-accounts add-iam-policy-binding \
  github-actions-deployer@${PROJECT_ID}.iam.gserviceaccount.com \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/github-actions-pool/attribute.repository/${GITHUB_REPO}"

# 9. Create database secret
echo -n "postgresql://user:pass@host:5432/db" | gcloud secrets create DATABASE_URL --data-file=-
```

## 🔐 GitHub Secrets Required

| Secret                           | Example Value                                                                                               |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `GCP_PROJECT_ID`                 | `my-project-123`                                                                                            |
| `GCP_REGION`                     | `us-central1`                                                                                               |
| `GCP_WORKLOAD_IDENTITY_PROVIDER` | `projects/123/locations/global/workloadIdentityPools/github-actions-pool/providers/github-actions-provider` |
| `GCP_SERVICE_ACCOUNT`            | `github-actions-deployer@my-project-123.iam.gserviceaccount.com`                                            |

## 📦 What Gets Deployed

### Client (React + Nginx)

- **URL**: `https://github-actions-runner-client-{hash}-uc.a.run.app`
- **Port**: 8080
- **Resources**: 512Mi RAM, 1 CPU
- **Features**: SPA routing, gzip compression, security headers

### Server (Node.js + Express + Prisma)

- **URL**: `https://github-actions-runner-server-{hash}-uc.a.run.app`
- **Port**: 8080
- **Resources**: 1Gi RAM, 1 CPU
- **Features**: Auto migrations, database secrets, API endpoints

## 🔄 Deployment Triggers

- **Client**: Changes to `client/**` or `.github/workflows/deploy-client.yaml`
- **Server**: Changes to `server/**` or `.github/workflows/deploy-server.yaml`

## 📊 Monitoring

```bash
# View service status
gcloud run services list --region=$REGION

# Stream logs
gcloud run services logs tail github-actions-runner-client --region=$REGION
gcloud run services logs tail github-actions-runner-server --region=$REGION

# Get service URLs
gcloud run services describe github-actions-runner-client --region=$REGION --format='value(status.url)'
gcloud run services describe github-actions-runner-server --region=$REGION --format='value(status.url)'
```

## 🔧 Local Testing

### Test Client Docker Build

```bash
cd client
docker build -t test-client .
docker run -p 8080:8080 test-client
# Visit http://localhost:8080
```

### Test Server Docker Build

```bash
cd server
docker build -t test-server .
docker run -p 8080:8080 -e DATABASE_URL="your-db-url" test-server
# Test http://localhost:8080/api/health
```

## ⚡ Key Features

- ✅ **No Service Account Keys**: Uses Workload Identity Federation (OIDC)
- ✅ **Automatic Scaling**: Scales to zero when idle
- ✅ **Separate Deployments**: Client and server deploy independently
- ✅ **Database Migrations**: Auto-run on server deployment
- ✅ **Optimized Builds**: Multi-stage Docker builds
- ✅ **Secure**: Secrets in Secret Manager, non-root containers

## 🐛 Troubleshooting

### "Permission denied" errors

- Verify all IAM roles are granted (step 5 in setup)
- Check service account email matches exactly

### "Workload identity provider not found"

- Ensure the full resource name format is correct
- Format: `projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/POOL_NAME/providers/PROVIDER_NAME`

### Build fails with "Cannot find module"

- Check `.dockerignore` isn't excluding necessary files
- Verify `package.json` and dependencies are copied

### Server can't connect to database

- Verify `DATABASE_URL` secret exists
- Check secret IAM permissions
- Ensure secret is latest version

## 💰 Cost Estimate

With scale-to-zero enabled:

- **Idle**: $0/month (no charges when not in use)
- **Light usage**: ~$5-10/month
- **Moderate usage**: ~$20-30/month

Pricing factors:

- Request count
- CPU/Memory allocation time
- Egress traffic
- Container image storage
