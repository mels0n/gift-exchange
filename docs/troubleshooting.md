# Troubleshooting Guide 🛠️

Having issues with your Giftr instance? Here are the most common problems and how to fix them.

## 📧 Email Issues (OTPs not arriving)

**Symptom**: You request a login code but never receive the email.

1.  **Check the Job Queue**:
    - Log in to the application and check the "Admin" dashboard (if accessible).
    - Look for pending or failed jobs in the `Job` table in your database.
2.  **Verify Resend API Key**:
    - Ensure `RESEND_API_KEY` in your `.env` starts with `re_`.
    - Check the server logs for `[MOCK SEND_OTP]`. If you see this, the key is invalid or not configured correctly for production.
3.  **Check Spam/Junk**: It sounds simple, but it happens!
4.  **Confirm `EMAIL_FROM`**: Ensure the sender email is authorized in your Resend dashboard.

## 📦 Docker Issues

**Symptom**: The container won't start or keeps crashing.

1.  **Check Logs**:
    ```bash
    docker-compose logs -f app
    ```
2.  **Database Locking**: SQLite can occasionally lock if two processes try to write at once. Restart the container to clear any stale locks:
    ```bash
    docker-compose restart app
    ```
3.  **Permissions**: Ensure the `data/` directory is writeable:
    ```bash
    sudo chmod -R 775 data/
    ```

## 🧩 Database Errors (Prisma)

**Symptom**: "Prisma Client could not connect to database" or migration errors.

1.  **URL Check**: Verify `DATABASE_URL` in `.env` is correct. For Docker, it should be `file:/app/data/store.db`.
2.  **Force Synchronization**: If the schema is out of sync with the DB file:
    ```bash
    npx prisma db push --force-reset
    ```
    *WARNING: This will delete all data in your database. Use with extreme caution!*

## ❓ Frequently Asked Questions

### Can I change the gift budget after matching?
No. Once the "Matching" algorithm has run and assignments are sent, the event is locked. You would need to archive the event and start a new one to change the rules.

### Can I use a different email provider?
Currently, Giftr is optimized for **Resend**. To use another provider (Postmark, SendGrid), you would need to modify the `processSingleJob` function in `src/features/admin-scheduler/api/process-queue.ts`.

### How do I reset my admin password?
Giftr doesn't have passwords! Just ensure you have access to the email address associated with your household and request a new OTP.
