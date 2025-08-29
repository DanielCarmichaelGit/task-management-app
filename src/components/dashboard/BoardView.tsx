import { TaskBoard } from "../tasks/TaskBoard";
import { Task } from "../../types/database";

interface BoardViewProps {
  tasks: Task[];
  tasksLoading: boolean;
  onUpdate: (id: string, taskData: Partial<Task>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onEditTask: (task: Task) => void;
}

export function BoardView({
  tasks,
  tasksLoading,
  onUpdate,
  onDelete,
  onEditTask,
}: BoardViewProps) {
  return (
    <div className="bg-slate-800/60 backdrop-blur-sm rounded-3xl border border-slate-700/60 shadow-xl overflow-hidden">
      <div className="px-8 py-6 border-b border-slate-700/60 bg-slate-700/30">
        <h3 className="text-xl font-semibold text-slate-100">Task Board</h3>
      </div>

      {tasksLoading ? (
        <div className="p-16 text-center">
          <div className="inline-flex items-center gap-4">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
            <span className="text-slate-400 text-lg">
              Loading your tasks...
            </span>
          </div>
        </div>
      ) : tasks.length === 0 ? (
        <div className="p-16 text-center">
          <div className="w-20 h-20 bg-slate-700/40 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10 text-slate-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <h4 className="text-xl font-medium text-slate-200 mb-3">
            No tasks yet
          </h4>
          <p className="text-slate-400 text-lg">
            Create your first task to get started!
          </p>
        </div>
      ) : (
        <div className="p-8">
          <TaskBoard
            tasks={tasks}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onEditTask={onEditTask}
          />
        </div>
      )}
    </div>
  );
}
