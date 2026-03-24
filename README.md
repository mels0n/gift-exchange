# Giftr 🎁

> A professional, self-hosted, Dockerized gift exchange platform for large families and communities.

![Giftr UI Preview](file:///C:/Users/chris/.gemini/antigravity/brain/d4690d9a-ef8c-4345-960f-09bf3031c28e/giftr_ui_preview_1774318135864.png)

## 🌟 Features

- **Multi-Event Support**: Run different exchanges for different groups (Cousins, Adults, etc.).
- **Smart Matching**: Constraint solver prevents households from picking their own members.
- **Fair Math**: Automatically calculates the exact budget and package count per participant.
- **Self-Hosted**: Powered by SQLite and Docker. You own your data.
- **Automated**: Background scheduler handles OTP delivery and match notifications.
- **Modern UI**: Clean, responsive dark mode with glassmorphism effects.

## 🚀 Quick Start (Docker)

The fastest way to get started is using Docker Compose.

### Prerequisites
- [Docker & Docker Compose](https://docs.docker.com/get-docker/)
- A [Resend](https://resend.com) API Key (for email notifications)

### Installation
1.  **Clone the repo**: `git clone https://github.com/your-repo/giftr.git`
2.  **Configure Environment**: Copy `.env.example` to `.env` and add your `RESEND_API_KEY`.
3.  **Run with Docker**:
    ```bash
    docker-compose up -d
    ```
4.  **Access App**: Open `http://localhost:3000`

## 📚 Documentation

For detailed guides, checkout our documentation folder:

- [**Deployment Guide**](./docs/deployment/INDEX.md) — Detailed Docker and VPS setup.
- [**Architecture**](./docs/architecture/INDEX.md) — How the system works under the hood.
- [**Troubleshooting**](./docs/troubleshooting.md) — Solutions to common issues.

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: SQLite via Prisma
- **Styling**: Tailwind CSS v4
- **Emails**: Resend API
- **Deployment**: Docker / Docker Compose

## 🤝 Contributing

Contributions are welcome! Please see our [Contributing Guide](./CONTRIBUTING.md) for more details.

---

*Giftr — Organizing family magic since 2026.*
