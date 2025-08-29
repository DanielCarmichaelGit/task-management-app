export interface Task {
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

export interface User {
  id: string;
  aud: string;
  role: string;
  email: string;
  email_confirmed_at?: string;
  phone: string;
  confirmation_sent_at?: string;
  confirmed_at?: string;
  last_sign_in_at?: string;
  app_metadata: Record<string, unknown>;
  user_metadata: {
    email: string;
    email_verified: boolean;
    full_name: string;
    phone_verified: boolean;
    sub: string;
  };
  identities: Array<Record<string, unknown>>;
  created_at: string;
  updated_at: string;
  is_anonymous: boolean;
}

export interface AuthResponse {
  success?: boolean;
  message: string;
  user: User;
  session: Record<string, unknown> | null;
}

export interface TaskResponse {
  success?: boolean;
  data: Task | Task[];
  message: string;
}

export interface TasksResponse {
  tasks: Task[];
}

export interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  message: string;
}

export interface ApiError {
  success?: false;
  error: string;
  statusCode: number;
}

export interface Database {
  public: {
    Tables: {
      tasks: {
        Row: Task;
        Insert: Omit<Task, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Task, "id" | "created_at" | "updated_at">>;
      };
      users: {
        Row: User;
        Insert: Omit<User, "id" | "created_at">;
        Update: Partial<Omit<User, "id" | "created_at">>;
      };
    };
  };
}
