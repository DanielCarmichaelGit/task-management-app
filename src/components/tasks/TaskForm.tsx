"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { CustomDropdown } from "@/components/ui/CustomDropdown";
import { DatePicker } from "@/components/ui/DatePicker";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { Task } from "@/types/database";
import { createTask, enhanceTask } from "@/lib/api";
import { triggerGlobalTaskRefetch } from "@/lib/utils";
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
  const editorRef = useRef<HTMLDivElement>(null);
  const lastValueRef = useRef(value);

  const formatText = (command: string, value?: string) => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand(command, false, value);
      // Trigger input event to update the value
      const event = new Event("input", { bubbles: true });
      editorRef.current.dispatchEvent(event);
    }
  };

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const content = e.currentTarget.innerHTML;
    const markdown = convertHtmlToMarkdown(content);

    // Only update if the value actually changed
    if (markdown !== lastValueRef.current) {
      lastValueRef.current = markdown;
      onChange(markdown);
    }
  };

  const convertHtmlToMarkdown = (html: string): string => {
    let markdown = html;

    // Convert <strong> and <b> to **bold**
    markdown = markdown.replace(/<strong>(.*?)<\/strong>/g, "**$1**");
    markdown = markdown.replace(/<b>(.*?)<\/b>/g, "**$1**");

    // Convert <em> and <i> to *italic*
    markdown = markdown.replace(/<em>(.*?)<\/em>/g, "*$1*");
    markdown = markdown.replace(/<i>(.*?)<\/i>/g, "*$1*");

    // Convert <ul><li> to - list
    markdown = markdown.replace(/<ul><li>(.*?)<\/li><\/ul>/g, "- $1");
    markdown = markdown.replace(/<li>(.*?)<\/li>/g, "- $1");

    // Convert <br> to newlines
    markdown = markdown.replace(/<br\s*\/?>/g, "\n");

    // Convert <div> to newlines
    markdown = markdown.replace(/<div>/g, "");
    markdown = markdown.replace(/<\/div>/g, "\n");

    return markdown;
  };

  const convertMarkdownToHtml = (markdown: string): string => {
    let html = markdown;

    // Convert **bold** to <strong>
    html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    // Convert *italic* to <em>
    html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");

    // Convert - list to <ul><li>
    html = html.replace(/^- (.+)$/gm, "<ul><li>$1</li></ul>");

    // Convert newlines to <br>
    html = html.replace(/\n/g, "<br>");

    return html;
  };

  // Initialize the editor content only once
  useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML) {
      editorRef.current.innerHTML = convertMarkdownToHtml(value);
      lastValueRef.current = value;
    }
  }, []); // Empty dependency array - only run once

  // Update content only when value changes externally (not from typing)
  useEffect(() => {
    if (editorRef.current && value !== lastValueRef.current) {
      // Save cursor position
      const selection = window.getSelection();
      const range = selection?.getRangeAt(0);
      const cursorOffset = range?.startOffset || 0;

      // Update content
      editorRef.current.innerHTML = convertMarkdownToHtml(value);
      lastValueRef.current = value;

      // Restore cursor position if possible
      if (selection && range) {
        try {
          const newRange = document.createRange();
          newRange.setStart(
            editorRef.current.firstChild || editorRef.current,
            Math.min(
              cursorOffset,
              editorRef.current.firstChild?.textContent?.length || 0
            )
          );
          newRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(newRange);
        } catch (e) {
          // If cursor restoration fails, just focus the editor
          editorRef.current.focus();
        }
      }
    }
  }, [value]);

  return (
    <div className="space-y-3">
      {/* Formatting Toolbar */}
      <div className="flex gap-2 p-2 bg-slate-700/50 rounded-lg border border-slate-600/50">
        <button
          type="button"
          onClick={() => formatText("bold")}
          className="p-2 rounded-md transition-colors text-slate-300 hover:bg-slate-600 hover:text-white"
          title="Bold"
        >
          <span className="font-bold text-sm">B</span>
        </button>
        <button
          type="button"
          onClick={() => formatText("italic")}
          className="p-2 rounded-md transition-colors text-slate-300 hover:bg-slate-600 hover:text-white"
          title="Italic"
        >
          <span className="italic text-sm">I</span>
        </button>
        <button
          type="button"
          onClick={() => formatText("insertUnorderedList")}
          className="p-2 rounded-md transition-colors text-slate-300 hover:bg-slate-600 hover:text-white"
          title="List"
        >
          <span className="text-sm">•</span>
        </button>
      </div>

      {/* Rich Text Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[120px] overflow-y-auto"
        style={{
          lineHeight: "1.5",
          whiteSpace: "pre-wrap",
        }}
      />

      {/* Help Text */}
      <div className="text-xs text-slate-500">
        <span className="font-medium">Formatting:</span> Use the toolbar above
        or type <code className="bg-slate-600 px-1 rounded">**bold**</code>,{" "}
        <code className="bg-slate-600 px-1 rounded">*italic*</code>, and{" "}
        <code className="bg-slate-600 px-1 rounded">- lists</code>
      </div>
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
            // Show loading overlay and call AI enhancement
            setAiLoading(true);
            try {
              const aiResponse = await enhanceTask(taskId);
              console.log("AI enhancement completed:", aiResponse);

              // Trigger global refetch to update task list
              triggerGlobalTaskRefetch();
            } catch (aiError) {
              console.error("AI enhancement failed:", aiError);
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

  const handleAiEnhancement = async (action: string) => {
    setAiEnhancement(action);

    let taskId = initialTask?.id;
    if (!taskId) {
      const currentTask = await createTask({
        ...taskData,
      });
      taskId = currentTask.id;
    }

    // Show loading overlay
    setAiLoading(true);

    try {
      const response = await enhanceTask(taskId);

      // Trigger global refetch to update task list
      triggerGlobalTaskRefetch();
    } catch (error) {
      // Show error to user so they know what happened
      if (error instanceof Error) {
        alert(`AI enhancement failed: ${error.message}`);
      } else {
        alert("AI enhancement failed. Please try again later.");
      }
    } finally {
      // Hide loading overlay after completion (success or failure)
      setAiLoading(false);
    }
  };

  return (
    <>
      {/* AI Loading Overlay */}
      <LoadingOverlay
        isVisible={aiLoading}
        onClose={() => setAiLoading(false)}
        message="We are enhancing your task. You can safely close the drawer and we will update the task list when complete."
      />

      <form onSubmit={handleSubmit} className="space-y-6">
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

          <Button
            type="button"
            variant="outline"
            onClick={() => handleAiEnhancement("enhance")}
            className="border-slate-600 bg-slate-700 text-slate-300 hover:bg-slate-700 hover:text-slate-100"
          >
            Enhance with AI
          </Button>

          {/* AI Enhancement Dropdown */}
          {/* <CustomDropdown
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
        /> */}

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
    </>
  );
}
