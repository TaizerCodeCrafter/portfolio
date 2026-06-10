# AI Auto Blogging System

A fully automated AI-driven blogging platform that researches trending topics, generates SEO-optimized content using GPT-4, and publishes it automatically.

## Features
- **Auto Research**: Fetches trending technology news from NewsAPI.
- **AI Content Generation**: Generates 1000+ word articles with SEO metadata using OpenAI.
- **Auto Publishing**: Scheduled cron job (every minute for demo) to keep the blog active.
- **Admin Dashboard**: Manage, edit, and approve AI-generated blogs.
- **Public Blog**: Responsive, SEO-friendly public facing website.

## Tech Stack
- **Frontend**: Next.js 14, TailwindCSS, Framer Motion
- **Backend**: Node.js, Express, MongoDB, Node-Cron
- **AI**: OpenAI API (GPT-4)

## Setup Instructions

### Backend Setup
1. Navigate to `/backend`
2. Create a `.env` file from `.env.example`
3. Add your `OPENAI_API_KEY`, `NEWS_API_KEY`, and `MONGODB_URI`.
4. Install dependencies: `npm install`
5. Start the server: `node index.js`

### Frontend Setup
1. Navigate to `/frontend`
2. Create a `.env.local` file: `NEXT_PUBLIC_API_URL=http://localhost:5000/api`
3. Install dependencies: `npm install`
4. Start the app: `npm run dev`

## Cron Job Configuration
The system is currently set to run every minute in `backend/cron/cronService.js` for demonstration purposes. Change `* * * * *` to `0 */6 * * *` for a 6-hour interval in production.
