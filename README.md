# The Cousin Exchange 🎁

A self-hosted, Dockerized gift exchange platform for large families.

## Features
- **Multi-Event Support**: Run different exchanges for different groups (Cousins, Adults, etc.).
- **Smart Matching**: Constraint solver prevents siblings from picking each other.
- **Fair Math**: Automatically calculates the exact budget and package count per participant.
- **Self-Hosted**: Powered by SQLite and Docker. You own your data.
- **Automated**: Background scheduler handles "Nagging" emails and auto-matching on deadlines.

## Getting Started

### Prerequisites
- Docker & Docker Compose
- A [Resend](https://resend.com) API Key (for email notifications)

### Running Locally
1. Clone the repo.
2. Create `data/` folder: `mkdir data`
3. Create `.env` file: `RESEND_API_KEY=re_123...`
4. Run:
   ```bash
   docker-compose up -d
   ```
5. Open `http://localhost:3000`

## Documentation
- [Deployment Guide](./DEPLOY.md)
- [Architecture](./docs/ARCHITECTURE.md)
