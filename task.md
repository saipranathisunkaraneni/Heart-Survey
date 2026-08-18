# Task List - Survey Platform Upgrades

- [x] Change port configuration to 3004 in `server.ts` and `.env`
- [x] Configure Firestore persistent cache in `src/firebase.ts`
- [x] Add users and patients read/write rules to `firestore.rules`
- [x] Implement `subscribeToSurveys` real-time listener in `src/utils/firebaseService.ts`
- [x] Upgrade `src/hooks/useSpeech.ts` with real-time interim transcript support
- [x] Add header language toggle, Telugu guide box, clickable sidebar, and compound Telugu number parser in `src/components/SurveyWizard.tsx`
- [x] Integrate real-time subscription and PDF generator loading screen in `src/components/Dashboard.tsx`
- [x] Refactor PDF layout in `src/utils/exportHelpers.ts` to support two-column arrangement
- [x] Run type-checking (`npx tsc --noEmit`) and verify build succeeds
- [x] Launch dev server on port 3004 and verify all features manually
- [x] Delete all related srinivasa heart survey zips except the main one
