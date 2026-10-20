# AI Support Dashboard – Frontend

Frontend SPA of the **AI Support Dashboard** project. It consumes the Laravel API and implements the support dashboard interface with tickets, activity tracking, and analytics.

This repository is part of the **AI Support Dashboard** project.
Project overview and architecture: https://github.com/LuisAMSantiago/ai-support-dashboard

---

## Tech Stack
- Vite
- React
- TypeScript
- Tailwind CSS
- shadcn/ui

## Requirements
- Node.js >= 20
- NPM or Yarn

## What this frontend demonstrates
- Modern SPA development with React and TypeScript
- Integration with an authenticated API (SPA + Sanctum)
- State management and side effect handling
- UI componentization and reuse
- Use of a design system with Tailwind CSS and shadcn/ui

## Running locally
1. `npm install`
2. `npm run dev`

## Environment variables
Create a `.env` file at the frontend root (frontend/.env):
```
VITE_API_URL=http://127.0.0.1:8000
```

## Verification

```sh
npm ci
npm run check
```

Individual commands: `npm run lint`, `npm run typecheck`, `npm test`, and
`npm run build`. Use `npm run test:watch` during development.

Tests use Vitest, Testing Library, jsdom and a simulated HTTP transport. They
cover session protection, login/registration, ticket forms, API contracts,
AI states, activity formatting and errors. They do not replace browser
end-to-end tests against a running backend.

The completed demonstrative baseline and its exclusions are documented in
[DEMONSTRATIVE_SCOPE.md](../DEMONSTRATIVE_SCOPE.md).

## Authentication
Authentication is handled via a SPA integrated with the Laravel API using Sanctum.  
Use the user created by the backend seed:
- email: `test@example.com`
- password: `password`

---

## Author

Developed by **Luis Santiago**
