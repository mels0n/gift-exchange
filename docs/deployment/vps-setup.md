# VPS Deployment Guide 🌐

This guide covers how to manually deploy Giftr on a Linux Virtual Private Server (VPS) using Node.js, Nginx, and PM2.

## 📋 Prerequisites

- **OS**: Ubuntu 22.04 LTS or Debian 11+ (recommended).
- **Node.js**: Version 20.x or higher.
- **NPM**: Version 9.x or higher.
- **Domain Name**: Pointed to your VPS IP address.

## 🏗️ Server Preparation

1.  **Update System Packages**
    ```bash
    sudo apt update && sudo apt upgrade -y
    ```

2.  **Install Node.js (via NodeSource)**
    ```bash
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
    ```

3.  **Install Production Tools**
    ```bash
    sudo npm install -g pm2
    sudo apt install -y nginx
    ```

## 🚀 Application Setup

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/your-repo/giftr.git /var/www/giftr
    cd /var/www/giftr
    ```

2.  **Install Dependencies**
    ```bash
    npm ci
    ```

3.  **Configure Environment**
    ```bash
    cp .env.example .env
    nano .env
    ```
    *Ensure `DATABASE_URL`, `SESSION_SECRET`, and `NEXT_PUBLIC_BASE_URL` are correctly set.*

4.  **Build the Application**
    ```bash
    npx prisma generate
    npx prisma db push
    npm run build
    ```

## 🔄 Process Management (PM2)

Start the application using PM2 to ensure it restarts automatically if it crashes or the server reboots.

```bash
pm2 start npm --name "giftr" -- start
pm2 save
pm2 startup
```

## 🛡️ Reverse Proxy (Nginx)

1.  **Create Nginx Configuration**
    ```bash
    sudo nano /etc/nginx/sites-available/giftr
    ```

2.  **Add Configuration**
    ```nginx
    server {
        listen 80;
        server_name yourdomain.com;

        location / {
            proxy_pass http://localhost:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
    ```

3.  **Enable Site and Restart Nginx**
    ```bash
    sudo ln -s /etc/nginx/sites-available/giftr /etc/nginx/sites-enabled/
    sudo nginx -t
    sudo systemctl restart nginx
    ```

## 🔒 SSL with Certbot

It is highly recommended to use HTTPS.
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

---

*For simpler deployment, see the [Docker Guide](./docker.md).*
