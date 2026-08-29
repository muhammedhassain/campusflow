# CampusFlow

CampusFlow is a modern, responsive academic productivity platform built specifically for students. It combines task management, project tracking, a dynamic chronological calendar, and a client-side achievements system into a single unified dashboard.

## Key Features

- **Authentication**: Secure email/password login and registration using Supabase Auth.
- **Dynamic Dashboard**: Task statistics, today's schedule, project pulse, and upcoming deadlines computed from live user data.
- **Task Management**: Full CRUD operations for tasks with priority flags, status toggles, and due dates.
- **Project Management**: Full CRUD operations for academic or personal projects including start dates, due dates, and progress tracking.
- **Interactive Calendar**: Custom-built month-view calendar that dynamically aggregates tasks and projects based on their scheduled dates.
- **Achievement System**: Pure client-side progress calculation that unlocks milestone badges (e.g., "Task Master", "Project Finisher") based on your actual usage and completion data.

## Tech Stack

- **Frontend**: React 19, Vite, React Router v7, Tailwind CSS v3
- **Icons**: Lucide React
- **Backend & Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Authentication

## Project Structure

- `src/pages/` - Contains the main route components (`Dashboard`, `Tasks`, `Projects`, `Calendar`, `Achievements`, `Login`, `Register`).
- `src/components/` - Reusable UI elements (`TaskModal`, `ProjectModal`).
- `src/contexts/` - Application-wide state providers (`AuthContext`).
- `src/lib/` - Integrations and configuration (`supabase.js`).
- `supabase/migrations/` - SQL files defining the database schema, constraints, and security policies.

## Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn
- A free Supabase account

## Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd CampusFlow
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file at the root of the project and add your Supabase credentials. **Do not commit this file to version control.**
   
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
   ```

## Supabase Database Setup

CampusFlow relies on three specific database migrations for its schema and triggers. 

1. Create a new Supabase project and enable Email Auth.
2. Open the **SQL Editor** in your Supabase dashboard.
3. Execute the SQL files located in `supabase/migrations/` in exact chronological order:
   - Run `00001_create_profiles.sql` (Creates user profiles and auth trigger)
   - Run `00002_create_tasks.sql` (Creates tasks table and updated_at function)
   - Run `00003_create_projects.sql` (Creates projects table and policies)

## Running the Development Server

To start the local development server:
```bash
npm run dev
```
Navigate to `http://localhost:5173` (or the port provided by Vite) in your browser.

## Building for Production

To build the application for production deployment:
```bash
npm run build
```
To preview the production build locally:
```bash
npm run preview
```

## Security & Row Level Security (RLS)

CampusFlow is built with strict data privacy in mind:
- The database is locked down using PostgreSQL Row Level Security (RLS).
- Users can only `SELECT`, `INSERT`, `UPDATE`, or `DELETE` rows where the `user_id` matches their authenticated session token.
- No `service-role` keys are used in the application. All frontend requests explicitly append `.eq('user_id', user.id)` for double validation.
- All achievement calculations happen securely on the client-side using the user's isolated data array.
