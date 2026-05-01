# Indiginie NRI Solutions LLP — Client Portal

Production-style MVP built with **Next.js (App Router)**, **Supabase** (Auth, Postgres, Storage), **Tailwind CSS v4**, and **shadcn/ui**.

## Local development

```bash
cp .env.example .env.local
# fill NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY
npm install
npm run dev
```

Set `NEXT_PUBLIC_SITE_URL` to your local or deployed origin so magic links land correctly.

## Supabase setup

1. Create a Supabase project.
2. **Authentication → Providers → Email**: enable **Email OTP** (magic link / OTP per your project settings).
3. **Authentication → URL configuration**: add `http://localhost:3000/auth/callback` (and production callback URL) to redirect allow list.
4. Run SQL in `supabase/migrations/` via the SQL editor or CLI (`000001_init.sql` then `000002_seed.sql`).
5. In **Storage**, confirm bucket `documents` exists (migration inserts it) and policies match your environment if you adjust paths.
6. Promote your first admin in SQL, for example:

```sql
update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = 'you@company.com');
```

Create employees the same way with `role = 'employee'`.

## Useful paths

- Marketing: `/`
- Public catalog: `/services`
- Email OTP login: `/auth/login`
- Dashboards: `/dashboard/user`, `/dashboard/admin`, `/dashboard/employee`

## Scripts

- `npm run dev` — Next dev server
- `npm run build` — Production build
- `npm run lint` — ESLint
