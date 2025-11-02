# 🎯 Cloud Run Deployment - Setup Checklist

Use this checklist to ensure everything is configured correctly before deploying.

## ✅ Pre-Deployment Checklist

### 1. GCP Configuration

- [ ] Google Cloud Project created
- [ ] `gcloud` CLI installed and authenticated
- [ ] Required APIs enabled (Run, Artifact Registry, IAM, Secret Manager)
- [ ] Artifact Registry repository created (`runnerjobmonitor`)
- [ ] Service account created (`github-actions-deployer`)
- [ ] IAM roles granted (Run Admin, Service Account User, Artifact Registry Writer, Secret Manager Accessor)
- [ ] Workload Identity Pool created (`github-actions-pool`)
- [ ] Workload Identity Provider created (`github-actions-provider`)
- [ ] Service account impersonation configured
- [ ] DATABASE_URL secret created in Secret Manager

### 2. GitHub Configuration

- [ ] Repository admin access confirmed
- [ ] GitHub Secrets added:
  - [ ] `GCP_PROJECT_ID`
  - [ ] `GCP_REGION`
  - [ ] `GCP_WORKLOAD_IDENTITY_PROVIDER`
  - [ ] `GCP_SERVICE_ACCOUNT`

### 3. Code Configuration

- [ ] Client Dockerfile exists (`client/Dockerfile`)
- [ ] Client nginx.conf exists (`client/nginx.conf`)
- [ ] Server Dockerfile updated (`server/Dockerfile`)
- [ ] Client workflow exists (`.github/workflows/deploy-client.yaml`)
- [ ] Server workflow exists (`.github/workflows/deploy-server.yaml`)
- [ ] Server uses PORT environment variable

### 4. Local Testing (Optional but Recommended)

- [ ] Client Docker build succeeds locally
- [ ] Server Docker build succeeds locally
- [ ] Client runs on port 8080 locally
- [ ] Server runs on port 8080 locally

## 🧪 Testing Commands

### Test Client Build

```bash
cd client
docker build -t test-client .
docker run -p 8080:8080 test-client
# Visit http://localhost:8080
```

### Test Server Build

```bash
cd server
docker build -t test-server .
docker run -p 8080:8080 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/db" \
  -e PORT=8080 \
  test-server
# Visit http://localhost:8080
```

## 🚀 Deployment Steps

### Initial Deployment

1. **Commit and push**

   ```bash
   git add .
   git commit -m "feat: add Cloud Run deployment"
   git push origin main
   ```

2. **Watch GitHub Actions**

   - Go to repository → Actions tab
   - Both workflows should trigger
   - Wait for green checkmarks ✅

3. **Verify Deployment**

   ```bash
   # Check services
   gcloud run services list --region=us-central1

   # Get URLs
   gcloud run services describe runnerjobmonitor-client \
     --region=us-central1 --format='value(status.url)'

   gcloud run services describe runnerjobmonitor-server \
     --region=us-central1 --format='value(status.url)'
   ```

### Subsequent Deployments

- Push to `client/**` → Only client deploys
- Push to `server/**` → Only server deploys
- Push to both → Both deploy

## 🔍 Verification Commands

### Check Service Status

```bash
# Client
gcloud run services describe runnerjobmonitor-client \
  --region=us-central1 --format=yaml

# Server
gcloud run services describe runnerjobmonitor-server \
  --region=us-central1 --format=yaml
```

### View Logs

```bash
# Client logs
gcloud run services logs tail runnerjobmonitor-client \
  --region=us-central1

# Server logs
gcloud run services logs tail runnerjobmonitor-server \
  --region=us-central1
```

### Test Endpoints

```bash
# Get URLs
CLIENT_URL=$(gcloud run services describe runnerjobmonitor-client \
  --region=us-central1 --format='value(status.url)')

SERVER_URL=$(gcloud run services describe runnerjobmonitor-server \
  --region=us-central1 --format='value(status.url)')

# Test client
curl -I $CLIENT_URL

# Test server (adjust endpoint)
curl $SERVER_URL/api/health
```

## ⚠️ Common Issues & Solutions

### Issue: "Permission denied to get service"

**Solution**: Verify IAM roles are granted correctly

```bash
gcloud projects get-iam-policy $PROJECT_ID \
  --flatten="bindings[].members" \
  --filter="bindings.members:serviceAccount:github-actions-deployer@*"
```

### Issue: "Image not found"

**Solution**: Check Artifact Registry permissions and image push

```bash
gcloud artifacts docker images list \
  us-central1-docker.pkg.dev/$PROJECT_ID/runnerjobmonitor
```

### Issue: "Workload Identity Provider not found"

**Solution**: Verify the provider name format

```bash
gcloud iam workload-identity-pools providers describe github-actions-provider \
  --location=global \
  --workload-identity-pool=github-actions-pool \
  --format="value(name)"
```

### Issue: "Database connection failed"

**Solution**: Check DATABASE_URL secret

```bash
# List secrets
gcloud secrets list

# Check secret access
gcloud secrets get-iam-policy DATABASE_URL
```

## 📊 Success Indicators

✅ GitHub Actions workflows complete successfully  
✅ Services appear in `gcloud run services list`  
✅ Service URLs return HTTP 200  
✅ Logs show successful startup  
✅ No error messages in Cloud Run console

## 🎉 Post-Deployment

Once everything is working:

- [ ] Document service URLs
- [ ] Set up monitoring/alerting (optional)
- [ ] Configure custom domain (optional)
- [ ] Set up Cloud CDN for client (optional)
- [ ] Configure Cloud SQL for production database (optional)
- [ ] Set up staging environment (optional)

## 📚 Reference Documents

- [Complete Setup Guide](./GCP_DEPLOYMENT_SETUP.md)
- [Quick Reference](./DEPLOYMENT_QUICK_REFERENCE.md)
- [Main README](../DEPLOYMENT_README.md)

---

**Last Updated**: November 2, 2025  
**Deployment Model**: Google Cloud Run with GitHub Actions OIDC
