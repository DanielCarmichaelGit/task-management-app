import { User, Clock, CheckCircle, AlertCircle, Calendar } from "lucide-react";
import { Task } from "../../types/database";
import { User as UserType } from "../../types/database";

interface DashboardViewProps {
  user: UserType;
  tasks: Task[];
  onEditTask?: (task: Task) => void;
  onUpdate?: (id: string, taskData: Partial<Task>) => Promise<void>;
}

export function DashboardView({
  user,
  tasks,
  onEditTask,
  onUpdate,
}: DashboardViewProps) {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(
    (task) => task.status === "completed"
  ).length;
  const inProgressTasks = tasks.filter((task) =>
    ["planning", "in_progress", "review", "testing"].includes(task.status)
  ).length;
  const notStartedTasks = tasks.filter(
    (task) => task.status === "not_started"
  ).length;

  // Filter upcoming tasks (due today or later, not completed)
  const upcomingTasks = tasks
    .filter((task) => {
      if (task.status === "completed" || !task.due_date) return false;
      const dueDate = new Date(task.due_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return dueDate >= today;
    })
    .sort((a, b) => {
      if (!a.due_date || !b.due_date) return 0;
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    });

  const formatDueDate = (dueDate: string) => {
    const date = new Date(dueDate);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year:
          date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500";
      case "high":
        return "bg-orange-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "in_progress":
        return "bg-blue-500";
      case "planning":
        return "bg-purple-500";
      case "review":
        return "bg-indigo-500";
      case "testing":
        return "bg-cyan-500";
      case "on_hold":
        return "bg-yellow-500";
      case "blocked":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  // Define logical task flow - what statuses can transition to what
  const taskFlow = {
    not_started: ["planning", "in_progress"],
    planning: ["in_progress", "not_started"],
    in_progress: ["review", "testing", "on_hold", "blocked"],
    review: ["testing", "completed", "in_progress"],
    testing: ["completed", "in_progress", "on_hold"],
    on_hold: ["in_progress", "cancelled"],
    blocked: ["cancelled", "in_progress"],
    completed: ["not_started"], // Allow restarting completed tasks
    cancelled: [], // Terminal state
    deferred: ["not_started", "planning"],
  };

  const getAvailableStatuses = (currentStatus: string) => {
    const available = taskFlow[currentStatus as keyof typeof taskFlow] || [];
    // Always include the current status
    return [currentStatus, ...available];
  };

  return (
    <>
      {/* Welcome Section */}
      <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm rounded-3xl p-8 border border-slate-700/60 shadow-xl mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <User className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-slate-100">
              Welcome back, {user?.user_metadata?.full_name || "User"}!
            </h2>
            <p className="text-slate-400 text-lg">
              Let&apos;s make today productive
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Tasks */}
        <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/60 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <User className="w-6 h-6 text-blue-400" />
            </div>
            <span className="text-3xl font-bold text-slate-100">
              {totalTasks}
            </span>
          </div>
          <h3 className="text-slate-300 font-medium">Total Tasks</h3>
          <p className="text-slate-400 text-sm">All your tasks</p>
        </div>

        {/* Completed Tasks */}
        <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/60 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
            <span className="text-3xl font-bold text-slate-100">
              {completedTasks}
            </span>
          </div>
          <h3 className="text-slate-300 font-medium">Completed</h3>
          <p className="text-slate-400 text-sm">Finished tasks</p>
        </div>

        {/* In Progress Tasks */}
        <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/60 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-400" />
            </div>
            <span className="text-3xl font-bold text-slate-100">
              {inProgressTasks}
            </span>
          </div>
          <h3 className="text-slate-300 font-medium">In Progress</h3>
          <p className="text-slate-400 text-sm">Active work</p>
        </div>

        {/* Not Started Tasks */}
        <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/60 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-400" />
            </div>
            <span className="text-3xl font-bold text-slate-100">
              {notStartedTasks}
            </span>
          </div>
          <h3 className="text-slate-300 font-medium">Not Started</h3>
          <p className="text-slate-400 text-sm">Pending tasks</p>
        </div>
      </div>

      {/* Upcoming Tasks Section */}
      <div className="bg-slate-800/60 backdrop-blur-sm rounded-3xl p-8 border border-slate-700/60 shadow-xl mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-100">
              Upcoming Tasks
            </h3>
            <p className="text-slate-400">
              Tasks due soon that need your attention
            </p>
          </div>
        </div>

        {upcomingTasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-slate-700/40 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-10 h-10 text-slate-500" />
            </div>
            <h4 className="text-lg font-medium text-slate-300 mb-2">
              No upcoming tasks
            </h4>
            <p className="text-slate-400">
              All caught up! Create new tasks to get started.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="flex gap-4 pb-4 min-w-max">
              {upcomingTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-slate-700/40 backdrop-blur-sm rounded-xl p-4 border border-slate-600/60 shadow-lg min-w-[280px] max-w-[280px] hover:border-slate-500/60 transition-all duration-200 hover:shadow-xl cursor-pointer group relative"
                  onClick={() => onEditTask?.(task)}
                >
                  {/* Due date pill - upper right corner */}
                  <div className="absolute top-3 right-3">
                    <div className="inline-flex items-center gap-1 px-2 py-1 bg-slate-600/60 border border-slate-500/40 rounded-full">
                      <Calendar className="w-3 h-3 text-slate-300" />
                      <span className="text-xs font-medium text-slate-200">
                        {formatDueDate(task.due_date!)}
                      </span>
                    </div>
                  </div>

                  {/* Priority badge */}
                  <div className="mb-3">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${getPriorityColor(
                        task.priority
                      )}`}
                    >
                      {task.priority.charAt(0).toUpperCase() +
                        task.priority.slice(1)}
                    </span>
                  </div>

                  {/* Task title */}
                  <h4 className="text-base font-semibold text-slate-100 mb-2 line-clamp-2 group-hover:text-white transition-colors pr-16">
                    {task.title.length > 120
                      ? `${task.title.substring(0, 120)}...`
                      : task.title}
                  </h4>

                  {/* Task description - RTF rendered */}
                  {task.description && (
                    <div className="mb-3">
                      <div
                        className="text-sm text-slate-400 line-clamp-2 prose prose-sm prose-invert max-w-none"
                        dangerouslySetInnerHTML={{
                          __html:
                            task.description.length > 120
                              ? `${task.description.substring(0, 120)}...`
                              : task.description,
                        }}
                      />
                    </div>
                  )}

                  {/* Status Transition Dropdown */}
                  <div>
                    <select
                      value={task.status}
                      onChange={async (e) => {
                        e.stopPropagation();
                        const newStatus = e.target.value as Task["status"];
                        if (onUpdate) {
                          try {
                            await onUpdate(task.id, { status: newStatus });
                          } catch (error) {
                            console.error(
                              "Failed to update task status:",
                              error
                            );
                          }
                        }
                      }}
                      className="w-full text-sm bg-slate-600/50 border border-slate-500/50 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {getAvailableStatuses(task.status).map((status) => (
                        <option key={status} value={status}>
                          {status
                            .replace("_", " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
