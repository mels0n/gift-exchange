# Security Guide 🛡️

Giftr is designed for family and small-community use. While we prioritize data privacy, self-hosting requires active security management on your part.

## 🍪 Session Security

Giftr uses signed, `HttpOnly` cookies to manage user sessions.

- **`SESSION_SECRET`**: This environment variable is used to sign your session cookies. **You must change this to a random 32+ character string** before deploying.
    - *To generate*: `openssl rand -hex 32`
- **HTTPS**: Cookies are configured with `secure: process.env.NODE_ENV === 'production'`. This means they will only be sent over HTTPS in production. **Do not run Giftr over plain HTTP in a public environment.**

## 🔑 Authentication (OTP)

Login is passwordless via One-Time Passwords (OTPs) sent to the user's email.

- **Enumeration Protection**: The system returns a success message even if an email is not found, preventing attackers from harvesting your participant list.
- **Short-Lived Codes**: OTPs expire after 10 minutes and are deleted immediately upon successful use.
- **Mock Mode**: In development (or if `RESEND_API_KEY` is not set), codes are logged to the server console instead of being sent.

## 🛠️ Admin Access

> [!IMPORTANT]
> The `/admin` routes currently do not have a separate role-based access control (RBAC) layer.

By default, any user who can successfully log in via OTP might be able to access administrative functions if the routes are known.
- **Recommendation**: Use a reverse proxy (like Nginx) to restrict access to the `/admin` path to specific IP addresses, or implement a basic auth layer in front of the admin dashboard.

## 🔌 Networking & Firewall

- **Port 3000**: Giftr listens on port 3000 by default. Ensure your firewall only allows traffic to this port from your reverse proxy or trusted sources.
- **Database**: The SQLite database (`data/store.db`) should never be exposed to the public internet. It is stored locally within the container/server.

## 🛡️ Best Practices

1. **Keep Docker Updated**: Regularly run `docker-compose pull` and `docker-compose up -d` to get the latest security patches.
2. **Limit Access**: Only invite people you trust. The "invite-only" nature of the app is its first line of defense.
3. **Database Backups**: Regularly backup your `data/` directory. Since it's SQLite, you can simply copy the `store.db` file while the app is stopped.
