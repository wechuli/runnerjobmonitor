# Backend (server)

This backend uses TypeScript, Express and TypeORM.

## Getting started (development)

1. Copy `.env.example` to `.env` and update values.

2. Install dependencies:

```bash
npm install
```

3. Run migrations (or use `synchronize` during local dev):

```bash
npm run typeorm:migrate:run
```

4. Seed development data:

```bash
npm run seed
```

5. Start in dev mode:

```bash
npm run dev
```

## Notes

- This project migrated from Prisma to TypeORM. If you previously used Prisma, remove old `prisma` tooling after verifying migrations and seeds.
- For production, ensure `synchronize` is disabled and use migrations only.

## Migration checklist (Prisma -> TypeORM)

1. Verify TypeORM migrations and seed data: `npm run typeorm:migrate:run` and `npm run seed`
2. Remove `@prisma/client` and `prisma` from `package.json` and run `npm ci` to update lockfile
3. Delete `server/prisma` directory and old migration files
4. Search codebase for `prisma` references and remove or replace them
5. Update deployment docs and CI workflows to use TypeORM migration commands
