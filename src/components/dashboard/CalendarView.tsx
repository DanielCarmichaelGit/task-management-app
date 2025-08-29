"use client";

import { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  Tag,
  Plus,
} from "lucide-react";
import { Task } from "../../types/database";

interface CalendarViewProps {
  tasks?: Task[];
  onEditTask?: (task: Task) => void;
  onUpdate?: (id: string, taskData: Partial<Task>) => Promise<void>;
}

export function CalendarView({
  tasks = [],
  onEditTask,
  onUpdate,
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Get current month/year
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay());

    const days = [];
    const currentDate = new Date(startDate);

    while (currentDate <= lastDayOfMonth || currentDate.getDay() !== 0) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  }, [currentMonth, currentYear]);

  // Get tasks for a specific date
  const getTasksForDate = (date: Date) => {
    return tasks.filter((task) => {
      if (!task.due_date) return false;
      const taskDate = new Date(task.due_date);
      return (
        taskDate.getDate() === date.getDate() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getFullYear() === date.getFullYear()
      );
    });
  };

  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  // Navigate to today
  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  // Check if a date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Check if a date is in the current month
  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth;
  };

  // Get priority color
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

  // Get status color
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

  // Month names
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Day names
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6">
      {/* Calendar Section */}
      <div className="flex-1 bg-slate-800/60 backdrop-blur-sm rounded-3xl border border-slate-700/60 shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-700/60 bg-slate-700/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <CalendarIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100">Calendar</h3>
                <p className="text-sm text-slate-400">View tasks by date</p>
              </div>
            </div>

            <button
              onClick={goToToday}
              className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Today
            </button>
          </div>
        </div>

        {/* Month Navigation */}
        <div className="px-6 py-3 bg-slate-800/40 border-b border-slate-700/60">
          <div className="flex items-center justify-between">
            <button
              onClick={goToPreviousMonth}
              className="p-1.5 hover:bg-slate-700/50 rounded-lg transition-colors text-slate-400 hover:text-slate-200"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <h2 className="text-lg font-semibold text-slate-100">
              {monthNames[currentMonth]} {currentYear}
            </h2>

            <button
              onClick={goToNextMonth}
              className="p-1.5 hover:bg-slate-700/50 rounded-lg transition-colors text-slate-400 hover:text-slate-200"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="p-4">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-3">
            {dayNames.map((day) => (
              <div key={day} className="text-center py-2">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                  {day}
                </span>
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((date, index) => {
              const dayTasks = getTasksForDate(date);
              const isCurrentMonthDay = isCurrentMonth(date);
              const isTodayDate = isToday(date);
              const isSelected =
                selectedDate &&
                date.getDate() === selectedDate.getDate() &&
                date.getMonth() === selectedDate.getMonth() &&
                date.getFullYear() === selectedDate.getFullYear();

              return (
                <div
                  key={index}
                  className={`min-h-[80px] p-1.5 rounded-lg border transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? "border-blue-500 bg-blue-500/10"
                      : isTodayDate
                      ? "border-blue-400/50 bg-blue-500/5"
                      : isCurrentMonthDay
                      ? "border-slate-600/30 bg-slate-800/20 hover:border-slate-500/50 hover:bg-slate-700/30"
                      : "border-slate-700/20 bg-slate-800/10"
                  }`}
                  onClick={() => setSelectedDate(date)}
                >
                  {/* Date Number */}
                  <div className="text-right mb-1">
                    <span
                      className={`text-xs font-medium ${
                        isTodayDate
                          ? "text-blue-400 font-bold"
                          : isCurrentMonthDay
                          ? "text-slate-200"
                          : "text-slate-500"
                      }`}
                    >
                      {date.getDate()}
                    </span>
                  </div>

                  {/* Tasks */}
                  <div className="space-y-0.5">
                    {dayTasks.slice(0, 2).map((task) => (
                      <div
                        key={task.id}
                        className="p-1 rounded text-xs bg-slate-700/60 border border-slate-600/40"
                      >
                        <div className="flex items-center gap-1 mb-0.5">
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${getPriorityColor(
                              task.priority
                            )}`}
                          ></div>
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${getStatusColor(
                              task.status
                            )}`}
                          ></div>
                        </div>
                        <p className="text-slate-200 font-medium truncate text-xs">
                          {task.title}
                        </p>
                      </div>
                    ))}
                    {dayTasks.length > 2 && (
                      <div className="text-center py-0.5">
                        <span className="text-xs text-slate-500">
                          +{dayTasks.length - 2}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Task List Section */}
      <div className="w-full lg:w-80 bg-slate-800/60 backdrop-blur-sm rounded-3xl border border-slate-700/60 shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-700/60 bg-slate-700/30">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-100">
              {selectedDate
                ? selectedDate.toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })
                : "Select a Date"}
            </h3>
            {selectedDate && (
              <span className="text-sm text-slate-400">
                {getTasksForDate(selectedDate).length} tasks
              </span>
            )}
          </div>
        </div>

        <div className="h-96 lg:h-[calc(100vh-12rem)] overflow-y-auto p-4">
          {!selectedDate ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-700/40 rounded-full flex items-center justify-center mx-auto mb-4">
                <CalendarIcon className="w-8 h-8 text-slate-500" />
              </div>
              <h4 className="text-base font-medium text-slate-300 mb-2">
                Select a Date
              </h4>
              <p className="text-sm text-slate-400">
                Click on any date to view its tasks
              </p>
            </div>
          ) : getTasksForDate(selectedDate).length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-700/40 rounded-full flex items-center justify-center mx-auto mb-4">
                <CalendarIcon className="w-8 h-8 text-slate-500" />
              </div>
              <h4 className="text-base font-medium text-slate-300 mb-2">
                No tasks scheduled
              </h4>
              <p className="text-sm text-slate-400">
                This day is clear! Add a task to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {getTasksForDate(selectedDate).map((task) => (
                <div
                  key={task.id}
                  className="p-4 bg-slate-700/40 rounded-xl border border-slate-600/40 hover:border-slate-500/60 transition-all duration-200 cursor-pointer group"
                  onClick={() => onEditTask?.(task)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                          task.priority
                        )} text-white`}
                      >
                        {task.priority}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          task.status
                        )} text-white`}
                      >
                        {task.status.replace("_", " ")}
                      </span>
                    </div>
                    {task.estimated_hours && (
                      <div className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {task.estimated_hours}h
                      </div>
                    )}
                  </div>

                  <h4 className="font-medium text-slate-100 mb-2 group-hover:text-white transition-colors">
                    {task.title}
                  </h4>

                  {task.description && (
                    <p className="text-sm text-slate-400 mb-3 line-clamp-2">
                      {task.description}
                    </p>
                  )}

                  {/* Status Transition Dropdown */}
                  <div className="mb-3">
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Change Status
                    </label>
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
                      className="w-full text-xs bg-slate-600/50 border border-slate-500/50 rounded px-2 py-1.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
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

                  {task.tags && task.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {task.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-slate-600/40 text-slate-300 text-xs rounded-full border border-slate-500/30"
                        >
                          <Tag className="w-3 h-3" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
