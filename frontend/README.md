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
- Node.js >= 18
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
Create a `frontend/.env` file (or `.env` at the frontend root) if you want to point to a different API:
```
VITE_API_URL=http://127.0.0.1:8000
```

## Authentication
Authentication is handled via a SPA integrated with the Laravel API using Sanctum.  
Use the user created by the backend seed:
- email: `test@example.com`
- password: `password`

---

## Author

Developed by **Luis Santiago**