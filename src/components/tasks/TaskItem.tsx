"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Check, Edit, Trash2, X, Clock, Tag } from "lucide-react";
import { Task } from "@/types/database";

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onUpdate: (id: string, taskData: Partial<Task>) => void;
  onDelete: (id: string) => void;
}

export function TaskItem({
  task,
  onToggle,
  onUpdate,
  onDelete,
}: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: task.title,
    description: task.description || "",
    priority: task.priority,
    due_date: task.due_date || "",
    estimated_hours: task.estimated_hours || 0,
  });
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (!editData.title.trim()) return;

    setLoading(true);
    try {
      await onUpdate(task.id, editData);
      setIsEditing(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditData({
      title: task.title,
      description: task.description || "",
      priority: task.priority,
      due_date: task.due_date || "",
      estimated_hours: task.estimated_hours || 0,
    });
    setIsEditing(false);
  };

  const getStatusColor = (status: Task["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "planning":
        return "bg-blue-100 text-blue-800";
      case "review":
        return "bg-purple-100 text-purple-800";
      case "testing":
        return "bg-indigo-100 text-indigo-800";
      case "on_hold":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "deferred":
        return "bg-gray-100 text-gray-800";
      case "blocked":
        return "bg-red-100 text-red-800";
      case "not_started":
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-green-100 text-green-800";
    }
  };

  if (isEditing) {
    return (
      <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm space-y-3">
        <div className="flex gap-2">
          <Input
            value={editData.title}
            onChange={(e) =>
              setEditData({ ...editData, title: e.target.value })
            }
            placeholder="Task title"
            className="flex-1"
            autoFocus
          />
          <select
            value={editData.priority}
            onChange={(e) =>
              setEditData({
                ...editData,
                priority: e.target.value as Task["priority"],
              })
            }
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        <Input
          value={editData.description}
          onChange={(e) =>
            setEditData({ ...editData, description: e.target.value })
          }
          placeholder="Description (optional)"
        />

        <div className="flex gap-2">
          <Input
            type="date"
            value={editData.due_date}
            onChange={(e) =>
              setEditData({ ...editData, due_date: e.target.value })
            }
            className="flex-1"
          />
          <Input
            type="number"
            value={editData.estimated_hours}
            onChange={(e) =>
              setEditData({
                ...editData,
                estimated_hours: Number(e.target.value),
              })
            }
            placeholder="Hours"
            min="0"
            step="0.5"
            className="w-24"
          />
        </div>

        <div className="flex gap-2">
          <Button size="sm" onClick={handleUpdate} disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
          <Button size="sm" variant="outline" onClick={handleCancel}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="flex items-start gap-3">
        <button
          onClick={() => onToggle(task.id)}
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors mt-1 ${
            task.status === "completed"
              ? "bg-green-500 border-green-500 text-white"
              : "border-gray-300 hover:border-green-400"
          }`}
        >
          {task.status === "completed" && <Check className="w-3 h-3" />}
        </button>

        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <span
              className={`text-sm px-2 py-1 rounded-full ${getStatusColor(
                task.status
              )}`}
            >
              {task.status.replace("_", " ")}
            </span>
            <span
              className={`text-sm px-2 py-1 rounded-full ${getPriorityColor(
                task.priority
              )}`}
            >
              {task.priority}
            </span>
          </div>

          <h3
            className={`font-medium ${
              task.status === "completed" ? "line-through text-gray-500" : ""
            }`}
          >
            {task.title}
          </h3>

          {task.description && (
            <p className="text-sm text-gray-600">{task.description}</p>
          )}

          <div className="flex items-center gap-4 text-sm text-gray-500">
            {task.due_date && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{new Date(task.due_date).toLocaleDateString()}</span>
              </div>
            )}

            {task.estimated_hours && task.estimated_hours > 0 && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{task.estimated_hours}h</span>
              </div>
            )}

            {task.tags && task.tags.length > 0 && (
              <div className="flex items-center gap-1">
                <Tag className="w-4 h-4" />
                <span>{task.tags.join(", ")}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsEditing(true)}
            disabled={task.status === "completed"}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDelete(task.id)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
