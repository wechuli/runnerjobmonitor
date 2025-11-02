# GCP Cloud Run Deployment Setup Guide

This guide walks you through setting up GitHub Actions to deploy your client and server to Google Cloud Run using Workload Identity Federation (OIDC).

## Prerequisites

- A Google Cloud Project
- `gcloud` CLI installed and authenticated
- GitHub repository with admin access

## 1. Enable Required GCP APIs

```bash
gcloud services enable \
  cloudresourcemanager.googleapis.com \
  iam.googleapis.com \
  iamcredentials.googleapis.com \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com
```

## 2. Set Environment Variables

```bash
export PROJECT_ID="shambafusionproj"
export REGION="us-central1"  # Change to your preferred region
export GITHUB_REPO="wechuli/runnerjobmonitor"  # Format: owner/repo
```

## 3. Create Artifact Registry Repository

```bash
gcloud artifacts repositories create runnerjobmonitor \
  --repository-format=docker \
  --location=$REGION \
  --description="Docker repository for GitHub Actions Runner Job Monitor"
```

## 4. Create Service Account

```bash
gcloud iam service-accounts create github-actions-deployer \
  --display-name="GitHub Actions Runner Job Deployer" \
  --project=$PROJECT_ID
```

## 5. Grant Required Permissions

```bash
# Cloud Run Admin
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions-deployer@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/run.admin"

# Service Account User
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions-deployer@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"

# Artifact Registry Writer
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions-deployer@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/artifactregistry.writer"

# Secret Manager Secret Accessor (for DATABASE_URL)
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions-deployer@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

## 6. Create Workload Identity Pool

```bash
gcloud iam workload-identity-pools create github-actions-pool \
  --location="global" \
  --display-name="GitHub Actions Pool"
```

## 7. Create Workload Identity Provider

```bash
gcloud iam workload-identity-pools providers create-oidc github-actions-provider \
  --location="global" \
  --workload-identity-pool="github-actions-pool" \
  --issuer-uri="https://token.actions.githubusercontent.com" \
  --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository" \
  --attribute-condition="assertion.repository=='${GITHUB_REPO}'"
```

## 8. Allow GitHub Actions to Impersonate Service Account

```bash
gcloud iam service-accounts add-iam-policy-binding \
  github-actions-deployer@${PROJECT_ID}.iam.gserviceaccount.com \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')/locations/global/workloadIdentityPools/github-actions-pool/attribute.repository/${GITHUB_REPO}"
```

## 9. Get Workload Identity Provider Resource Name

```bash
gcloud iam workload-identity-pools providers describe github-actions-provider \
  --location="global" \
  --workload-identity-pool="github-actions-pool" \
  --format="value(name)"
```

**Copy the output** - you'll need this for GitHub Secrets.

## 10. Create MongoDB Secret (For Server)

```bash
# Create secret for MONGO_URI
echo -n "mongodb+srv://user:password@cluster.mongodb.net/dbname" | gcloud secrets create MONGO_URI \
  --data-file=- \
  --replication-policy="automatic"

# Grant access to Cloud Run service account
gcloud secrets add-iam-policy-binding MONGO_URI \
  --member="serviceAccount:github-actions-deployer@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

## 11. Configure GitHub Repository Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions → New repository secret

Add the following secrets:

| Secret Name                      | Value                                                          | Description           |
| -------------------------------- | -------------------------------------------------------------- | --------------------- |
| `GCP_PROJECT_ID`                 | Your project ID                                                | GCP Project ID        |
| `GCP_REGION`                     | `us-central1` (or your region)                                 | GCP Region            |
| `GCP_WORKLOAD_IDENTITY_PROVIDER` | Output from step 9                                             | Full resource name    |
| `GCP_SERVICE_ACCOUNT`            | `github-actions-deployer@{PROJECT_ID}.iam.gserviceaccount.com` | Service account email |

Example Workload Identity Provider format:

```
projects/123456789/locations/global/workloadIdentityPools/github-actions-pool/providers/github-actions-provider
```

## 12. Update Server to Use PORT Environment Variable

Ensure your server listens on the `PORT` environment variable (Cloud Run requirement):

```typescript
// server/src/index.ts
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

## 13. Deploy

Push changes to the `main` branch:

```bash
git add .
git commit -m "Add Cloud Run deployment"
git push origin main
```

## Workflows Behavior

### Client Workflow (`deploy-client.yaml`)

- **Triggers on**: Changes to `client/**` or workflow file
- **Deploys**: React frontend served by Nginx
- **Port**: 8080
- **Resources**: 512Mi memory, 1 CPU

### Server Workflow (`deploy-server.yaml`)

- **Triggers on**: Changes to `server/**` or workflow file
- **Deploys**: Node.js Express API with MongoDB (Mongoose)
- **Port**: 8080
- **Resources**: 1Gi memory, 1 CPU
- **Database**: Uses MONGO_URI from Secret Manager

## Verify Deployment

```bash
# Check client service
gcloud run services describe runnerjobmonitor-client --region=$REGION

# Check server service
gcloud run services describe runnerjobmonitor-server --region=$REGION

# Get service URLs
gcloud run services list --region=$REGION
```

## Cost Optimization

Both services are configured with:

- `--min-instances=0`: Scale to zero when not in use
- `--max-instances=10`: Limit maximum scale
- `--timeout=300`: 5-minute request timeout

## Troubleshooting

### View Logs

```bash
# Client logs
gcloud run services logs read runnerjobmonitor-client --region=$REGION

# Server logs
gcloud run services logs read runnerjobmonitor-server --region=$REGION
```

##### Issue: "Database connection failed"

**Solution**: Check MONGO_URI secret

```bash
# List secrets
gcloud secrets list

# Check secret access
gcloud secrets get-iam-policy MONGO_URI
```

## Clean Up

To delete all resources:

```bash
# Delete Cloud Run services
gcloud run services delete runnerjobmonitor-client --region=$REGION --quiet
gcloud run services delete runnerjobmonitor-server --region=$REGION --quiet

# Delete Artifact Registry repository
gcloud artifacts repositories delete runnerjobmonitor --location=$REGION --quiet

# Delete service account
gcloud iam service-accounts delete github-actions-deployer@${PROJECT_ID}.iam.gserviceaccount.com --quiet

# Delete Workload Identity Pool
gcloud iam workload-identity-pools delete github-actions-pool --location=global --quiet
```

## Security Best Practices

1. ✅ Using Workload Identity Federation (no service account keys)
2. ✅ Secrets stored in Secret Manager
3. ✅ Least privilege IAM permissions
4. ✅ Repository-scoped authentication
5. ✅ Multi-stage Docker builds for smaller images
6. ✅ Non-root user in containers

## Next Steps

- Set up custom domain mapping
- Configure Cloud CDN for client
- Set up Cloud SQL for production database
- Configure monitoring and alerting
- Set up staging environment
