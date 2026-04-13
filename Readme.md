# Todo Manager

Todo Manager is a full-stack training project with:
- Express.js backend API
- Vanilla JavaScript web frontend (served by Express)
- React Native mobile frontend (Expo)

Both frontend clients use the same backend API.

## Tech stack

- Node.js
- Express.js
- JWT (`jsonwebtoken`)
- Password hashing (`bcrypt`)
- Vanilla HTML/CSS/JS
- React Native + Expo
- Jest + Supertest for tests

## Features

- User signup and login
- JWT-based protected routes
- Create and list todo lists
- Rename lists (owner-only)
- Add todos to a list (owner-only)
- Session validation endpoint (`/api/me`)

## Project structure

```text
.
|-- src/                     # Express API
|-- public/                  # Vanilla web frontend
|-- mobile/                  # React Native (Expo) frontend
|-- tests/
|   |-- unit/
|   |-- integration/
|   `-- e2e/
|-- .env.example
|-- package.json
`-- Readme.md
```

## API endpoints

- `GET /api/`
- `POST /api/signup`
- `POST /api/login`
- `GET /api/me`
- `GET /api/lists`
- `POST /api/lists`
- `PATCH /api/lists/:id`
- `POST /api/lists/:id/todos`

## Prerequisites

- Node.js 18+ recommended
- npm 9+ recommended

## Install dependencies

Install backend/web dependencies:

```bash
npm install
```

Install mobile dependencies:

```bash
cd mobile
npm install
```

## Environment configuration

Copy `.env.example` to `.env` and adjust values if needed:

```bash
PORT=3000
JWT_SECRET=THIS_IS_A_SECRET
JWT_EXPIRES_IN=15m
BCRYPT_SALT_ROUNDS=10
```

Mobile API base URL is configured in `mobile/app.json`:

```json
"extra": {
  "apiBaseUrl": "http://localhost:3000/api"
}
```

Use a LAN IP (for example `http://192.168.x.x:3000/api`) when running on a physical phone.

## Run the project

### 1) Start backend + web frontend

From project root:

```bash
npm run dev
```

Web UI will be available at:
- `http://localhost:3000`

### 2) Start mobile frontend (Expo)

From `mobile/`:

```bash
npm start
```

Then choose a target:
- `a` for Android emulator
- `i` for iOS simulator (macOS)
- `w` for web preview
- Expo Go scan for physical device

## Available scripts

From project root:

- `npm run dev` - start backend in watch mode
- `npm run start` - start backend
- `npm run dev:mobile` - start Expo from root
- `npm run test` - run all tests
- `npm run test:unit` - run unit tests
- `npm run test:integration` - run integration tests
- `npm run test:e2e` - run e2e tests

From `mobile/`:

- `npm start` - start Expo dev server
- `npm run android` - run Android build
- `npm run ios` - run iOS build
- `npm run web` - run Expo web

## Testing

Run tests from project root:

```bash
npm run test:unit
npm run test:integration
npm run test:e2e
```

## Notes

- Data is stored in memory for training purposes.
- Restarting the backend clears users, lists, and todos.
