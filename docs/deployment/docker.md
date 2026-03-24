# Docker Deployment Guide 🐳

Deploying Giftr with Docker is the recommended way to get up and running quickly with minimal configuration.

## 📋 Prerequisites

- **Docker**: [Install Docker](https://docs.docker.com/get-docker/)
- **Docker Compose**: Usually included with Docker Desktop.
- **Resend API Key**: Required for email notifications. [Get one here](https://resend.com).

## 🚀 Quick Start

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/your-repo/giftr.git
    cd giftr
    ```

2.  **Configure Environment Variables**
    Copy the example environment file and edit it with your secrets:
    ```bash
    cp .env.example .env
    ```
    *At a minimum, set `RESEND_API_KEY`, `SESSION_SECRET`, and `NEXT_PUBLIC_BASE_URL`.*

3.  **Launch with Docker Compose**
    ```bash
    docker-compose up -d
    ```

4.  **Access the Application**
    Open [http://localhost:3000](http://localhost:3000) in your browser.

## ⚙️ Configuration Details

### Persistence
Giftr uses a SQLite database for simplicity. The `docker-compose.yml` file is configured to persist this data in a local `data/` directory:
```yaml
volumes:
  - ./data:/app/data
```
**Important**: Ensure the `data/` directory exists and is writeable by the Docker user.

### Email Configuration
To receive OTPs and match notifications, you must provide a valid Resend API key in your `.env` file:
```env
RESEND_API_KEY="re_123456789"
EMAIL_FROM="Giftr <no-reply@yourdomain.com>"
```
If `RESEND_API_KEY` is not set or doesn't start with `re_`, the system will log emails to the console instead of sending them.

## 🩺 Healthchecks

The container includes a built-in healthcheck that monitors the `/api/health` endpoint:
- **Interval**: 30 seconds
- **Retries**: 3
- **Timeout**: 10 seconds

You can check the status of your container with:
```bash
docker ps
```
Look for `(healthy)` in the status column.

## 🛑 Stopping and Restarting

- **Stop**: `docker-compose stop`
- **Down (and remove containers)**: `docker-compose down`
- **Restart**: `docker-compose restart`
- **Rebuild (after code changes)**: `docker-compose up -d --build`
