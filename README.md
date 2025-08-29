# Task Management App - AI Automation Challenge

A modern task management application built with Next.js, custom backend API, and AI automation capabilities.

## Features

### Part 1 - Core Task Management ✅

- ✅ **User Authentication**: Sign up/sign in with JWT tokens
- ✅ **Advanced Task Management**: Add, edit, complete, and delete tasks
- ✅ **Rich Task Data**: Title, description, priority, due date, estimated hours, tags
- ✅ **Data Persistence**: All data stored in custom backend API
- ✅ **Modern UI**: Clean, responsive interface with Tailwind CSS
- ✅ **TypeScript**: Full type safety throughout the application

### Part 2 - AI Enhancement (Coming Soon)

- 🔄 N8N integration for workflow automation
- 🔄 AI-powered task title enhancement
- 🔄 Chatbot interface
- 🔄 WhatsApp integration (bonus)

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Custom REST API with JWT authentication
- **Database**: Backend-managed (PostgreSQL/MySQL)
- **Deployment**: Vercel
- **AI Tools**: Cursor (AI assistant)

## Prerequisites

- Node.js 18+
- npm or yarn
- Backend API running (local or production)
- N8N instance (for Part 2)

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <your-repo-url>
cd task-management-app
npm install
```

### 2. Backend API Setup

The app is configured to work with your custom backend API:

- **Development**: `http://localhost:3001`
- **Production**: `https://tast-manager-4dd398dea15c.herokuapp.com/`

Make sure your backend API is running and accessible.

### 3. Environment Variables

Create a `.env.local` file in the root directory (optional for development):

```bash
# Backend API Configuration (optional - defaults to localhost:3001)
NEXT_PUBLIC_API_URL=http://localhost:3001

# N8N Configuration (for Part 2)
N8N_WEBHOOK_URL=your_n8n_webhook_url
N8N_API_KEY=your_n8n_api_key

# AI Service Configuration (for Part 2)
OPENAI_API_KEY=your_openai_api_key
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard (if needed)
4. Deploy!

## Project Structure

```
src/
├── app/                 # Next.js app router
│   ├── layout.tsx      # Root layout with AuthProvider
│   ├── page.tsx        # Main task management page
│   └── globals.css     # Global styles
├── components/          # React components
│   ├── auth/           # Authentication components
│   ├── tasks/          # Task management components
│   └── ui/             # Reusable UI components
├── contexts/            # React contexts
│   └── AuthContext.tsx # Authentication context
├── lib/                 # Utility libraries
│   └── api.ts          # Backend API client
└── types/               # TypeScript type definitions
    └── database.ts     # API data types
```

## API Integration

The app integrates with your backend API through the following endpoints:

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `PUT /api/auth/profile` - Profile updates

### Tasks

- `GET /api/tasks` - Fetch all tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `PATCH /api/tasks/:id/status` - Update task status
- `DELETE /api/tasks/:id` - Delete task

### Task Data Structure

```typescript
interface Task {
  id: string;
  title: string;
  description?: string;
  status:
    | "not_started"
    | "planning"
    | "in_progress"
    | "review"
    | "testing"
    | "completed"
    | "on_hold"
    | "cancelled"
    | "deferred"
    | "blocked";
  priority: "low" | "medium" | "high" | "urgent";
  due_date?: string;
  estimated_hours?: number;
  actual_hours?: number;
  tags?: string[];
  assignee_id?: string;
  created_at: string;
  updated_at: string;
}
```

## Current Status

- ✅ **Part 1 Complete**: Full task management functionality with backend API
- 🔄 **Part 2 In Progress**: N8N integration and AI enhancement
- 🔄 **Bonus Features**: WhatsApp integration planned

## Next Steps for Part 2

1. Set up N8N instance
2. Create workflow for AI task enhancement
3. Integrate chatbot interface
4. Add WhatsApp integration (bonus)
5. Test end-to-end automation

## Contributing

This is a challenge submission for an AI Automation Developer position. The app demonstrates:

- Modern React/Next.js development
- Custom backend API integration
- TypeScript best practices
- Clean component architecture
- Responsive UI design
- JWT authentication handling

## License

MIT License - feel free to use this code for learning purposes.
