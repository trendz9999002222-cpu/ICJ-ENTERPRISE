## ICJ Frontend
Next.js enterprise frontend for the ICJ platform.

## Stack

- Next.js (App Router)
- React 19
- TypeScript
- MUI 9

- Django REST API (no Supabase)

## Structure

```
src/
├── app/              # Routes (public, auth groups)
├── components/       # UI + feature components
├── config/           # navbar.ts, footer.ts, env
├── constants/        # Static domain data
├── hooks/            # React hooks
├── lib/              # API client, logger
├── services/         # API service layer
├── theme/            # MUI theme
└── types/            # Shared TypeScript types
```

## Commands

```bash
cp .env.example .env.local
npm install
npm run dev      # http://localhost:3000
npm run build
npm run lint
```

## Deployment

Configured for Vercel. Set `NEXT_PUBLIC_API_URL` to your Django API URL.
