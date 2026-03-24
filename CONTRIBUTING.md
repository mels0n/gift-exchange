# Contributing to Giftr 🎁

We love community contributions! Whether you're fixing a bug, suggesting a feature, or improving the documentation, your help is welcome.

## 🛠️ Development Setup

To contribute to Giftr, you'll need the following installed locally:
- **Node.js**: 20.x+
- **Nginx** (optional, for testing production proxying)
- **SQLite** (included via Prisma)

### 1. Initial Setup
```bash
# Clone and install
git clone https://github.com/your-repo/giftr.git
cd giftr
npm install

# Environment variables
cp .env.example .env
# Edit .env with your local settings (e.g. Resend key, secret)
```

### 2. Database Initialization
```bash
npx prisma generate
npx prisma db push
# Optional: Seed the database with some example households
npm run prisma:seed 
```

### 3. Running in Development
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

## 📐 Coding Standards

We use **Feature-Slice Design (FSD)** to keep the codebase organized and scalable.

- **`src/shared`**: Cross-cutting tools, UI components, and libraries.
- **`src/features`**: Self-contained logic slices (e.g., `auth`, `matching`).
- **`src/app`**: Next.js App Router pages and global configuration.

### Best Practices:
- **Absolute Imports**: Use `@/` (e.g., `@/shared/ui/button`).
- **TypeScript**: Ensure all new code is properly typed.
- **Linting**: Run `npm run lint` before submitting a PR.

## 🤝 Pull Request Process

1. **Fork the Repo**: Create a new branch for your feature or fix.
2. **Keep it Small**: Focused PRs are easier to review and merge.
3. **Write Clear Commits**: Use conventional commits (e.g., `feat:`, `fix:`, `docs:`).
4. **Documentation**: If you change a core feature, please update the corresponding "twin file" in `docs/architecture/slices/`.
5. **Review**: Once your PR is ready, request a review from a maintainer.

## 🐛 Reporting Bugs

Found a bug? Please open an issue with:
- A clear, descriptive title.
- Steps to reproduce the issue.
- Your environment details (OS, Node version, etc.).
- Expected vs. actual behavior.

---

*Thank you for helping make Giftr better for everyone!*
