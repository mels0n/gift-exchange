# Auth Slice Architecture 🔐

The Auth slice handles user authentication via a passwordless One-Time Password (OTP) flow. It is designed to be minimal and secure for self-hosted environments.

## 🔄 Login Flow (OTP)

The login process is split into two steps using Next.js Server Actions:

### 1. Requesting an OTP (`requestOtp`)
- **Validation**: Validates the email format using Zod.
- **Verification**: Checks if the email belongs to an existing household or a pending invite.
- **Generation**: Generates a random 6-digit numeric code.
- **Persistence**: Stores the code in the SQLite database (`OtpCode` table) with a 10-minute expiry.
- **Communication**: Enqueues a job in the `Job` table (`type: 'SEND_OTP'`). The background scheduler (Resend) picks this up to send the email.
- **Enumeration Protection**: If the email is unknown, it returns a fake success to prevent email enumeration.

### 2. Verifying the OTP (`verifyOtp`)
- **Lookup**: Finds the latest unused, non-expired OTP record for the given email and code.
- **Cleanup**: Immediately deletes the code from the database upon successful verification.
- **Session**: Provisions a global identity cookie via `setSession`.
- **Redirect**: Forwards the user to the dashboard or the requested resource.

## 🍪 Session Management

Sessions are managed in the `src/shared/lib/session.ts` file (Shared Layer).

- **Implementation**: Uses `iron-session` (or standard JWT-based cookies) to store the user's email.
- **Lifetime**: Cookies are configured for a long duration (typically 30 days) to minimize re-logins on mobile devices.
- **Security**:
    - `HttpOnly`: Prevents client-side JS access.
    - `Secure`: Required for HTTPS (should be enabled in production).

## ⚠️ Security Notes for Self-Hosters

While functional, the current implementation has some trade-offs tailored for family-scale usage:

1. **OTP Deliverability**: Relies on a Resend API key. If the key is missing or the job queue fails, OTPs will not be sent. Developers can check the server logs for the code in development.
2. **Cookie Security**: Ensure your VPS/Docker environment is served over HTTPS to protect the session cookies.
3. **No Brute Force Protection**: Currently relying on short 10-minute windows and immediate deletion. Advanced rate-limiting (e.g., via Nginx) is recommended for public instances.
