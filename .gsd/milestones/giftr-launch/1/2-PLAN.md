---
phase: 1
plan: 2
wave: 2
---

# Plan 1.2: Style OTP Email

## Objective
The OTP login email is currently bare `<p>` tags — completely unstyled while the invite and match emails are fully branded with dark background, red accents, and proper HTML structure. Fix it to match the Giftr aesthetic so the first email a new user receives looks as polished as the rest.

## Context
- src/features/admin-scheduler/api/process-queue.ts — SEND_OTP handler (the `case 'SEND_OTP':` block)
- Reference: SEND_INVITE email HTML in the same file (same dark aesthetic to match)

## Tasks

<task type="auto">
  <name>Replace SEND_OTP email with branded HTML template</name>
  <files>src/features/admin-scheduler/api/process-queue.ts</files>
  <action>
    Find the `case 'SEND_OTP':` block. Currently the html is:
    ```ts
    html: `<p>Your code is: <strong>${payload.code}</strong></p>`,
    ```

    Replace the entire `resend.emails.send(...)` call's `html` value with a proper branded template. Match the dark aesthetic of the SEND_INVITE email already in this file:

    ```ts
    case 'SEND_OTP':
        if (useRealEmail) {
            const otpHtml = `<!DOCTYPE html>
<html>
<body style="font-family:Georgia,serif;background:#0f0f0f;color:#f5f0eb;margin:0;padding:32px;">
  <div style="max-width:480px;margin:0 auto;background:#1a1010;border:1px solid #3a2020;border-radius:12px;padding:40px;">
    <h1 style="font-size:22px;color:#f8c4c4;margin:0 0 8px;letter-spacing:0.02em;">🎄 Giftr</h1>
    <p style="color:#806060;font-size:13px;margin:0 0 32px;text-transform:uppercase;letter-spacing:0.08em;">Login Code</p>
    <p style="color:#a08080;font-size:15px;margin:0 0 24px;">Use the code below to sign in. It expires in 10 minutes.</p>
    <div style="text-align:center;background:#0f0808;border:1px solid #5a2020;border-radius:8px;padding:32px 20px;margin-bottom:32px;">
      <span style="font-size:42px;font-weight:700;letter-spacing:0.25em;color:#f8c4c4;font-family:monospace;">${payload.code}</span>
    </div>
    <p style="font-size:12px;color:#604040;text-align:center;margin:0;">If you didn&apos;t request this code, you can safely ignore this email.</p>
  </div>
</body>
</html>`;
            await resend.emails.send({
                from,
                to: payload.email,
                subject: 'Your Giftr Login Code',
                html: otpHtml,
            });
        } else {
            console.log('[MOCK SEND_OTP]', payload);
        }
        break;
    ```

    Key design decisions:
    - Same dark background (#0f0f0f / #1a1010), same border colour (#3a2020) as invite email
    - Code displayed in large monospace with letter-spacing for readability
    - Subject updated from 'Your Login Code' to 'Your Giftr Login Code'
    - Extract html to a named variable (`otpHtml`) to keep the send call clean
    - Do NOT change the mock/else branch
  </action>
  <verify>npm run build 2>&1 | tail -8</verify>
  <done>
    - Build passes
    - SEND_OTP case uses branded HTML template
    - Subject line includes "Giftr"
  </done>
</task>

## Success Criteria
- [ ] SEND_OTP email subject is "Your Giftr Login Code"
- [ ] SEND_OTP email uses dark-themed branded HTML (matches invite email aesthetic)
- [ ] OTP code is displayed prominently in monospace with letter-spacing
- [ ] `npm run build` passes
