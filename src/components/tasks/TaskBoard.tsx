"use client";

import { Task } from "@/types/database";
import {
  ChevronRight,
  Clock,
  Tag,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

interface TaskBoardProps {
  tasks: Task[];
  onUpdate: (id: string, taskData: Partial<Task>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onEditTask: (task: Task) => void;
}

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

// Simplified status groups for cleaner display
const statusGroups = [
  {
    title: "To Do",
    statuses: ["not_started", "planning"],
    color: "bg-slate-600",
    bgColor: "bg-slate-800/40",
  },
  {
    title: "In Progress",
    statuses: ["in_progress", "review", "testing"],
    color: "bg-blue-600",
    bgColor: "bg-blue-800/20",
  },
  {
    title: "On Hold",
    statuses: ["on_hold", "blocked"],
    color: "bg-yellow-600",
    bgColor: "bg-yellow-800/20",
  },
  {
    title: "Done",
    statuses: ["completed", "cancelled"],
    color: "bg-green-600",
    bgColor: "bg-green-800/20",
  },
];

export function TaskBoard({
  tasks,
  onUpdate,
  onDelete,
  onEditTask,
}: TaskBoardProps) {
  const getTasksByGroup = (groupStatuses: string[]) => {
    return tasks.filter((task) => groupStatuses.includes(task.status));
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

  const getAvailableStatuses = (currentStatus: string) => {
    const available = taskFlow[currentStatus as keyof typeof taskFlow] || [];
    // Always include the current status
    return [currentStatus, ...available];
  };

  return (
    <div className="space-y-8">
      {/* Status Groups */}
      {statusGroups.map((group) => {
        const groupTasks = getTasksByGroup(group.statuses);

        return (
          <div key={group.title} className="space-y-4">
            {/* Group Header */}
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full ${group.color}`}></div>
              <h3 className="text-lg font-semibold text-slate-100">
                {group.title}
              </h3>
              <span className="text-sm text-slate-400">
                ({groupTasks.length})
              </span>
            </div>

            {/* Tasks Grid */}
            {groupTasks.length === 0 ? (
              <div className="text-center py-8 text-slate-500 bg-slate-800/20 rounded-xl border border-dashed border-slate-600">
                <p className="text-sm">No tasks in this group</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`p-4 rounded-xl border border-slate-600/60 ${group.bgColor} hover:border-slate-500/60 transition-all duration-200 cursor-pointer group min-h-[200px]`}
                    onClick={() => onEditTask(task)}
                  >
                    {/* Task Header */}
                    <div className="flex items-start justify-between mb-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                          task.priority
                        )} text-white`}
                      >
                        {task.priority}
                      </span>
                      {task.due_date && (
                        <div className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDueDate(task.due_date)}
                        </div>
                      )}
                    </div>

                    {/* Task Title */}
                    <h4 className="font-medium text-slate-100 mb-2 group-hover:text-white transition-colors">
                      {task.title}
                    </h4>

                    {/* Task Description */}
                    {task.description && (
                      <p className="text-sm text-slate-400 mb-3 line-clamp-2">
                        {task.description}
                      </p>
                    )}

                    {/* Task Footer */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {/* Status Dropdown */}
                        <select
                          value={task.status}
                          onChange={(e) => {
                            const newStatus = e.target.value as Task["status"];
                            onUpdate(task.id, { status: newStatus });
                          }}
                          className="text-xs bg-slate-700/50 border border-slate-600/50 rounded px-2 py-1 text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
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
                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-400 transition-colors" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
