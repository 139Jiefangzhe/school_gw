# Repository Guidelines

## Project Structure & Module Organization
- `project/school-mall-weapp/`: WeChat Mini Program client. Page code lives in `pages/`, shared UI in `components/`, API wrappers in `services/`, and helpers in `utils/`.
- `project/school-mall-server/`: TypeScript Express API. Keep HTTP routes in `src/routes/`, controllers in `src/controllers/`, business logic in `src/services/`, and Sequelize models in `src/models/`.
- `project/school-mall-medusa/`: Medusa v2 backend and admin extensions. Store APIs live under `src/api/`, modules under `src/modules/`, and custom providers under `src/providers/`.
- `project/deploy/`: Docker Compose, Nginx, PostgreSQL bootstrap SQL, and deployment docs.
- Root `plan*.md`, `SPEC*.md`, and `research/` files are reference docs, not runtime code.

## Build, Test, and Development Commands
- `cd project/school-mall-server && npm install && npm run dev`: start the Express API with hot reload.
- `cd project/school-mall-server && npm run build && npm start`: compile TypeScript to `dist/` and run the production build.
- `cd project/school-mall-medusa && npm install && npm run dev`: start Medusa in development mode.
- `cd project/school-mall-medusa && npm run build`: build the Medusa backend and admin extensions.
- `cd project/school-mall-medusa && npm run test:unit` or `npm run test:integration`: run Jest test suites.
- `cd project/deploy && docker compose up -d --build`: build and launch PostgreSQL, API, and Nginx.

## Coding Style & Naming Conventions
Use 2-space indentation in JSON, YAML, and frontend assets; preserve existing TypeScript formatting. Use `camelCase` for variables/functions, `PascalCase` for model and component filenames such as `Product.ts`, and kebab-case for feature folders. Keep route, controller, and service names aligned by domain (`order.routes.ts`, `orderController.ts`, `orderService.ts`).

## Testing Guidelines
Medusa uses Jest (`jest.config.js`); add tests near the affected module or in the existing Medusa test layout. The Express API currently relies on build validation, so run `npm run build` after backend changes. For Mini Program changes, verify login, product list, cart, and checkout in WeChat DevTools.

## Commit & Pull Request Guidelines
Use why-first commit subjects and keep diffs scoped to one module or workflow. Follow the Lore-style commit format when useful, including trailers such as `Constraint:`, `Rejected:`, `Confidence:`, `Tested:`, and `Not-tested:`. PRs should include a short summary, affected paths, config or schema changes, manual verification steps, and screenshots for Mini Program or Medusa admin UI changes.

## Security & Configuration Tips
Never commit real `.env` files, WeChat credentials, payment keys, or SSL material. Start from `.env.example`, keep secrets server-side, and review `project/deploy/nginx.conf` and Compose port mappings before exposing services publicly.
