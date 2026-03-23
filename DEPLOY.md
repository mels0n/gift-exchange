# Deployment Guide 🚀

## 1. Prerequisites
- **Docker**: Install Docker Desktop (Windows/Mac) or Docker Engine (Linux).
- **Resend Account**: Required for sending emails.

## 2. Setting up Resend (Email)
1. Go to [resend.com](https://resend.com) and sign up (Free tier includes 3000 emails/mo).
2. **Add a Domain**:
   - Click "Domains" -> "Add Domain".
   - Follow the instructions to add the DNS records (TXT, MX) to your domain provider (GoDaddy, Namecheap, Cloudflare, etc.).
   - *Tip*: If you don't have a domain, you can technically test with a regulated email, but for a real family event, a domain ($10/yr) is highly recommended for deliverability.
3. **Create API Key**:
   - Go to "API Keys".
   - Create a new key with "Sending access".
   - **Copy this key immediately**. You won't see it again.

## 3. Server Setup (Self-Hosted)
You can run this on any computer that stays on (Raspberry Pi, VPS, or your own PC).

1. **Clone the Project**:
   ```bash
   git clone <your-repo-url>
   cd gift-exchange
   ```

2. **Configure Environment**:
   Create a file named `.env` in the root folder:
   ```env
   # .env
   RESEND_API_KEY=re_123456789...
   DATABASE_URL=file:/app/data/store.db
   ```

3. **Create Data Directory**:
   ```bash
   mkdir data
   ```

## 4. Launching
Run the following command to build and start the container:

```bash
docker-compose up -d
```

- **Wait 1-2 minutes** for the build to finish.
- Check logs: `docker-compose logs -f`
- Open your browser to `http://localhost:3000`

## 5. Updates
To update the app code:
```bash
git pull
docker-compose build --no-cache
docker-compose up -d
```
