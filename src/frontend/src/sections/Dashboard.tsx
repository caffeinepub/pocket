import { Button } from "@/components/ui/button";
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
import { AlarmClock, Pause, Play, Plus, RotateCcw, X, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useLocalStorage } from "../hooks/useLocalStorage";
import {
  type Book,
  type Bookmark,
  type EisenhowerQuadrant,
  type Goal,
  type GratitudeEntry,
  type Habit,
  type HabitLog,
  type MoodEntry,
  type Task,
  genId,
  today,
} from "../types/pocket";

const WORK_TIME = 25 * 60;
const BREAK_TIME = 5 * 60;

const MOODS = ["😢", "😕", "😐", "🙂", "😄"];
const MOOD_LABELS = ["Rough", "Meh", "Okay", "Good", "Great"];

export default function Dashboard() {
  const [_tasks, setTasks] = useLocalStorage<Task[]>("pocket_tasks", []);
  const [gratitudes] = useLocalStorage<GratitudeEntry[]>(
    "pocket_gratitudes",
    [],
  );
  const [bookmarks] = useLocalStorage<Bookmark[]>("pocket_bookmarks", []);
  const [habits] = useLocalStorage<Habit[]>("pocket_habits", []);
  const [habitLogs] = useLocalStorage<HabitLog[]>("pocket_habitLogs", []);
  const [goals] = useLocalStorage<Goal[]>("pocket_goals", []);
  const [books] = useLocalStorage<Book[]>("pocket_books", []);
  const [moodEntries] = useLocalStorage<MoodEntry[]>("pocket_moodEntries", []);

  // Pomodoro
  const [pomMode, setPomMode] = useState<"work" | "break">("work");
  const [timeLeft, setTimeLeft] = useState(WORK_TIME);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<number | null>(null);

  // Brain dump
  const [brainDumpOpen, setBrainDumpOpen] = useState(false);
  const [dumpItems, setDumpItems] = useState<
    { text: string; quadrant: EisenhowerQuadrant }[]
  >([]);
  const [dumpInput, setDumpInput] = useState("");

  useEffect(() => {
    if (running) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(intervalRef.current!);
            setRunning(false);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  const resetPomodoro = () => {
    setRunning(false);
    setTimeLeft(pomMode === "work" ? WORK_TIME : BREAK_TIME);
  };

  const switchMode = (mode: "work" | "break") => {
    setPomMode(mode);
    setRunning(false);
    setTimeLeft(mode === "work" ? WORK_TIME : BREAK_TIME);
  };

  const total = pomMode === "work" ? WORK_TIME : BREAK_TIME;
  const pct = ((total - timeLeft) / total) * 100;
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (pct / 100) * circumference;

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const secs = String(timeLeft % 60).padStart(2, "0");

  // Greeting
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  // Stats
  const todayHabits = habitLogs.filter(
    (l) => l.date === today() && l.completed,
  ).length;
  const totalHabits = habits.length;
  const habitPct =
    totalHabits > 0 ? Math.round((todayHabits / totalHabits) * 100) : 0;

  const todayMood = [...moodEntries]
    .filter((m) => m.date === today())
    .sort((a, b) => b.date.localeCompare(a.date))[0];

  const activeGoals = goals.filter((g) => g.status === "active").length;
  const readingBooks = books.filter((b) => b.status === "reading").length;

  // Recent items
  const recentGratitudes = [...gratitudes]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3);
  const recentBookmarks = [...bookmarks]
    .sort((a, b) => b.addedAt.localeCompare(a.addedAt))
    .slice(0, 3);

  // Brain dump handlers
  const addDumpItem = () => {
    if (!dumpInput.trim()) return;
    setDumpItems((prev) => [
      ...prev,
      { text: dumpInput.trim(), quadrant: "unsorted" },
    ]);
    setDumpInput("");
  };

  const saveBrainDump = () => {
    const newTasks: Task[] = dumpItems.map((item) => ({
      id: genId(),
      title: item.text,
      description: "",
      quadrant: item.quadrant,
      completed: false,
      createdAt: new Date().toISOString(),
    }));
    setTasks((prev) => [...prev, ...newTasks]);
    setDumpItems([]);
    setBrainDumpOpen(false);
    toast.success(`${newTasks.length} tasks saved!`);
  };

  const quadrantLabels: Record<EisenhowerQuadrant, string> = {
    "urgent-important": "🔴 Urgent + Important",
    "urgent-not-important": "🟡 Urgent, Not Important",
    "not-urgent-important": "🟢 Not Urgent, Important",
    "not-urgent-not-important": "⚪ Not Urgent, Not Important",
    unsorted: "📥 Unsorted",
  };

  return (
    <div className="min-h-full p-6 md:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <p className="text-pocket-muted font-body text-sm mb-1">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
        <h1 className="text-3xl md:text-4xl font-display font-bold text-pocket-burgundy">
          {greeting}, Pocket ✦
        </h1>
        <div className="h-0.5 w-16 bg-pocket-gold rounded-full mt-2" />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Pomodoro + Brain Dump */}
        <div className="lg:col-span-1 space-y-6">
          {/* Pomodoro */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="pocket-card p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <AlarmClock size={16} className="text-pocket-burgundy" />
              <h2 className="font-display font-bold text-pocket-burgundy text-lg">
                Pomodoro
              </h2>
            </div>

            <div className="flex gap-2 mb-5">
              {(["work", "break"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => switchMode(mode)}
                  className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    pomMode === mode
                      ? "bg-pocket-burgundy text-pocket-cream"
                      : "bg-pocket-blush/40 text-pocket-muted hover:bg-pocket-blush/60"
                  }`}
                >
                  {mode === "work" ? "Focus" : "Break"}
                </button>
              ))}
            </div>

            {/* Circular timer */}
            <div className="flex justify-center mb-5">
              <div className="relative">
                <svg
                  width={180}
                  height={180}
                  className="-rotate-90"
                  role="img"
                  aria-label="Pomodoro timer circle"
                >
                  <circle
                    cx={90}
                    cy={90}
                    r={radius}
                    fill="none"
                    stroke="oklch(0.88 0.025 40)"
                    strokeWidth={8}
                  />
                  <circle
                    cx={90}
                    cy={90}
                    r={radius}
                    fill="none"
                    stroke={
                      pomMode === "work"
                        ? "oklch(0.37 0.13 15)"
                        : "oklch(0.60 0.07 150)"
                    }
                    strokeWidth={8}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeOffset}
                    className="transition-all duration-1000 linear"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-display font-bold text-pocket-burgundy">
                    {mins}:{secs}
                  </span>
                  <span className="text-xs text-pocket-muted mt-0.5">
                    {pomMode === "work" ? "focus" : "break"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-center">
              <button
                type="button"
                onClick={() => setRunning((r) => !r)}
                className="pocket-btn-primary flex items-center gap-2 px-5 py-2 rounded-xl"
              >
                {running ? <Pause size={16} /> : <Play size={16} />}
                {running ? "Pause" : "Start"}
              </button>
              <button
                type="button"
                onClick={resetPomodoro}
                className="pocket-btn-ghost flex items-center gap-2 px-4 py-2 rounded-xl"
              >
                <RotateCcw size={16} />
              </button>
            </div>
          </motion.div>

          {/* Brain Dump */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            className="pocket-card p-6"
          >
            <div className="flex items-center gap-2 mb-3">
              <Zap size={16} className="text-pocket-gold" />
              <h2 className="font-display font-bold text-pocket-burgundy text-lg">
                Brain Dump
              </h2>
            </div>
            <p className="text-pocket-muted text-sm mb-4">
              Capture everything on your mind, then sort it.
            </p>
            <Button
              onClick={() => setBrainDumpOpen(true)}
              className="w-full bg-pocket-burgundy hover:bg-pocket-burgundy/90 text-pocket-cream"
            >
              <Plus size={16} className="mr-2" />
              Open Brain Dump
            </Button>
          </motion.div>
        </div>

        {/* Right columns: Stats + Recent */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stat widgets */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3"
          >
            {[
              {
                label: "Habits Today",
                value: `${habitPct}%`,
                sub: `${todayHabits}/${totalHabits} done`,
                color: "bg-pocket-blush/40",
                textColor: "text-pocket-burgundy",
              },
              {
                label: "Today's Mood",
                value: todayMood ? MOODS[todayMood.mood - 1] : "—",
                sub: todayMood ? MOOD_LABELS[todayMood.mood - 1] : "Not logged",
                color: "bg-[oklch(0.95_0.03_80)]",
                textColor: "text-[oklch(0.45_0.06_75)]",
              },
              {
                label: "Active Goals",
                value: String(activeGoals),
                sub: "in progress",
                color: "bg-[oklch(0.94_0.02_200)]",
                textColor: "text-[oklch(0.40_0.06_200)]",
              },
              {
                label: "Reading Now",
                value: String(readingBooks),
                sub: readingBooks === 1 ? "book" : "books",
                color: "bg-[oklch(0.95_0.03_15)]",
                textColor: "text-pocket-burgundy",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className={`${stat.color} rounded-2xl p-4 text-center`}
              >
                <p className="text-xs text-pocket-muted font-medium mb-1">
                  {stat.label}
                </p>
                <p
                  className={`text-2xl font-display font-bold ${stat.textColor}`}
                >
                  {stat.value}
                </p>
                <p className="text-xs text-pocket-muted mt-0.5">{stat.sub}</p>
              </div>
            ))}
          </motion.div>

          {/* Recent Gratitudes */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="pocket-card p-5"
          >
            <h3 className="font-display font-bold text-pocket-burgundy text-base mb-4 pocket-section-header">
              Recent Gratitudes
            </h3>
            {recentGratitudes.length === 0 ? (
              <p className="text-pocket-muted text-sm italic">
                No gratitudes yet — start your practice in the Life section ✦
              </p>
            ) : (
              <div className="space-y-2">
                {recentGratitudes.map((entry) => (
                  <div
                    key={entry.id}
                    className="bg-pocket-blush/20 rounded-xl p-3"
                  >
                    <p className="text-xs text-pocket-muted mb-1">
                      {entry.date}
                    </p>
                    {entry.items.map((item, i) => (
                      <p
                        key={`${entry.id}-item-${i}`}
                        className="text-sm text-pocket-text"
                      >
                        {i + 1}. {item}
                      </p>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Recent Bookmarks */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="pocket-card p-5"
          >
            <h3 className="font-display font-bold text-pocket-burgundy text-base mb-4 pocket-section-header">
              Recent Bookmarks
            </h3>
            {recentBookmarks.length === 0 ? (
              <p className="text-pocket-muted text-sm italic">
                Save articles, quotes, and more in the Knowledge section ✦
              </p>
            ) : (
              <div className="space-y-2">
                {recentBookmarks.map((bm) => (
                  <div
                    key={bm.id}
                    className="flex items-start gap-3 bg-pocket-sandstone/30 rounded-xl p-3"
                  >
                    <span className="pocket-badge-blush capitalize shrink-0">
                      {bm.category}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-pocket-text truncate">
                        {bm.title}
                      </p>
                      {bm.url && (
                        <a
                          href={bm.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-pocket-muted hover:text-pocket-burgundy truncate block"
                        >
                          {bm.url}
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Brain Dump Modal */}
      <Dialog open={brainDumpOpen} onOpenChange={setBrainDumpOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-pocket-cream">
          <DialogHeader>
            <DialogTitle className="font-display text-pocket-burgundy text-xl">
              🧠 Brain Dump
            </DialogTitle>
          </DialogHeader>

          {/* Input */}
          <div className="flex gap-2">
            <Input
              value={dumpInput}
              onChange={(e) => setDumpInput(e.target.value)}
              placeholder="Type a task and press Enter or Add..."
              onKeyDown={(e) => e.key === "Enter" && addDumpItem()}
              className="flex-1"
            />
            <Button
              onClick={addDumpItem}
              className="bg-pocket-burgundy text-pocket-cream hover:bg-pocket-burgundy/90"
            >
              <Plus size={16} />
            </Button>
          </div>

          {/* Items list */}
          <AnimatePresence>
            {dumpItems.map((item, i) => (
              <motion.div
                key={`dump-${i}-${item.text.slice(0, 10)}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex items-center gap-2 bg-white rounded-xl p-3 shadow-xs"
              >
                <span className="flex-1 text-sm text-pocket-text">
                  {item.text}
                </span>
                <Select
                  value={item.quadrant}
                  onValueChange={(val) =>
                    setDumpItems((prev) =>
                      prev.map((d, j) =>
                        j === i
                          ? { ...d, quadrant: val as EisenhowerQuadrant }
                          : d,
                      ),
                    )
                  }
                >
                  <SelectTrigger className="w-52 text-xs h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(quadrantLabels).map(([val, label]) => (
                      <SelectItem key={val} value={val} className="text-xs">
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <button
                  type="button"
                  onClick={() =>
                    setDumpItems((prev) => prev.filter((_, j) => j !== i))
                  }
                  className="text-pocket-muted hover:text-destructive transition-colors"
                >
                  <X size={14} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          {dumpItems.length === 0 && (
            <p className="text-center text-pocket-muted text-sm py-4 italic">
              Add items above to get started
            </p>
          )}

          {dumpItems.length > 0 && (
            <Button
              onClick={saveBrainDump}
              className="w-full bg-pocket-burgundy text-pocket-cream hover:bg-pocket-burgundy/90"
            >
              Save {dumpItems.length} Task{dumpItems.length !== 1 ? "s" : ""} →
            </Button>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
