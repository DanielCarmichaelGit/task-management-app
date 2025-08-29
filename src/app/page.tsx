"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AuthForm } from "@/components/auth/AuthForm";
import { TaskForm } from "@/components/tasks/TaskForm";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { DashboardView } from "@/components/dashboard/DashboardView";
import { BoardView } from "@/components/dashboard/BoardView";
import { CalendarView } from "@/components/dashboard/CalendarView";
import { CreateTaskButton } from "@/components/dashboard/CreateTaskButton";
import {
  getTasks,
  createTask,
  updateTaskStatus,
  updateTask as updateTaskApi,
  deleteTask as deleteTaskApi,
} from "@/lib/api";
import { Task } from "@/types/database";
import { LogOut } from "lucide-react";

export default function Home() {
  const { user, loading, signOut } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [currentView, setCurrentView] = useState<
    "dashboard" | "board" | "calendar"
  >("dashboard");

  const fetchTasks = useCallback(async () => {
    if (!user) return;

    setTasksLoading(true);
    setError(null);
    try {
      const response = await getTasks();
      // The API returns { tasks: Task[] } structure
      if (response.tasks) {
        setTasks(response.tasks);
      } else {
        setError("Failed to fetch tasks");
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setError("Failed to fetch tasks");
    } finally {
      setTasksLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user, fetchTasks]);

  const handleTask = async (taskData: Partial<Task>) => {
    if (!user) return;

    try {
      if (taskData.id) {
        // Update existing task
        await updateTask(taskData.id, taskData);
        await fetchTasks();
        setIsDrawerOpen(false);
        setSelectedTask(null);
      } else {
        // Create new task
        const response = await createTask(taskData);
        if (response) {
          await fetchTasks();
          setIsDrawerOpen(false);
        } else {
          setError("Failed to create task");
        }
      }
    } catch (error) {
      console.error("Error handling task:", error);
      setError(taskData.id ? "Failed to update task" : "Failed to create task");
    }
  };

  const toggleTask = async (id: string) => {
    try {
      const task = tasks.find((t) => t.id === id);
      if (!task) return;

      const newStatus =
        task.status === "completed" ? "not_started" : "completed";
      const response = await updateTaskStatus(id, newStatus);

      if (response) {
        await fetchTasks();
      } else {
        setError("Failed to update task status");
      }
    } catch (error) {
      console.error("Error toggling task:", error);
      setError("Failed to update task status");
    }
  };

  const updateTask = async (id: string, taskData: Partial<Task>) => {
    try {
      const response = await updateTaskApi(id, taskData);
      if (response) {
        await fetchTasks();
      } else {
        setError("Failed to update task");
      }
    } catch (error) {
      console.error("Error updating task:", error);
      setError("Failed to update task");
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await deleteTaskApi(id);
      await fetchTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
      setError("Failed to delete task");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-100 mb-2">U</h1>
            <p className="text-slate-400">Sign in to manage your tasks</p>
          </div>
          <AuthForm />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/80 backdrop-blur-md border-b border-slate-700/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">U</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Upward
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-4 py-2 bg-slate-700/60 rounded-full border border-slate-600/60">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user.user_metadata?.full_name?.charAt(0) ||
                    user.email.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="text-sm">
                <p className="font-medium text-slate-100">
                  {user.user_metadata?.full_name || "User"}
                </p>
                <p className="text-slate-400 text-xs">{user.email}</p>
              </div>
            </div>

            <Button
              variant="default"
              size="sm"
              onClick={signOut}
              className="border-slate-300 bg-slate-700 text-slate-300"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-slate-800/40 border-b border-slate-700/60">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between py-2">
            <nav className="flex space-x-1">
              <Button
                onClick={() => setCurrentView("dashboard")}
                variant="ghost"
                className={`px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  currentView === "dashboard"
                    ? "bg-blue-600/20 text-blue-300 border border-blue-500/30 hover:bg-blue-600/30"
                    : "text-slate-400 hover:text-slate-300 hover:bg-slate-700/40"
                }`}
              >
                Dashboard
              </Button>
              <Button
                onClick={() => setCurrentView("board")}
                variant="ghost"
                className={`px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  currentView === "board"
                    ? "bg-blue-600/20 text-blue-300 border border-blue-500/30 hover:bg-blue-600/30"
                    : "text-slate-400 hover:text-slate-300 hover:bg-slate-700/40"
                }`}
              >
                Board
              </Button>
              <Button
                onClick={() => setCurrentView("calendar")}
                variant="ghost"
                className={`px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  currentView === "calendar"
                    ? "bg-blue-600/20 text-blue-300 border border-blue-500/30 hover:bg-blue-600/30"
                    : "text-slate-400 hover:text-slate-300 hover:bg-slate-700/40"
                }`}
              >
                Calendar
              </Button>
            </nav>

            <CreateTaskButton
              onOpenDrawer={() => {
                setSelectedTask(null);
                setIsDrawerOpen(true);
              }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {error && (
          <div className="mb-8 bg-red-900/20 border border-red-800/40 text-red-300 px-6 py-4 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
                <span className="font-medium text-base">{error}</span>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-300 transition-colors p-1 rounded-lg hover:bg-red-900/20"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Dashboard View */}
        {currentView === "dashboard" && (
          <DashboardView
            user={user}
            tasks={tasks}
            onEditTask={(task) => {
              setSelectedTask(task);
              setIsDrawerOpen(true);
            }}
            onUpdate={updateTask}
          />
        )}

        {/* Board View */}
        {currentView === "board" && (
          <BoardView
            tasks={tasks}
            tasksLoading={tasksLoading}
            onUpdate={updateTask}
            onDelete={deleteTask}
            onEditTask={(task) => {
              setSelectedTask(task);
              setIsDrawerOpen(true);
            }}
          />
        )}

        {/* Calendar View */}
        {currentView === "calendar" && (
          <CalendarView
            tasks={tasks}
            onEditTask={(task) => {
              setSelectedTask(task);
              setIsDrawerOpen(true);
            }}
            onUpdate={updateTask}
          />
        )}
      </main>

      {/* Drawer for adding new task */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={selectedTask ? "Edit Task" : "Add New Task"}
      >
        <TaskForm
          onSubmit={handleTask}
          initialTask={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      </Drawer>
    </div>
  );
}
