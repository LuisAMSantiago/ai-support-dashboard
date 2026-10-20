# AI Support Dashboard

**AI Support Dashboard** is a full stack support ticket system designed with a modern SPA + API architecture.  
The application provides authenticated access, ticket management, activity tracking, analytics, and AI-assisted automation integrated into the support workflow.

**Project status: Escopo técnico concluído (demonstrative project).**
The baseline, acceptance commands, and delivery boundaries are defined in
[Demonstrative scope](DEMONSTRATIVE_SCOPE.md), completed on October 20, 2026.

---

## Project Overview

The system is structured as a single application composed of two main layers:

- A **frontend SPA**, responsible for user interaction, authentication flow, and data visualization.
- A **backend API**, responsible for authentication, business logic, persistence, analytics, and background processing.

The application follows patterns commonly found in modern SaaS platforms, with a strong emphasis on separation of concerns, scalability, and maintainability.

Authentication is implemented using **Laravel Sanctum in SPA mode**, relying on secure, cookie-based sessions.

---

## High-level Architecture

```text
[ React SPA ]
      |
      |  HTTP (cookies / Sanctum)
      v
[ Laravel API ]
      |
      |-- Authentication & Sessions
      |-- Ticket Management (CRUD, status, priority)
      |-- Activity & Event Tracking
      |-- Analytics & Aggregations
      |-- AI Processing (background jobs)
```

---

## Tech Stack
### Backend
- Laravel
- Sanctum
- Queues (database/sync)
- MySQL or PostgreSQL

### Frontend
- Vite
- React
- TypeScript
- Tailwind CSS
- shadcn/ui

---

## What this project demonstrates
### Backend & API
- RESTful API development with Laravel
- SPA authentication using Laravel Sanctum
- Asynchronous processing with jobs and queues
- Event modeling and activity history tracking
### Frontend & UI
- Clean code organization and separation of responsibilities
- Modern SPA development with React and TypeScript
- Integration with an authenticated API (SPA + Sanctum)
- State management and side effect handling
- UI componentization and reuse
- Use of a design system with Tailwind CSS and shadcn/ui
### Architecture & Practices
- Clean code organization and separation of responsibilities
- Clear separation of responsibilities between frontend and backend
- Production-oriented structure

---

## Running the project locally
### Backend
1. `cp .env.example .env`
2. `composer install`
3. `php artisan key:generate`
4. Configure the following variables in `.env`:
    - `APP_URL=http://127.0.0.1`
    - `SANCTUM_STATEFUL_DOMAINS=127.0.0.1:5173`
    - `SESSION_DOMAIN=127.0.0.1`
    - `DB_*`
5. `php artisan migrate --seed`
6. `php artisan serve`
7. AI Jobs (Queues)
By default, you can use:
- `QUEUE_CONNECTION=sync` to run jobs immediately, or
- `QUEUE_CONNECTION=database` and `php artisan queue:work` for background processing.

If using `database`, make sure the queue migrations have been applied (`php artisan migrate`).

### Frontend
1. `npm install`
2. `npm run dev`
3. Environment variables: create a `.env` file at the frontend root (frontend/.env):
```
VITE_API_URL=http://127.0.0.1:8000
```
For authentication, create your own user or use the one created by the backend seed:
- email: `test@example.com`
- password: `password`

---

## AI (provider-ready architecture)
By default, the backend uses `App\Services\MockAiTicketService` when `OPENAI_API_KEY` is not set.
To enable the OpenAI-backed service, set these variables in `.env`:
- `OPENAI_API_KEY=...`
- `OPENAI_MODEL=gpt-4o-mini`
- `OPENAI_BASE_URL=https://api.openai.com/v1/chat/completions`
Then set this in `\config\services.php`:
```php
    'openai' => [
        'key' => env('OPENAI_API_KEY'),
        'base_url' => env('OPENAI_BASE_URL', 'https://api.openai.com/v1/'),
        'model' => env('OPENAI_MODEL', 'gpt-4o-mini'),
    ]
```

---

## Project scope

The demonstrative baseline is implemented and verified. See
[DEMONSTRATIVE_SCOPE.md](DEMONSTRATIVE_SCOPE.md) for the included features,
acceptance criteria, and explicit exclusions. Future features are new scope;
defects in the existing baseline remain fixes.

This project is not intended to be a production-ready product. This status does
not claim deployment, adoption by real users, or ongoing operational maintenance.

## Verification

Backend (PHP 8.3+ with PDO SQLite for tests):

```sh
cd backend
composer install
composer test
```

Frontend (Node.js 20+):

```sh
cd frontend
npm ci
npm run check
```

The frontend check runs lint (zero warnings), TypeScript, Vitest and a production
build. Frontend tests use a simulated HTTP transport; backend tests use an
in-memory database. External AI calls and production deployment are excluded
from automated acceptance.

---

## Author

Developed by **Luis Santiago**
