# Blog API

A RESTful API for managing blog articles, categories, and tags. Built with Express, Prisma ORM, and SQLite locally, deployed on Railway.

Live URL: `https://blog-api-fagna-noel.up.railway.app`

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Express 4 |
| ORM | Prisma 5 |
| Database | SQLite (local) / PostgreSQL (production) |
| Validation | Zod + express-validator |
| Package Manager | pnpm |

## Project Structure

```
Blog-API/
├── controllers/     Handler logic per resource
├── database/        Prisma client singleton
├── middlewares/     Error handling and validation middleware
├── prisma/          Schema and migrations
├── routes/          Express routers
├── validators/      Zod schemas for request validation
└── app.js           Entry point
```

Requests flow through routes into controllers, then to the database via the Prisma client. Validation middleware intercepts write requests before they reach controllers. A single error-handling middleware formats all errors uniformly.

## Local Setup

### Prerequisites

- Node.js 18+
- pnpm (`npm install -g pnpm`)

### Steps

**1. Clone and install**

```bash
git clone https://github.com/fagnanoel77/Blog-API.git
cd Blog-API
pnpm install
```

The `postinstall` script runs `prisma generate` automatically after install, so the Prisma Client is ready without any extra step.

**2. Configure the database**

Open `prisma/schema.prisma` and set the datasource provider to `sqlite`:

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

If the file currently says `provider = "postgresql"`, change it to `"sqlite"`. The rest of the schema stays the same.

Then create a `.env` file at the project root:

```
DATABASE_URL="file:./dev.db"
```

This tells Prisma to store the database in a local `dev.db` file. Prisma creates this file automatically on the next step.

**3. Push the schema**

```bash
pnpm db:push
```

This creates the database tables from your schema. For development this is preferred over migrations since it syncs instantly without tracking history. Use `pnpm db:migrate` if you want versioned migration files.

**4. Start the server**

```bash
pnpm dev       # hot reload with nodemon
pnpm start     # production-style (runs db:push then node app.js)
```

The API is available at `http://localhost:3000`.

## Environment Variables

| Variable | Description | Local value |
|---|---|---|
| `DATABASE_URL` | Prisma connection string | `file:./dev.db` |
| `PORT` | Server port | `3000` |

## Scripts

| Script | Description |
|---|---|
| `pnpm dev` | Start with nodemon |
| `pnpm start` | Sync schema and start |
| `pnpm db:push` | Apply schema without migration history |
| `pnpm db:migrate` | Run and track migrations |
| `pnpm db:generate` | Regenerate Prisma Client after schema changes |

## Switching to PostgreSQL for Production

Change the provider back to `"postgresql"` in `schema.prisma` and set a PostgreSQL connection string in your environment:

```
DATABASE_URL="postgresql://user:password@host:5432/dbname"
```

Railway injects this automatically when a PostgreSQL plugin is attached.

## Best Practices

- **Validation first.** Zod schemas reject invalid payloads before they reach the database.
- **Singleton Prisma Client.** Instantiated once in `database/` and imported wherever needed.
- **Centralized error handling.** Controllers throw or call `next(error)`; one middleware formats all error responses.
- **`prisma generate` on postinstall.** Ensures the generated client is always in sync after `pnpm install`, including in CI/CD environments.
- **ESM modules.** `"type": "module"` throughout, using native `import`/`export` syntax.

