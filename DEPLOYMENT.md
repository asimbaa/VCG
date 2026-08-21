# Valourian Capital Production Deployment Guide (valouriancapital.io)

## 1. Environment Variables & Secrets
Required for the `server.ts` production build:
- `GEMINI_API_KEY`: Required for DeepSpace AI and Sovereign AI generation.
- `STRIPE_SECRET_KEY`: Required for the global Valourian Global Payouts & direct debit routing.
- `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, etc.: Required for client-side Sovereign Store & Data synchronization.
- `SMTP_USER`, `SMTP_PASS`: For Workspace Mail server-side routing (Nodemailer).

## 2. API Constraints & Rate Limits
- **Gemini**: Enforce a 60 RPM limit via a server-side queuing module.
- **Stripe**: Live transfers are rate-limited to 100/sec in production. Idempotency keys must be supplied on batch orders.
- **Firebase**: Maximum 10,000 concurrent connections on the real-time sync nodes (AU-East).

## 3. Build & Deploy Configuration
The application leverages Vite + Express in a unified Cloud Run container (Port 3000).

```bash
# 1. Install Dependencies
npm install

# 2. Build Client & Server Bundles
npm run build 
# (Executes: vite build && esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs)

# 3. Start Production Server
npm run start
# (Executes: node dist/server.cjs)
```

## 4. Sub-Domain Configurations
- **valourian.com.au**: Routes to the primary consumer-facing application layer.
- **valouriancapital.io**: Routes to the Sovereign Hub / Administrative API gateway.
- DNS A-Records must point to the GCP Global Load Balancer IP.

## 5. Security & Compliance
- **Torrens Title Network**: Assets are verified offline and queued for batch synchronization.
- **Biometric Enclave**: Requires WebAuthn / TLS 1.3 minimum for all connections.
