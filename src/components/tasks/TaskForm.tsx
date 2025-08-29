"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { CustomDropdown } from "@/components/ui/CustomDropdown";
import { DatePicker } from "@/components/ui/DatePicker";
import { Task } from "@/types/database";
import { Sparkles, ChevronDown } from "lucide-react";
import { handleUnauthorized } from "@/lib/api";
import React from "react";

interface TaskFormProps {
  onSubmit: (taskData: Partial<Task>) => void;
  initialTask?: Task | null;
  submitLabel?: string;
  onCancel?: () => void;
  onClose?: () => void;
}

// Custom Rich Text Editor Component
function RichTextEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isList, setIsList] = useState(false);

  const toggleBold = () => {
    setIsBold(!isBold);
    const newValue = isBold
      ? value.replace(/\*\*(.*?)\*\*/g, "$1")
      : value.replace(/(\w+)/g, "**$1**");
    onChange(newValue);
  };

  const toggleItalic = () => {
    setIsItalic(!isItalic);
    const newValue = isItalic
      ? value.replace(/\*(.*?)\*/g, "$1")
      : value.replace(/(\w+)/g, "*$1*");
    onChange(newValue);
  };

  const toggleList = () => {
    setIsList(!isList);
    const newValue = isList
      ? value.replace(/^\s*[-*]\s/gm, "")
      : value.replace(/^(\w+)/gm, "- $1");
    onChange(newValue);
  };

  return (
    <div className="space-y-3">
      {/* Mobile Header - Only show on mobile */}
      <div className="md:hidden flex gap-2 p-2 bg-slate-700/50 rounded-lg border border-slate-600/50">
        <button
          type="button"
          onClick={toggleBold}
          className={`p-2 rounded-md transition-colors ${
            isBold
              ? "bg-blue-600 text-white"
              : "text-slate-300 hover:bg-slate-600"
          }`}
          title="Bold"
        >
          <span className="font-bold text-sm">B</span>
        </button>
        <button
          type="button"
          onClick={toggleItalic}
          className={`p-2 rounded-md transition-colors ${
            isItalic
              ? "bg-blue-600 text-white"
              : "text-slate-300 hover:bg-slate-600"
          }`}
          title="Italic"
        >
          <span className="italic text-sm">I</span>
        </button>
        <button
          type="button"
          onClick={toggleList}
          className={`p-2 rounded-md transition-colors ${
            isList
              ? "bg-blue-600 text-white"
              : "text-slate-300 hover:bg-slate-600"
          }`}
          title="List"
        >
          <span className="text-sm">•</span>
        </button>
      </div>

      {/* Textarea */}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Additional details... (Use **bold**, *italic*, and - lists on desktop)"
        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none min-h-[120px]"
        rows={5}
      />

      {/* Desktop Help Text - Only show on desktop */}
      <div className="hidden md:block">
        <p className="text-xs text-slate-500">
          <span className="font-medium">Formatting:</span> Use{" "}
          <code className="bg-slate-600 px-1 rounded">**bold**</code>,{" "}
          <code className="bg-slate-600 px-1 rounded">*italic*</code>, and{" "}
          <code className="bg-slate-600 px-1 rounded">- lists</code>
        </p>
      </div>

      {/* Preview */}
      {value && (
        <div className="p-3 bg-slate-700/30 rounded-lg border border-slate-600/30">
          <p className="text-xs text-slate-400 mb-2 uppercase tracking-wide">
            Preview:
          </p>
          <div className="text-sm text-slate-200 prose prose-invert max-w-none">
            {value.split("\n").map((line, i) => {
              if (line.startsWith("- ")) {
                return (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-blue-400">•</span>
                    <span>{line.slice(2)}</span>
                  </div>
                );
              }
              if (line.includes("**")) {
                const parts = line.split(/(\*\*.*?\*\*)/);
                return (
                  <div key={i}>
                    {parts.map((part, j) =>
                      part.startsWith("**") && part.endsWith("**") ? (
                        <strong key={j} className="font-bold">
                          {part.slice(2, -2)}
                        </strong>
                      ) : (
                        <span key={j}>{part}</span>
                      )
                    )}
                  </div>
                );
              }
              if (line.includes("*")) {
                const parts = line.split(/(\*.*?\*)/);
                return (
                  <div key={i}>
                    {parts.map((part, j) =>
                      part.startsWith("*") &&
                      part.endsWith("*") &&
                      part.length > 2 ? (
                        <em key={j} className="italic">
                          {part.slice(1, -1)}
                        </em>
                      ) : (
                        <span key={j}>{part}</span>
                      )
                    )}
                  </div>
                );
              }
              return <div key={i}>{line}</div>;
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export function TaskForm({
  onSubmit,
  initialTask = null,
  submitLabel = "Add Task",
  onCancel,
  onClose,
}: TaskFormProps) {
  const [taskData, setTaskData] = useState({
    title: initialTask?.title || "",
    description: initialTask?.description || "",
    status: initialTask?.status || ("not_started" as Task["status"]),
    priority: initialTask?.priority || ("medium" as Task["priority"]),
    due_date: initialTask?.due_date || new Date().toISOString().split("T")[0],
    estimated_hours: initialTask?.estimated_hours || 0,
    tags: initialTask?.tags || [],
  });
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [aiEnhancement, setAiEnhancement] = useState<string>("");

  // Update form when initialTask changes
  React.useEffect(() => {
    if (initialTask) {
      setTaskData({
        title: initialTask.title || "",
        description: initialTask.description || "",
        status: initialTask.status || "not_started",
        priority: initialTask.priority || "medium",
        due_date: initialTask.due_date || "",
        estimated_hours: initialTask.estimated_hours || 0,
        tags: initialTask.tags || [],
      });
    }
  }, [initialTask]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskData.title.trim()) return;

    setLoading(true);
    try {
      if (initialTask) {
        // Update existing task
        await onSubmit({ ...taskData, id: initialTask.id });
        onClose?.();
      } else {
        // Create new task
        const response = await onSubmit(taskData);

        // If AI enhancement is selected, call the appropriate API
        if (aiEnhancement && response) {
          // Extract task ID from response - adjust based on your API response structure
          const responseData = response as {
            id?: string;
            data?: { id?: string };
          };
          const taskId = responseData?.id || responseData?.data?.id;

          if (taskId) {
            setAiLoading(true);
            try {
              const aiResponse = await fetch(
                `/api/tasks/${taskId}/enhance-ai`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ enhancement_type: aiEnhancement }),
                }
              );

              if (aiResponse.ok) {
                console.log(`AI ${aiEnhancement} completed successfully`);
              } else {
                const errorData = await aiResponse.json();
                // Check for unauthorized response
                if (
                  aiResponse.status === 401 &&
                  (errorData.error === "Unauthorized" ||
                    errorData.message === "Invalid or expired token")
                ) {
                  handleUnauthorized();
                  return; // Exit early since user will be logged out
                }
                throw new Error(
                  errorData.error ||
                    errorData.message ||
                    `HTTP error! status: ${aiResponse.status}`
                );
              }
            } catch (aiError) {
              console.error(`AI ${aiEnhancement} failed:`, aiError);
            } finally {
              setAiLoading(false);
            }
          }
        }

        // Reset form for new tasks
        setTaskData({
          title: "",
          description: "",
          status: "not_started",
          priority: "medium",
          due_date: new Date().toISOString().split("T")[0],
          estimated_hours: 0,
          tags: [],
        });
        setAiEnhancement("");
        setAiLoading(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !taskData.tags.includes(tagInput.trim())) {
      setTaskData({ ...taskData, tags: [...taskData.tags, tagInput.trim()] });
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTaskData({
      ...taskData,
      tags: taskData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const handleAiEnhancement = (action: string) => {
    setAiEnhancement(action);
    // Here you would integrate with your AI service
    console.log(`AI Enhancement: ${action}`, taskData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* AI Loading State */}
      {aiLoading && (
        <div className="bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-blue-600/20 border border-blue-500/30 rounded-xl p-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-ping opacity-75"></div>
            </div>
            <h3 className="text-lg font-semibold text-slate-200">
              {aiEnhancement === "enhance"
                ? "Enhancing with AI..."
                : "Splitting tasks with AI..."}
            </h3>
          </div>

          {/* Gradient Wave Animation */}
          <div className="relative h-2 bg-slate-700 rounded-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 animate-pulse"></div>
            <div
              className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 animate-pulse"
              style={{ animationDelay: "0.5s" }}
            ></div>
            <div
              className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 animate-pulse"
              style={{ animationDelay: "1s" }}
            ></div>
          </div>

          <p className="text-sm text-slate-400 mt-3">
            This may take a few moments...
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-slate-200 mb-2">
            Task Title *
          </label>
          <Input
            type="text"
            value={taskData.title}
            onChange={(e) =>
              setTaskData({ ...taskData, title: e.target.value })
            }
            placeholder="What needs to be done?"
            required
            className="bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-slate-200 mb-2">
            Description
          </label>
          <RichTextEditor
            value={taskData.description}
            onChange={(value) =>
              setTaskData({ ...taskData, description: value })
            }
          />
        </div>

        <div>
          <CustomDropdown
            options={[
              { value: "low", label: "Low" },
              { value: "medium", label: "Medium" },
              { value: "high", label: "High" },
              { value: "urgent", label: "Urgent" },
            ]}
            value={taskData.priority}
            onChange={(value) =>
              setTaskData({
                ...taskData,
                priority: value as Task["priority"],
              })
            }
            placeholder="Select priority"
            label="Priority"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-200 mb-2">
            Due Date
          </label>
          <DatePicker
            value={taskData.due_date}
            onChange={(date) => setTaskData({ ...taskData, due_date: date })}
            placeholder="Select due date"
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-200 mb-2">
            Estimated Hours
          </label>
          <Input
            type="number"
            value={taskData.estimated_hours}
            onChange={(e) =>
              setTaskData({
                ...taskData,
                estimated_hours: Number(e.target.value),
              })
            }
            placeholder="0"
            min="0"
            step="0.5"
            className="bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-200 mb-2">
            Tags
          </label>
          <div className="flex gap-2">
            <Input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="Add a tag"
              onKeyPress={(e) =>
                e.key === "Enter" && (e.preventDefault(), addTag())
              }
              className="bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500"
            />
            <Button
              type="button"
              onClick={addTag}
              variant="outline"
              size="sm"
              className="border-slate-300 text-slate-300 bg-slate-700 hover:text-slate-100 hover:bg-slate-600"
            >
              Add
            </Button>
          </div>
          {taskData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {taskData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-900/40 text-blue-300 text-sm rounded-full border border-blue-700/40"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-blue-400 hover:text-blue-200 transition-colors"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          disabled={loading || !taskData.title.trim()}
          className="bg-blue-600 hover:bg-blue-700 text-white border-0 px-6 py-2.5"
        >
          {loading
            ? initialTask
              ? "Updating..."
              : "Adding..."
            : initialTask
            ? "Update Task"
            : submitLabel}
        </Button>

        {/* AI Enhancement Dropdown */}
        <CustomDropdown
          options={[
            {
              value: "enhance",
              label: "Enhance with AI",
              description: "Improve task description",
              icon: <Sparkles className="w-4 h-4 text-blue-400" />,
            },
            {
              value: "split",
              label: "Split Tasks",
              description: "Break into subtasks",
              icon: <ChevronDown className="w-4 h-4 text-purple-400" />,
            },
          ]}
          value={aiEnhancement}
          onChange={handleAiEnhancement}
          placeholder="Select AI enhancement..."
        />

        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-slate-100"
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
