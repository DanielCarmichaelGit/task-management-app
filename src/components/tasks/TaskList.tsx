"use client";

import { TaskItem } from "./TaskItem";
import { Task } from "@/types/database";

interface TaskListProps {
  tasks: Task[];
  onToggle: (id: string) => void;
  onUpdate: (id: string, taskData: Partial<Task>) => void;
  onDelete: (id: string) => void;
}

export function TaskList({
  tasks,
  onToggle,
  onUpdate,
  onDelete,
}: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No tasks yet. Add one above to get started!</p>
      </div>
    );
  }

  // Sort tasks: incomplete first, then by priority, then by creation date
  const sortedTasks = [...tasks].sort((a, b) => {
    // First, sort by completion status
    if (a.status !== b.status) {
      if (a.status === "completed") return 1;
      if (b.status === "completed") return -1;
    }

    // Then by priority (urgent > high > medium > low)
    const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    if (priorityDiff !== 0) return priorityDiff;

    // Finally by creation date (newest first)
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div className="space-y-3">
      {sortedTasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={onToggle}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
