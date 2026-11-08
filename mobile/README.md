# LawLink Mobile

React Native (Expo SDK 58 + Expo Router) version of the LawLink web app. It talks to the same
Express backend (`../backend`) and has the same three roles: **client**, **lawyer** and **admin**.

Design: black, white and gold — editorial layout with oversized light **Geist** headings, small
uppercase meta labels and a single gold accent (champagne for highlight panels).

## Run it

```bash
# 1. start the backend (from ../backend)
npm run dev            # listens on :5001

# 2. start the app
cd mobile
npm install
npx expo start         # scan the QR code with Expo Go, or press i / a for a simulator
```

In development the app automatically calls `http://<your-computer's-LAN-IP>:5001/api`, so a phone on
the same Wi-Fi works with no config. To point at a deployed backend, copy `.env.example` to
`.env.local` and set `EXPO_PUBLIC_API_BASE_URL`.

## Structure

```
src/
  app/                      # routes (Expo Router)
    index.tsx               # landing page (redirects signed-in users to their dashboard)
    login / register / forgot-password
    user/   (tabs): Dashboard · Complaints · Lawyers · Alerts · Profile
            new-complaint, complaint/[id], packages, payment, upload, review, consultation
    lawyer/ (tabs): Dashboard · Cases · Packages · Alerts · Profile
            complaint/[id]  (overview · documents · chat · resolution)
    admin/  (tabs): Dashboard · Complaints · Users · Lawyers · More
            packages, articles, report, notifications, profile
  api/                      # axios client + 1:1 port of frontend/src/services
  context/                  # auth (token in SecureStore) + shared notification store
  components/               # UI kit, document-upload slots, chat, date picker…
  theme.ts                  # colour, type and spacing tokens
```

## Web → mobile mapping

Every web route has a mobile screen with the same API calls, validation and copy. The differences are
there because it's a phone:

| Web                                   | Mobile                                                   |
| ------------------------------------- | -------------------------------------------------------- |
| Sidebar + navbar                      | Bottom tab bar per role (unread badge on Alerts)         |
| Modals / dropdowns                    | Bottom sheets                                            |
| Drag-and-drop file zones              | System document picker (same slots, types, size limits)  |
| `<input type="date">`                 | Native date / date-time picker                           |
| `localStorage` token                  | `expo-secure-store` (Keychain / Keystore)                |
| Document download via new tab         | In-app browser                                           |

Things the web app mocks are mocked the same way here: password change and forgot-password OTP (no
backend endpoints), payment (no gateway), the static Review page, and the hard-coded stats/sessions on
profile pages.

## Checks

```bash
npm run typecheck      # tsc --noEmit
npx expo lint
npx expo-doctor
```
