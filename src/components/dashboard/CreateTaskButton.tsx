import { Plus } from "lucide-react";
import { Button } from "../ui/Button";

interface CreateTaskButtonProps {
  onOpenDrawer: () => void;
}

export function CreateTaskButton({ onOpenDrawer }: CreateTaskButtonProps) {
  return (
    <Button
      onClick={onOpenDrawer}
      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 py-2 px-4 text-sm font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
    >
      <Plus className="w-4 h-4 mr-2" /> Create Task
    </Button>
  );
}
