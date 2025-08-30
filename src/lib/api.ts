import {
  User,
  Task,
  AuthResponse,
  ApiResponse,
  TasksResponse,
} from "@/types/database";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_NODE_ENV === "production"
    ? "https://tast-manager-4dd398dea15c.herokuapp.com/api"
    : "http://localhost:3021/api";

const healthCheckUrl =
  process.env.NEXT_PUBLIC_NODE_ENV === "production"
    ? "https://tast-manager-4dd398dea15c.herokuapp.com/health"
    : "http://localhost:3021/health";

const n8nEnhancementUrl =
  process.env.NEXT_PUBLIC_N8N_ENHANCE_WEBHOOK_URL;

// Simple cookie functions
function setCookie(name: string, value: string, days: number = 7) {
  if (typeof window === "undefined") return;

  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

function getCookie(name: string): string | null {
  if (typeof window === "undefined") return null;

  const nameEQ = name + "=";
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

function deleteCookie(name: string) {
  if (typeof window === "undefined") return;
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
}

// Simple auth functions
export function setAuth(token: string, user: User) {
  setCookie("auth_token", token, 7);
  setCookie("user_info", JSON.stringify(user), 7);
}

export function getAuth(): { token: string | null; user: User | null } {
  const token = getCookie("auth_token");
  const userStr = getCookie("user_info");

  let user: User | null = null;
  if (userStr) {
    try {
      user = JSON.parse(userStr);
    } catch {
      // Invalid user data, clear it
      clearAuth();
    }
  }

  return { token, user };
}

export function clearAuth() {
  deleteCookie("auth_token");
  deleteCookie("user_info");
}

export function isAuthenticated(): boolean {
  const { token, user } = getAuth();
  return !!(token && user);
}

// Function to handle unauthorized responses
export function handleUnauthorized() {
  clearAuth();
  // Dispatch a custom event that components can listen to
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("auth:unauthorized"));
  }
}

// API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache, no-store, must-revalidate",
    Pragma: "no-cache",
    Expires: "0",
    ...(options.headers as Record<string, string>),
  };

  const { token } = getAuth();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      // Only handle unauthorized for authenticated requests (not auth endpoints)
      if (
        token &&
        response.status === 401 &&
        (data.error === "Unauthorized" ||
          data.message === "Invalid or expired token")
      ) {
        handleUnauthorized();
      }

      throw new Error(
        data.error || data.message || `HTTP error! status: ${response.status}`
      );
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("An unexpected error occurred");
  }
}

// Health check
export async function healthCheck(): Promise<boolean> {
  try {
    const response = await fetch(healthCheckUrl);
    return response.ok;
  } catch (error) {
    return false;
  }
}

// Auth functions
export async function register(
  email: string,
  password: string,
  fullName: string
): Promise<AuthResponse> {
  const url = `${API_BASE_URL}/auth/register`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        user_metadata: {
          full_name: fullName,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || data.message || `HTTP error! status: ${response.status}`
      );
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("An unexpected error occurred");
  }
}

export async function login(
  email: string,
  password: string
): Promise<AuthResponse> {
  const url = `${API_BASE_URL}/auth/login`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || data.message || `HTTP error! status: ${response.status}`
      );
    }

    const { user, session } = data;

    // If login successful, save auth data to cookies
    if (user && session) {
      console.log("Login successful, saving auth data to cookies");
      const token = extractTokenFromSession(session);
      if (token) {
        setAuth(token, user);
      }
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("An unexpected error occurred");
  }
}

export async function logout(): Promise<void> {
  clearAuth();
}

// Helper function to extract token from session
function extractTokenFromSession(
  session: Record<string, unknown>
): string | null {
  return session.access_token as string;
}

export async function updateProfile(
  fullName?: string,
  avatarUrl?: string
): Promise<User> {
  const body: Record<string, unknown> = {};
  if (fullName) body.user_metadata = { full_name: fullName };
  if (avatarUrl)
    body.user_metadata = {
      ...(body.user_metadata as Record<string, unknown>),
      avatar_url: avatarUrl,
    };

  return apiRequest<User>("/auth/profile", {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

// Task functions
export async function getTasks(): Promise<TasksResponse> {
  return apiRequest<TasksResponse>("/tasks");
}

export async function createTask(taskData: Partial<Task>): Promise<Task> {
  return apiRequest<Task>("/tasks", {
    method: "POST",
    body: JSON.stringify(taskData),
  });
}

export async function enhanceTask(taskId: string): Promise<Task> {
  const { token } = getAuth();

  if (!token) {
    throw new Error("No token found");
  }

  if (!n8nEnhancementUrl) {
    throw new Error("N8N enhancement URL is not set");
  }

  const response = await fetch(n8nEnhancementUrl, {
    method: "POST",
    body: JSON.stringify({ id: taskId, token }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response.json();
}

export async function updateTask(
  id: string,
  taskData: Partial<Task>
): Promise<Task> {
  return apiRequest<Task>(`/tasks/${id}`, {
    method: "PUT",
    body: JSON.stringify(taskData),
  });
}

export async function updateTaskStatus(
  id: string,
  status: Task["status"],
  actualHours?: number
): Promise<Task> {
  const body: Record<string, string | number> = { status };
  if (actualHours !== undefined) body.actual_hours = actualHours;

  return apiRequest<Task>(`/tasks/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function deleteTask(id: string): Promise<void> {
  return apiRequest<void>(`/tasks/${id}`, {
    method: "DELETE",
  });
}
