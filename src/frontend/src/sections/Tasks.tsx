import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AnimatePresence, motion } from "@/lib/motion";
import { Pencil, Plus, Shuffle, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { type EisenhowerQuadrant, type Task, genId } from "../types/pocket";

type FilterType = "all" | "active" | "completed";

// ===== SPINNING WHEEL =====
const WHEEL_COLORS = [
  "#6B1F2A",
  "#8B3A4A",
  "#C4858F",
  "#D4A0A8",
  "#E8C5CA",
  "#A0522D",
  "#7B3F2F",
  "#9E6B5A",
  "#B8847A",
  "#C9A090",
];

function SpinningWheel({
  tasks,
  onClose,
}: { tasks: Task[]; onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<Task | null>(null);
  const rotationRef = useRef(0);
  const animFrameRef = useRef<number>(0);

  const activeTasks = tasks.filter((t) => !t.completed);

  const drawWheel = useCallback(
    (rotation: number) => {
      const canvas = canvasRef.current;
      if (!canvas || activeTasks.length === 0) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const r = Math.min(cx, cy) - 10;
      const slice = (2 * Math.PI) / activeTasks.length;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      activeTasks.forEach((task, i) => {
        const startAngle = rotation + i * slice;
        const endAngle = startAngle + slice;

        // Slice
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, r, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = WHEEL_COLORS[i % WHEEL_COLORS.length];
        ctx.fill();
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Label
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(startAngle + slice / 2);
        ctx.textAlign = "right";
        ctx.fillStyle = "#fff";
        ctx.font = `bold ${activeTasks.length > 8 ? 10 : 13}px sans-serif`;
        const label =
          task.title.length > 18 ? `${task.title.slice(0, 16)}…` : task.title;
        ctx.fillText(label, r - 10, 4);
        ctx.restore();
      });

      // Center circle
      ctx.beginPath();
      ctx.arc(cx, cy, 18, 0, 2 * Math.PI);
      ctx.fillStyle = "#fff";
      ctx.fill();
      ctx.strokeStyle = "#6B1F2A";
      ctx.lineWidth = 3;
      ctx.stroke();

      // Pointer (right side)
      ctx.beginPath();
      ctx.moveTo(canvas.width - 4, cy);
      ctx.lineTo(canvas.width - 28, cy - 12);
      ctx.lineTo(canvas.width - 28, cy + 12);
      ctx.closePath();
      ctx.fillStyle = "#6B1F2A";
      ctx.fill();
    },
    [activeTasks],
  );

  useEffect(() => {
    drawWheel(rotationRef.current);
  }, [drawWheel]);

  const spin = () => {
    if (spinning || activeTasks.length === 0) return;
    setSpinning(true);
    setWinner(null);

    const extraSpins = 5 + Math.random() * 5; // 5-10 full rotations
    const targetRotation = rotationRef.current + extraSpins * 2 * Math.PI;
    const duration = 3000 + Math.random() * 1000;
    const startTime = performance.now();
    const startRotation = rotationRef.current;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - (1 - progress) ** 3;
      const currentRotation =
        startRotation + (targetRotation - startRotation) * eased;
      rotationRef.current = currentRotation;
      drawWheel(currentRotation);

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        setSpinning(false);
        // Determine winner: pointer is on the right (angle = 0)
        // The slice at angle 0 relative to rotation
        const slice = (2 * Math.PI) / activeTasks.length;
        const normalizedAngle =
          (((0 - currentRotation) % (2 * Math.PI)) + 2 * Math.PI) %
          (2 * Math.PI);
        const winnerIndex =
          Math.floor(normalizedAngle / slice) % activeTasks.length;
        setWinner(activeTasks[winnerIndex]);
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    return () => cancelAnimationFrame(animFrameRef.current);
  }, []);

  if (activeTasks.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-4xl mb-3">🎉</p>
        <p className="text-pocket-muted italic">
          No active tasks! You're all caught up.
        </p>
        <Button
          onClick={onClose}
          className="mt-4 bg-pocket-burgundy text-pocket-cream hover:bg-pocket-burgundy/90"
        >
          Close
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-sm text-pocket-muted text-center">
        Spin the wheel to pick your next task!
      </p>
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={320}
          height={320}
          className="rounded-full shadow-lg"
        />
      </div>
      {winner && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="pocket-card p-4 text-center w-full border-2 border-pocket-gold"
        >
          <p className="text-xs text-pocket-muted mb-1">Your task is...</p>
          <p className="font-display font-bold text-pocket-burgundy text-lg">
            {winner.title}
          </p>
          {winner.description && (
            <p className="text-xs text-pocket-muted mt-1 italic">
              {winner.description}
            </p>
          )}
        </motion.div>
      )}
      <div className="flex gap-2 w-full">
        <Button
          onClick={spin}
          disabled={spinning}
          className="flex-1 bg-pocket-burgundy text-pocket-cream hover:bg-pocket-burgundy/90 disabled:opacity-60"
        >
          {spinning ? "Spinning..." : "🎰 Spin!"}
        </Button>
        <Button
          onClick={onClose}
          variant="outline"
          className="border-pocket-blush text-pocket-burgundy"
        >
          Close
        </Button>
      </div>
    </div>
  );
}

