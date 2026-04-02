# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

If you are hosting the site on Vercel, read [VERCEL_SETUP_AND_EDITING.md](VERCEL_SETUP_AND_EDITING.md) for the exact deployment, env var, maintenance, and appeal setup.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

---

## Sitemap generation (automatic)

This project includes a build-time sitemap generator that collects static pages and dynamic slugs from Supabase (news, wiki, changelogs, events, recent forum threads) and writes `public/sitemap.xml` before builds.

- Run locally: `npm run generate:sitemap` (reads `.env` or process env for `SITE_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`).
- Build step: `npm run build` runs the sitemap generator automatically via `prebuild`.
- GitHub Actions: There's a workflow `.github/workflows/generate-sitemap.yml` that runs on push to `main` and commits updated `public/sitemap.xml` back to the repo when it changes.

Add the following env vars in your deployment platform for accurate dynamic sitemaps:

- `SITE_URL` — e.g., `https://z-craft.xyz`
- `SUPABASE_URL` — your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` — **optional but recommended** for reading protected tables
- `SITEMAP_FORUM_LIMIT` — optional limit for number of forum threads (default 500)

A `.env.example` file is included at the repo root to help set these values.
