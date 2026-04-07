# Todo Manager

Vanilla JavaScript frontend + Express API for signup, login, and protected todo-list management.

## Project structure

```text
.
|-- src
|   |-- app.js
|   |-- server.js
|   |-- config
|   |   `-- env.js
|   |-- middleware
|   |   |-- auth.middleware.js
|   |   |-- error.middleware.js
|   |   |-- not-found.middleware.js
|   |   `-- request-logger.middleware.js
|   |-- modules
|   |   |-- auth
|   |   |   |-- auth.controller.js
|   |   |   |-- auth.routes.js
|   |   |   `-- auth.service.js
|   |   |-- health
|   |   |   |-- health.controller.js
|   |   |   `-- health.routes.js
|   |   `-- lists
|   |       |-- lists.controller.js
|   |       |-- lists.routes.js
|   |       `-- lists.service.js
|   |-- routes
|   |   `-- index.js
|   `-- store
|       `-- in-memory.store.js
|-- public
|   |-- index.html
|   |-- styles.css
|   `-- app.js
|-- tests
|   |-- unit
|   |-- integration
|   `-- e2e
|-- .env.example
|-- package.json
`-- Readme.md
```

## Features

- Signup and login with JWT
- Protected routes with middleware
- Todo lists with owner-based authorization
- Vanilla frontend served by Express
- Modular structure that is easier to extend

## API routes

- `GET /api/` health route
- `POST /api/signup`
- `POST /api/login`
- `GET /api/me`
- `GET /api/lists`
- `POST /api/lists`
- `PATCH /api/lists/:id`
- `POST /api/lists/:id/todos`

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the UI.

## Test suites

```bash
npm run test:unit
npm run test:integration
npm run test:e2e
```

## Current note

Data is still stored in memory for training purposes, so users, lists, and todos are reset whenever the server restarts.