const QUADRANTS: {
  id: EisenhowerQuadrant;
  label: string;
  desc: string;
  color: string;
  bg: string;
}[] = [
  {
    id: "urgent-important",
    label: "Do First",
    desc: "Urgent & Important",
    color: "text-red-700",
    bg: "bg-red-50 border-red-200",
  },
  {
    id: "urgent-not-important",
    label: "Delegate",
    desc: "Urgent, Not Important",
    color: "text-yellow-700",
    bg: "bg-yellow-50 border-yellow-200",
  },
  {
    id: "not-urgent-important",
    label: "Schedule",
    desc: "Not Urgent, Important",
    color: "text-green-700",
    bg: "bg-green-50 border-green-200",
  },
  {
    id: "not-urgent-not-important",
    label: "Eliminate",
    desc: "Not Urgent, Not Important",
    color: "text-gray-600",
    bg: "bg-gray-50 border-gray-200",
  },
];

export default function Tasks() {
  const [tasks, setTasks] = useLocalStorage<Task[]>("pocket_tasks", []);
  const [filter, setFilter] = useState<FilterType>("active");
  const [addOpen, setAddOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [wheelOpen, setWheelOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    quadrant: "unsorted" as EisenhowerQuadrant,
  });

  const openAdd = () => {
    setForm({ title: "", description: "", quadrant: "unsorted" });
    setAddOpen(true);
  };

  const openEdit = (task: Task) => {
    setForm({
      title: task.title,
      description: task.description,
      quadrant: task.quadrant,
    });
    setEditTask(task);
  };

  const saveTask = () => {
    if (!form.title.trim()) return;
    if (editTask) {
      setTasks((prev) =>
        prev.map((t) => (t.id === editTask.id ? { ...t, ...form } : t)),
      );
      setEditTask(null);
      toast.success("Task updated!");
    } else {
      const task: Task = {
        id: genId(),
        ...form,
        completed: false,
        createdAt: new Date().toISOString(),
      };
      setTasks((prev) => [...prev, task]);
      setAddOpen(false);
      toast.success("Task added!");
    }
    setForm({ title: "", description: "", quadrant: "unsorted" });
  };

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const applyFilter = (taskList: Task[]) => {
    if (filter === "active") return taskList.filter((t) => !t.completed);
    if (filter === "completed") return taskList.filter((t) => t.completed);
    return taskList;
  };

  const unsorted = applyFilter(tasks.filter((t) => t.quadrant === "unsorted"));
  const allActive = tasks.filter((t) => !t.completed).length;
  const allCompleted = tasks.filter((t) => t.completed).length;

  const TaskCard = ({ task }: { task: Task }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`flex items-start gap-2 bg-white rounded-xl p-3 shadow-xs mb-2 border border-transparent hover:border-pocket-blush transition-all ${task.completed ? "opacity-60" : ""}`}
    >
      <Checkbox
        checked={task.completed}
        onCheckedChange={() => toggleTask(task.id)}
        className="mt-0.5 border-pocket-blush data-[state=checked]:bg-pocket-burgundy data-[state=checked]:border-pocket-burgundy"
      />
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium text-pocket-text leading-tight ${task.completed ? "line-through text-pocket-muted" : ""}`}
        >
          {task.title}
        </p>
        {task.description && (
          <p className="text-xs text-pocket-muted mt-0.5 line-clamp-2">
            {task.description}
          </p>
        )}
      </div>
      <div className="flex gap-1 shrink-0">
        <button
          type="button"
          onClick={() => openEdit(task)}
          className="text-pocket-muted hover:text-pocket-burgundy p-0.5"
        >
          <Pencil size={12} />
        </button>
        <button
          type="button"
          onClick={() => deleteTask(task.id)}
          className="text-pocket-muted hover:text-destructive p-0.5"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </motion.div>
  );

  const formContent = (
    <div className="space-y-3">
      <div>
        <label
          htmlFor="task-title"
          className="text-xs font-medium text-pocket-muted mb-1 block"
        >
          Title *
        </label>
        <Input
          id="task-title"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          placeholder="Task title"
          onKeyDown={(e) => e.key === "Enter" && saveTask()}
        />
      </div>
      <div>
        <label
          htmlFor="task-desc"
          className="text-xs font-medium text-pocket-muted mb-1 block"
        >
          Description
        </label>
        <Textarea
          id="task-desc"
          value={form.description}
          onChange={(e) =>
            setForm((f) => ({ ...f, description: e.target.value }))
          }
          placeholder="Optional details..."
          rows={2}
        />
      </div>
      <div>
        <label
          htmlFor="task-quadrant"
          className="text-xs font-medium text-pocket-muted mb-1 block"
        >
          Quadrant
        </label>
        <Select
          value={form.quadrant}
          onValueChange={(v) =>
            setForm((f) => ({ ...f, quadrant: v as EisenhowerQuadrant }))
          }
        >
          <SelectTrigger id="task-quadrant">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="unsorted">📥 Unsorted</SelectItem>
            <SelectItem value="urgent-important">
              🔴 Urgent + Important (Do First)
            </SelectItem>
            <SelectItem value="urgent-not-important">
              🟡 Urgent, Not Important (Delegate)
            </SelectItem>
            <SelectItem value="not-urgent-important">
              🟢 Not Urgent, Important (Schedule)
            </SelectItem>
            <SelectItem value="not-urgent-not-important">
              ⚪ Not Urgent, Not Important (Eliminate)
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button
        onClick={saveTask}
        className="w-full bg-pocket-burgundy text-pocket-cream hover:bg-pocket-burgundy/90"
      >
        {editTask ? "Update Task" : "Add Task"}
      </Button>
    </div>
  );

  return (
    <div className="min-h-full p-6 md:p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-pocket-burgundy">
            Tasks
          </h1>
          <div className="h-0.5 w-16 bg-pocket-gold rounded-full mt-2" />
          <p className="text-pocket-muted mt-2 text-sm">
            {allActive} active · {allCompleted} completed
          </p>
        </div>
        <div className="flex gap-2 items-center">
          {/* Filter */}
          <div className="flex bg-pocket-blush/20 rounded-lg p-0.5">
            {(["all", "active", "completed"] as FilterType[]).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all capitalize ${filter === f ? "bg-pocket-burgundy text-pocket-cream shadow-xs" : "text-pocket-muted hover:text-pocket-text"}`}
              >
                {f}
              </button>
            ))}
          </div>
          <Button
            onClick={() => setWheelOpen(true)}
            variant="outline"
            className="border-pocket-burgundy text-pocket-burgundy hover:bg-pocket-blush/20"
          >
            <Shuffle size={14} className="mr-1" /> Spin Wheel
          </Button>
          <Button
            onClick={openAdd}
            className="bg-pocket-burgundy text-pocket-cream hover:bg-pocket-burgundy/90"
          >
            <Plus size={14} className="mr-1" /> Add Task
          </Button>
        </div>
      </div>

      {/* Eisenhower Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {QUADRANTS.map((q) => {
          const qTasks = applyFilter(tasks.filter((t) => t.quadrant === q.id));
          return (
            <div key={q.id} className={`rounded-2xl border-2 p-4 ${q.bg}`}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className={`font-display font-bold text-base ${q.color}`}>
                    {q.label}
                  </h3>
                  <p className={`text-xs ${q.color} opacity-70`}>{q.desc}</p>
                </div>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full bg-white/60 ${q.color}`}
                >
                  {
                    tasks.filter((t) => t.quadrant === q.id && !t.completed)
                      .length
                  }
                </span>
              </div>
              <AnimatePresence>
                {qTasks.length === 0 ? (
                  <p className={`text-xs italic ${q.color} opacity-50 py-2`}>
                    {filter === "all" ? "No tasks here" : `No ${filter} tasks`}
                  </p>
                ) : (
                  qTasks.map((task) => <TaskCard key={task.id} task={task} />)
                )}
              </AnimatePresence>
              <button
                type="button"
                onClick={() => {
                  setForm({ title: "", description: "", quadrant: q.id });
                  setAddOpen(true);
                }}
                className={`mt-2 text-xs ${q.color} opacity-60 hover:opacity-100 flex items-center gap-1 transition-opacity`}
              >
                <Plus size={11} /> Add to {q.label}
              </button>
            </div>
          );
        })}
      </div>

      {/* Unsorted column */}
      {(filter === "all" || unsorted.length > 0) && (
        <div className="pocket-card p-4">
          <h3 className="font-display font-bold text-pocket-burgundy mb-3 flex items-center gap-2">
            📥 Unsorted
            <span className="text-xs bg-pocket-blush/30 text-pocket-burgundy px-2 py-0.5 rounded-full">
              {
                tasks.filter((t) => t.quadrant === "unsorted" && !t.completed)
                  .length
              }
            </span>
          </h3>
          <AnimatePresence>
            {unsorted.length === 0 ? (
              <p className="text-pocket-muted text-xs italic py-2">
                {filter === "all"
                  ? "All sorted! Great job 🎉"
                  : `No ${filter} unsorted tasks`}
              </p>
            ) : (
              unsorted.map((task) => <TaskCard key={task.id} task={task} />)
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="bg-pocket-cream">
          <DialogHeader>
            <DialogTitle className="font-display text-pocket-burgundy">
              Add Task
            </DialogTitle>
          </DialogHeader>
          {formContent}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={!!editTask}
        onOpenChange={(open) => !open && setEditTask(null)}
      >
        <DialogContent className="bg-pocket-cream">
          <DialogHeader>
            <DialogTitle className="font-display text-pocket-burgundy">
              Edit Task
            </DialogTitle>
          </DialogHeader>
          {formContent}
        </DialogContent>
      </Dialog>

      {/* Spin Wheel Dialog */}
      <Dialog open={wheelOpen} onOpenChange={setWheelOpen}>
        <DialogContent className="bg-pocket-cream max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display text-pocket-burgundy">
              Task Spinner 🎰
            </DialogTitle>
          </DialogHeader>
          <SpinningWheel tasks={tasks} onClose={() => setWheelOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
