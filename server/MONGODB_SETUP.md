# MongoDB Setup Instructions

This guide will help you set up MongoDB for storing GitHub Actions job metrics.

## Prerequisites

- Docker and Docker Compose installed
- Node.js and npm installed

## Setup Steps

### 1. Configure Environment Variables

Copy the `.env.example` file to `.env`:

```bash
cp .env.example .env
```

Update the MongoDB credentials in `.env` if needed:

```env
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=changeme123
MONGO_DATABASE=github_actions_metrics
MONGO_PORT=27017
MONGO_URI=mongodb://admin:changeme123@localhost:27017/github_actions_metrics?authSource=admin
SESSION_KEY=your-secret-session-key-here
```

### 2. Start MongoDB with Docker Compose

```bash
docker-compose up -d
```

This will start a MongoDB container with:

- Username: `admin` (or as specified in .env)
- Password: `changeme123` (or as specified in .env)
- Database: `github_actions_metrics`
- Port: `27017`

### 3. Verify MongoDB is Running

```bash
docker-compose ps
```

You should see the `github_actions_mongodb` container running.

### 4. Install Dependencies

```bash
npm install
```

### 5. Start the Application

For development:

```bash
npm run dev
```

For production:

```bash
npm run build
npm start
```

## API Endpoints

### Store Job Metrics

**POST** `/api/metrics`

Store new job metrics in MongoDB.

**Request Body:**

```json
{
  "timestamp": "2025-10-31 17:31:20",
  "job_uuid": "4c3ab6d1-ed7e-427f-a876-63022b6417c8",
  "github_context": {
    "user": "wechuli",
    "repositories": [
      {
        "name": "githubuserdemo/ghametricscollectortest",
        "url": "https://github.com/githubuserdemo/ghametricscollectortest"
      }
    ]
  },
  "system": {
    // ... system metrics data
  }
}
```

**Response:**

```json
{
  "success": true,
  "message": "Job metrics stored successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "job_uuid": "4c3ab6d1-ed7e-427f-a876-63022b6417c8",
    "timestamp": "2025-10-31 17:31:20"
  }
}
```

### Get Metrics by Job UUID

**GET** `/api/metrics/:job_uuid`

Retrieve all metrics for a specific job UUID.

**Response:**

```json
{
  "success": true,
  "count": 5,
  "data": [
    // ... array of metrics documents
  ]
}
```

### Get All Metrics (Paginated)

**GET** `/api/metrics?page=1&limit=10`

Retrieve all metrics with pagination.

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of items per page (default: 10)

**Response:**

```json
{
  "success": true,
  "data": [
    // ... array of metrics documents
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

## Database Schema

The application uses Mongoose with the following indexes:

1. **job_uuid** - Simple index (allows duplicate job_uuid values)
2. **job_uuid + timestamp** - Compound index for efficient queries
3. **github_context.user** - Index on user field

These indexes optimize queries for retrieving metrics by job UUID and user.

## Testing the Setup

### Using curl

```bash
# Store metrics
curl -X POST http://localhost:8080/api/metrics \
  -H "Content-Type: application/json" \
  -d @src/data/sample.json

# Get metrics by job UUID
curl http://localhost:8080/api/metrics/4c3ab6d1-ed7e-427f-a876-63022b6417c8

# Get all metrics (paginated)
curl http://localhost:8080/api/metrics?page=1&limit=10
```

## MongoDB Management

### Connect to MongoDB CLI

```bash
docker exec -it github_actions_mongodb mongosh -u admin -p changeme123 --authenticationDatabase admin
```

### View Collections

```javascript
use github_actions_metrics
show collections
db.jobmetrics.find().pretty()
```

### Stop MongoDB

```bash
docker-compose down
```

### Stop and Remove Data

```bash
docker-compose down -v
```

## Troubleshooting

### Connection Issues

If you can't connect to MongoDB:

1. Check if the container is running:

   ```bash
   docker-compose ps
   ```

2. Check container logs:

   ```bash
   docker-compose logs mongodb
   ```

3. Verify the MONGO_URI in `.env` matches your setup

### Port Conflicts

If port 27017 is already in use, change `MONGO_PORT` in `.env` and restart:

```bash
docker-compose down
docker-compose up -d
```

## Production Considerations

For production environments:

1. **Use Strong Passwords**: Change the default MongoDB credentials
2. **Enable SSL/TLS**: Configure MongoDB to use encrypted connections
3. **Set Up Backups**: Implement regular backup strategies
4. **Configure Replica Sets**: For high availability
5. **Resource Limits**: Set appropriate CPU/memory limits in docker-compose.yml
6. **Network Security**: Use proper firewall rules and network isolation
