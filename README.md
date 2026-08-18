# Srinivasa Heart Foundation Health Survey Kiosk

A premium, bilingual (English/Telugu), voice-first conversational health pre-screening kiosk system developed for the Srinivasa Heart Centre.

## Key Features

- **Pre-Consultation Assessment**: Guides patients through basic personal details, cardiovascular symptoms, medical history, lifestyle choices, and family medical risk factors.
- **Conversational Voice Assistant**: Prompts questions aloud and listens for speech responses (both English and Telugu) using real-time browser Web Speech API.
- **Offline Mode**: Automatically falls back to local IndexedDB storage during network outages, with automatic background sync when connection is restored.
- **Idempotent Storage**: Prevents duplicate entries via deterministic merge keys.
- **Reports Export**: Generates premium 2-page clinical PDF reports/receipts.
- **Secure Access Control**: Enforces role-based permissions (Admin, Doctor, Receptionist) to view patient survey dashboards and analytics.

## Running Locally

**Prerequisites:** Node.js (v18+)

1. Install dependencies:
   ```bash
   npm install
   ```

2. Seed environment variables:
   Copy `.env.example` to `.env` and fill out your Firestore settings and server port.

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3004](http://localhost:3004) in your browser.
