# Secure Share (v2.5) — Full-Screen Desktop File Sharing System

A professional, full-screen desktop web application for zero-trust cryptographic peer-to-peer file sharing between registered users via email addresses, featuring exactly four primary navigation items and strict recipient acceptance gating.

---

## 🖥️ 1. Full-Screen Desktop Website Architecture

- **No Mobile Frame**: All phone-shaped containers, mockups, and mobile bezels have been eliminated.
- **Full Viewport Layout**: The login page and application dashboard occupy the full browser viewport with a professional desktop-first layout.
- **Original Color Identity**: Preserves the original blue-and-white visual identity (`#0066ff` blue accents, crisp `#ffffff` cards, and dark navy `#0b132b` canvas).
- **Responsive**: Adapts naturally across desktop computers, laptops, tablets, and mobile browsers without artificial phone enclosures.

---

## 🗺️ 2. Exactly Four Primary Navigation Tabs

After authentication, the website displays **exactly four primary navigation items** in the global header:

```
[ 1. Send Files ]   [ 2. Receive Files ]   [ 3. Request ]   [ 4. Logout ]
```

1. **Send Files**: Email-based file dispatch supporting multiple files, drag-and-drop, recipient validation, optional messages, and link expiration.
2. **Receive Files**: Dedicated incoming transfer interface where the recipient can inspect request details, view file metadata, and explicitly **Accept** (unlocking authorized downloads) or **Reject** (permanently denying access).
3. **Request** *(Replaces File Management)*: Centralized request management console with **Sent Requests** and **Received Requests** sub-tabs, filterable by status (`All`, `Pending`, `Accepted`, `Rejected`, `Cancelled`), with detailed file breakdowns and a Cancel action for pending requests.
4. **Logout** *(Replaces System Configuration)*: Securely terminates the server session in SQLite, deletes client tokens, and redirects immediately to the full-screen login console.

---

## 📬 3. Email-Based File Sharing Workflow

```
[ Sender: User A ] ─── (Selects Multiple Files + Recipient Email + Message)
        │
        ▼
[ Backend Server ] ─── (Stores in Private Storage with SHA-256 Checksum)
        │
        ▼
[ Status: PENDING ] ───► [ Email Notification Dispatched to Recipient ]
                                   │
        ┌──────────────────────────┴──────────────────────────┐
        ▼                                                     ▼
[ Recipient Clicks ACCEPT ]                           [ Recipient Clicks REJECT ]
        │                                                     │
        ▼                                                     ▼
[ Status: ACCEPTED ]                                  [ Status: REJECTED ]
[ Downloads Unlocked for Recipient ]                  [ File Access Permanently Denied ]
```

### Security & Gating Rules:
- **Zero Direct Downloads While Pending**: Sending a request does **not** grant immediate download permissions. Direct file access is strictly blocked (`403 Forbidden`) until the recipient explicitly logs in and accepts the request.
- **Sender Identity Integrity**: Sender email and ID are derived strictly from the verified server-side session token; users cannot spoof or alter sender identities.
- **Private Storage**: Files are stored in a private directory (`uploads/`) with unguessable UUIDs outside the public static directory. Path traversal is prevented using safe basename sanitization.

---

## 📧 4. Email Notification Configuration

The application includes an actual native Node.js SMTP email notification engine.

### Environment Variables:
To enable live email delivery to recipients, configure the following environment variables (or create a `.env` file):

| Variable | Description | Example |
|---|---|---|
| `SMTP_HOST` | Hostname of your SMTP server | `smtp.gmail.com` or `smtp.sendgrid.net` |
| `SMTP_PORT` | SMTP port (465 for TLS, 587 for STARTTLS) | `587` |
| `SMTP_USER` | SMTP username / email | `notifications@yourdomain.com` |
| `SMTP_PASS` | SMTP password / app password | `your-secret-smtp-password` |
| `SMTP_FROM` | Sender address shown in email | `"Secure Share Console" <noreply@yourdomain.com>` |
| `APP_BASE_URL`| Base URL of the website | `http://localhost:3000` (or your domain) |

> **Development Mode / Unconfigured Notice:**
> If SMTP environment variables are not configured, the server does **not** falsely claim delivery. It safely logs a development diagnostic to the console and records the simulated email in the `email_logs` database table.

---

## 🚀 5. How to Run Locally

### Method 1: Windows Launcher
Double-click:
```cmd
start.bat
```

### Method 2: Command Line (PowerShell)
```powershell
& "C:\Users\ELCOT\AppData\Roaming\Antigravity\bin\agy-node.cmd" server.js
```

### Access URLs:
- **Primary Website**: [http://localhost:3000](http://localhost:3000)
- **Secondary Port**: [http://localhost:8080](http://localhost:8080)

---

## 👥 6. Pre-Configured Demo Accounts

For rapid two-way transfer testing, use the **AUDITOR QUICK SANDBOX** buttons on the login screen:

| Account | Email | Password | Role |
|---|---|---|---|
| **Alice Walker** | `alice@secureshare.io` | `Password123!` | Cloud Demo (Sender / Receiver) |
| **Bob Martinez** | `bob@secureshare.io` | `Password123!` | Offline Demo (Sender / Receiver) |
| **Mathan Hardik** | `mathanhardik68@gmail.com` | `Password123!` | Primary Node Administrator |
