# Upward - Task Management App

A modern, AI-enhanced task management application built with Next.js 15, featuring a beautiful dark theme, multiple view modes, and integrated AI chatbot assistance.

## ✨ Features

### Core Task Management

- **User Authentication**: Secure sign up/sign in with JWT token-based authentication
- **Advanced Task Management**: Create, edit, complete, and delete tasks with rich metadata
- **Multiple View Modes**:
  - Dashboard view with task overview and statistics
  - Kanban board view for visual task organization
  - Calendar view for timeline-based task planning
- **Rich Task Data**: Title, description, priority levels, due dates, estimated/actual hours, tags, and assignees
- **Task Status Workflow**: Comprehensive status tracking from planning to completion
- **Data Persistence**: All data stored in custom backend API with real-time updates

### AI & Automation Features

- **Integrated AI Chatbot**: Built-in n8n-powered chatbot widget for task assistance
- **Smart Task Enhancement**: AI-powered task title and description improvements
- **Workflow Automation**: N8N integration for automated task processing

### User Experience

- **Modern Dark Theme**: Beautiful gradient-based dark UI with Tailwind CSS
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Real-time Updates**: Instant task synchronization across all views
- **Intuitive Interface**: Clean, accessible design with smooth animations

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4 with custom gradient themes
- **Backend**: Custom REST API with JWT authentication
- **Database**: PostgreSQL/MySQL (managed by backend)
- **AI Integration**: N8N workflow automation platform
- **Deployment**: Vercel-ready with environment-based configuration

## 📋 Prerequisites

- Node.js 18+
- npm or yarn package manager
- Running backend API instance
- N8N instance (for AI chatbot features)

## 🚀 Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <your-repo-url>
cd task-management-app
npm install
```

### 2. Backend API Configuration

The app connects to your custom backend API. Configure the endpoints in your environment:

**Development**: `http://localhost:3021/api`
**Production**: `https://tast-manager-4dd398dea15c.herokuapp.com/api`

Ensure your backend API is running and accessible.

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Backend API Configuration
NEXT_PUBLIC_NODE_ENV=development

# N8N Chat Integration
NEXT_PUBLIC_N8N_WEBHOOK_URL=your_n8n_webhook_url
NEXT_PUBLIC_N8N_ENHANCE_WEBHOOK_URL=your_n8n_enhancement_webhook

# Optional: Override API URLs
# NEXT_PUBLIC_API_URL=http://localhost:3021/api
```

### 4. N8N Chat Setup

For the AI chatbot functionality:

1. Set up an N8N instance
2. Create a chat workflow with webhook trigger
3. Configure AI integration (OpenAI, Anthropic, etc.)
4. Copy the webhook URL to `NEXT_PUBLIC_N8N_WEBHOOK_URL`
5. See `N8N_CHAT_SETUP.md` for detailed instructions

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Build and Deploy

```bash
# Build for production
npm run build

# Start production server
npm start

# Deploy to Vercel
npm run build
# Then deploy the .next folder to Vercel
```

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── layout.tsx         # Root layout with AuthProvider
│   ├── page.tsx           # Main application page
│   └── globals.css        # Global styles and Tailwind
├── components/             # React components
│   ├── auth/              # Authentication components
│   ├── chat/              # AI chatbot integration
│   ├── dashboard/         # Dashboard and view components
│   ├── tasks/             # Task management components
│   └── ui/                # Reusable UI components
├── contexts/               # React contexts
│   └── AuthContext.tsx    # Authentication state management
├── lib/                    # Utility libraries
│   └── api.ts             # Backend API client and auth
└── types/                  # TypeScript definitions
    └── database.ts        # API data types and interfaces
```

## 🔌 API Integration

The app integrates with your backend through these endpoints:

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
  priority: "low" | "medium" | "high";
  due_date?: string;
  estimated_hours?: number;
  actual_hours?: number;
  tags?: string[];
  assignee_id?: string;
  created_at: string;
  updated_at: string;
}
```

## 🎯 Current Implementation Status

- ✅ **Core Task Management**: Fully implemented and functional
- ✅ **User Authentication**: JWT-based auth with secure cookie storage
- ✅ **Multiple View Modes**: Dashboard, Board, and Calendar views
- ✅ **Responsive UI**: Modern dark theme with Tailwind CSS
- ✅ **Backend Integration**: Complete API integration
- ✅ **AI Chatbot**: N8N-powered chat widget integrated
- 🔄 **Task Enhancement**: AI-powered task improvement (requires N8N setup)
- 🔄 **Workflow Automation**: N8N workflows for task processing

## 🚧 Development Notes

### Authentication

- Uses secure HTTP-only cookies for token storage
- Automatic token refresh and unauthorized handling
- Global auth state management with React Context

### State Management

- Local state for UI components
- Global event system for task updates
- Optimistic updates for better UX

### Performance

- Lazy loading of view components
- Efficient re-rendering with React hooks
- Optimized API calls with proper error handling

## 🐛 Troubleshooting

### Common Issues

1. **Backend Connection Failed**

   - Verify backend API is running
   - Check API URL configuration
   - Ensure CORS is properly configured

2. **Chatbot Not Loading**

   - Verify N8N webhook URL in environment
   - Check N8N instance is running
   - Review browser console for errors

3. **Authentication Issues**
   - Clear browser cookies
   - Check backend auth endpoints
   - Verify JWT token format

### Development Tips

- Use browser dev tools to monitor API calls
- Check Network tab for failed requests
- Review Console for JavaScript errors
- Verify environment variables are loaded

## 📚 Additional Resources

- [N8N Chat Setup Guide](N8N_CHAT_SETUP.md) - Detailed chatbot configuration
- [Backend API Documentation](backend-api.md) - API endpoint specifications
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 🤝 Contributing

This is a production-ready task management application demonstrating:

- Modern React/Next.js development patterns
- Secure authentication implementation
- Clean component architecture
- Responsive design principles
- AI integration best practices
- TypeScript type safety

## 📄 License

MIT License - Feel free to use this code for learning and development purposes.
