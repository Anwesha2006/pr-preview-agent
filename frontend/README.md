# Patchwork frontend

Next.js App Router dashboard for the AI PR review agent.

## Run locally

1. Copy `.env.example` to `.env.local`.
2. Set `NEXT_PUBLIC_API_URL` to the FastAPI origin, for example `http://localhost:8000`.
3. Install dependencies with `npm install` (already installed in this workspace).
4. Start the development server with `npm run dev` and open `http://localhost:3000`.

The browser calls only `${NEXT_PUBLIC_API_URL}/health` at this stage. The backend currently has no persisted review, finding, repository, or analytics endpoints, so those areas display explicit empty states rather than sample review metrics. The settings page reports GitHub App status as unverified because there is no account status endpoint.

If the frontend and FastAPI are served from different origins, configure FastAPI CORS to allow the frontend origin. No backend files are changed by this frontend.

## Build

Run `npm run build` to create the optimized production build, then `npm start` to serve it.
