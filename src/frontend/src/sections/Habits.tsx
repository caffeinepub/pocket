import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { AnimatePresence, motion } from "@/lib/motion";
import { Pencil, Plus, Star, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLocalStorage } from "../hooks/useLocalStorage";
import {
  type Habit,
  type HabitLog,
  type MoodEntry,
  type SleepEntry,
  genId,
  today,
} from "../types/pocket";

const MOODS = ["😊", "😢", "😰", "😌", "⚡", "😴", "😡", "🧘"];
const MOOD_LABELS = [
  "Happy",
  "Sad",
  "Anxious",
  "Relaxed",
  "Energetic",
  "Tired",
  "Angry",
  "Calm",
];
const EMOJI_OPTIONS = [
  "✨",
  "💪",
  "📚",
  "🏃",
  "🧘",
  "💧",
  "🥗",
  "🎯",
  "🎨",
  "🎵",
  "☀️",
  "🌙",
  "❤️",
  "🧠",
  "✍️",
  "🚶",
  "🍎",
  "💊",
  "📝",
  "🙏",
];

function getLast7Days(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });
}

function getStreak(logs: HabitLog[], habitId: string): number {
  let streak = 0;
  const d = new Date();
  while (true) {
    const dateStr = d.toISOString().split("T")[0];
    const completed = logs.some(
      (l) => l.habitId === habitId && l.date === dateStr && l.completed,
    );
    if (!completed) break;
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

// ===== HABITS TAB =====
function HabitsTab() {
  const [habits, setHabits] = useLocalStorage<Habit[]>("pocket_habits", []);
  const [logs, setLogs] = useLocalStorage<HabitLog[]>("pocket_habitLogs", []);
  const [addOpen, setAddOpen] = useState(false);
  const [editHabit, setEditHabit] = useState<Habit | null>(null);
  const [form, setForm] = useState({ name: "", emoji: "✨", color: "#6B1F2A" });

  const last7 = getLast7Days();

  const toggleHabit = (habitId: string, date: string) => {
    const existing = logs.find((l) => l.habitId === habitId && l.date === date);
    if (existing) {
      setLogs((prev) =>
        prev.map((l) =>
          l.id === existing.id ? { ...l, completed: !l.completed } : l,
        ),
      );
    } else {
      setLogs((prev) => [
        ...prev,
        { id: genId(), habitId, date, completed: true },
      ]);
    }
  };

  const isCompleted = (habitId: string, date: string) =>
    logs.some((l) => l.habitId === habitId && l.date === date && l.completed);

  const saveHabit = () => {
    if (!form.name.trim()) return;
    if (editHabit) {
      setHabits((prev) =>
        prev.map((h) => (h.id === editHabit.id ? { ...h, ...form } : h)),
      );
      setEditHabit(null);
      toast.success("Habit updated!");
    } else {
      setHabits((prev) => [
        ...prev,
        { id: genId(), ...form, createdAt: new Date().toISOString() },
      ]);
      setAddOpen(false);
      toast.success("Habit added!");
    }
    setForm({ name: "", emoji: "✨", color: "#6B1F2A" });
  };

  const deleteHabit = (id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
    setLogs((prev) => prev.filter((l) => l.habitId !== id));
  };

  const todayCompleted = habits.filter((h) =>
    isCompleted(h.id, today()),
  ).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="pocket-card px-4 py-3 flex items-center gap-3">
          <div className="text-2xl font-display font-bold text-pocket-burgundy">
            {habits.length > 0
              ? `${Math.round((todayCompleted / habits.length) * 100)}%`
              : "—"}
          </div>
          <div>
            <p className="text-xs text-pocket-muted">Today's Progress</p>
            <p className="text-xs font-medium text-pocket-text">
              {todayCompleted}/{habits.length} done
            </p>
          </div>
        </div>
        <Button
          onClick={() => setAddOpen(true)}
          className="bg-pocket-burgundy text-pocket-cream hover:bg-pocket-burgundy/90"
        >
          <Plus size={14} className="mr-1" /> Add Habit
        </Button>
      </div>

      {habits.length === 0 ? (
        <div className="pocket-card p-10 text-center">
          <p className="text-4xl mb-3">🌱</p>
          <p className="text-pocket-muted italic">
            Build your first habit — small steps create big changes.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Day headers */}
          <div className="pocket-card p-4 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left text-xs text-pocket-muted font-medium pb-3 w-40">
                    Habit
                  </th>
                  {last7.map((d) => (
                    <th
                      key={d}
                      className="text-center text-xs text-pocket-muted font-medium pb-3 min-w-10"
                    >
                      <div>
                        {
                          ["S", "M", "T", "W", "T", "F", "S"][
                            new Date(`${d}T00:00:00`).getDay()
                          ]
                        }
                      </div>
                      <div
                        className={`text-xs font-bold ${d === today() ? "text-pocket-burgundy" : "text-pocket-muted"}`}
                      >
                        {new Date(`${d}T00:00:00`).getDate()}
                      </div>
                    </th>
                  ))}
                  <th className="text-center text-xs text-pocket-muted font-medium pb-3 w-16">
                    Streak
                  </th>
                  <th className="w-16" />
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {habits.map((habit) => (
                    <motion.tr
                      key={habit.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-t border-pocket-blush/20"
                    >
                      <td className="py-2.5 pr-4">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{habit.emoji}</span>
                          <span className="text-sm font-medium text-pocket-text truncate max-w-28">
                            {habit.name}
                          </span>
                        </div>
                      </td>
                      {last7.map((d) => (
                        <td key={d} className="py-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => toggleHabit(habit.id, d)}
                            className={`w-7 h-7 rounded-full mx-auto flex items-center justify-center transition-all ${
                              isCompleted(habit.id, d)
                                ? "bg-pocket-burgundy text-pocket-cream text-xs"
                                : "bg-pocket-blush/30 hover:bg-pocket-blush/60"
                            } ${d === today() ? "ring-2 ring-pocket-gold ring-offset-1" : ""}`}
                            aria-label={`Toggle ${habit.name} for ${d}`}
                          >
                            {isCompleted(habit.id, d) ? "✓" : ""}
                          </button>
                        </td>
                      ))}
                      <td className="py-2.5 text-center">
                        <span className="text-xs font-bold text-pocket-gold">
                          {getStreak(logs, habit.id)}🔥
                        </span>
                      </td>
                      <td className="py-2.5">
                        <div className="flex gap-1 justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              setForm({
                                name: habit.name,
                                emoji: habit.emoji,
                                color: habit.color,
                              });
                              setEditHabit(habit);
                            }}
                            className="text-pocket-muted hover:text-pocket-burgundy"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteHabit(habit.id)}
                            className="text-pocket-muted hover:text-destructive"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog
        open={addOpen || !!editHabit}
        onOpenChange={(open) => {
          if (!open) {
            setAddOpen(false);
            setEditHabit(null);
            setForm({ name: "", emoji: "✨", color: "#6B1F2A" });
          }
        }}
      >
        <DialogContent className="bg-pocket-cream">
          <DialogHeader>
            <DialogTitle className="font-display text-pocket-burgundy">
              {editHabit ? "Edit Habit" : "Add Habit"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="habit-name"
                className="text-xs font-medium text-pocket-muted mb-1 block"
              >
                Habit Name
              </label>
              <Input
                id="habit-name"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="e.g. Morning meditation"
              />
            </div>
            <div>
              <p className="text-xs font-medium text-pocket-muted mb-2">
                Choose Emoji
              </p>
              <div className="flex flex-wrap gap-2">
                {EMOJI_OPTIONS.map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, emoji: em }))}
                    className={`text-xl p-1.5 rounded-lg transition-all ${form.emoji === em ? "bg-pocket-burgundy/10 ring-2 ring-pocket-burgundy" : "hover:bg-pocket-blush/30"}`}
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>
            <Button
              onClick={saveHabit}
              className="w-full bg-pocket-burgundy text-pocket-cream hover:bg-pocket-burgundy/90"
            >
              {editHabit ? "Update" : "Add Habit"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ===== MOOD TAB =====
function MoodTab() {
  const [entries, setEntries] = useLocalStorage<MoodEntry[]>(
    "pocket_moodEntries",
    [],
  );
  const [selectedMood, setSelectedMood] = useState<
    1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | null
  >(null);
  const [note, setNote] = useState("");

  const todayEntry = entries.find((e) => e.date === today());

  const logMood = () => {
    if (!selectedMood) return;
    if (todayEntry) {
      setEntries((prev) =>
        prev.map((e) =>
          e.id === todayEntry.id ? { ...e, mood: selectedMood, note } : e,
        ),
      );
    } else {
      setEntries((prev) => [
        { id: genId(), date: today(), mood: selectedMood, note },
        ...prev,
      ]);
    }
    toast.success("Mood logged!");
    setSelectedMood(null);
    setNote("");
  };

  const last7 = getLast7Days();
  const recentMoods = last7.map(
    (d) => entries.find((e) => e.date === d) || null,
  );

  return (
    <div className="space-y-4">
      <div className="pocket-card p-6">
        <h3 className="font-display font-bold text-pocket-burgundy text-lg mb-4 pocket-section-header">
          How are you feeling today?
        </h3>
        <div className="grid grid-cols-4 gap-3 mb-4">
          {MOODS.map((emoji, i) => (
            <button
              key={emoji}
              type="button"
              onClick={() =>
                setSelectedMood((i + 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8)
              }
              className={`mood-btn flex flex-col items-center gap-1 ${selectedMood === i + 1 ? "selected" : ""}`}
            >
              <span className="text-3xl">{emoji}</span>
              <span className="text-xs text-pocket-muted">
                {MOOD_LABELS[i]}
              </span>
            </button>
          ))}
        </div>
        <Input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add a note (optional)..."
          className="mb-3"
        />
        <Button
          onClick={logMood}
          disabled={!selectedMood}
          className="w-full bg-pocket-burgundy text-pocket-cream hover:bg-pocket-burgundy/90 disabled:opacity-40"
        >
          Log Mood
        </Button>
        {todayEntry && (
          <p className="text-xs text-pocket-muted text-center mt-2">
            Today: {MOODS[todayEntry.mood - 1]}{" "}
            {MOOD_LABELS[todayEntry.mood - 1]}
          </p>
        )}
      </div>

      {/* 7-day strip */}
      <div className="pocket-card p-4">
        <h4 className="text-sm font-bold text-pocket-burgundy mb-3">
          Last 7 Days
        </h4>
        <div className="flex justify-between">
          {last7.map((d, i) => {
            const entry = recentMoods[i];
            const dayLabel = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
              new Date(`${d}T00:00:00`).getDay()
            ];
            return (
              <div key={d} className="flex flex-col items-center gap-1">
                <span className="text-xs text-pocket-muted">{dayLabel}</span>
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${entry ? "bg-pocket-blush/30" : "bg-pocket-blush/10"} ${d === today() ? "ring-2 ring-pocket-gold" : ""}`}
                >
                  <span className="text-xl">
                    {entry ? MOODS[entry.mood - 1] : "·"}
                  </span>
                </div>
                {entry?.note && (
                  <span
                    className="text-xs text-pocket-muted text-center w-12 truncate"
                    title={entry.note}
                  >
                    "{entry.note}"
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* History */}
      {entries.length > 7 && (
        <div className="pocket-card p-4">
          <h4 className="text-sm font-bold text-pocket-burgundy mb-3">
            History
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {[...entries]
              .sort((a, b) => b.date.localeCompare(a.date))
              .slice(7)
              .map((e) => (
                <div
                  key={e.id}
                  className="flex items-center gap-3 text-sm py-1.5 border-b border-pocket-blush/20"
                >
                  <span className="text-pocket-muted text-xs w-20">
                    {e.date}
                  </span>
                  <span className="text-xl">{MOODS[e.mood - 1]}</span>
                  <span className="text-pocket-muted text-xs">
                    {MOOD_LABELS[e.mood - 1]}
                  </span>
                  {e.note && (
                    <span className="text-xs text-pocket-text flex-1 truncate italic">
                      "{e.note}"
                    </span>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ===== SLEEP TAB =====
function SleepTab() {
  const [entries, setEntries] = useLocalStorage<SleepEntry[]>(
    "pocket_sleepEntries",
    [],
  );
  const [form, setForm] = useState({
    date: today(),
    bedtime: "22:00",
    wakeTime: "07:00",
    quality: 3 as 1 | 2 | 3 | 4 | 5,
    notes: "",
  });

  const calcDuration = (bed: string, wake: string) => {
    const [bh, bm] = bed.split(":").map(Number);
    const [wh, wm] = wake.split(":").map(Number);
    let mins = wh * 60 + wm - (bh * 60 + bm);
    if (mins < 0) mins += 24 * 60;
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  };

  const logSleep = () => {
    const entry: SleepEntry = { id: genId(), ...form };
    setEntries((prev) => [entry, ...prev]);
    toast.success("Sleep logged!");
    setForm({
      date: today(),
      bedtime: "22:00",
      wakeTime: "07:00",
      quality: 3,
      notes: "",
    });
  };

  const recent = [...entries]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 7);

  return (
    <div className="space-y-4">
      <div className="pocket-card p-6">
        <h3 className="font-display font-bold text-pocket-burgundy text-lg mb-4 pocket-section-header">
          Log Sleep
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="sleep-date"
              className="text-xs font-medium text-pocket-muted mb-1 block"
            >
              Date
            </label>
            <Input
              id="sleep-date"
              type="date"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            />
          </div>
          <div>
            <label
              htmlFor="sleep-quality"
              className="text-xs font-medium text-pocket-muted mb-1 block"
            >
              Quality (1-5 stars)
            </label>
            <div className="flex gap-1 mt-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() =>
                    setForm((f) => ({ ...f, quality: n as 1 | 2 | 3 | 4 | 5 }))
                  }
                >
                  <Star
                    size={20}
                    className={
                      n <= form.quality
                        ? "fill-pocket-gold text-pocket-gold"
                        : "text-pocket-blush/50"
                    }
                  />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label
              htmlFor="sleep-bed"
              className="text-xs font-medium text-pocket-muted mb-1 block"
            >
              Bedtime
            </label>
            <Input
              id="sleep-bed"
              type="time"
              value={form.bedtime}
              onChange={(e) =>
                setForm((f) => ({ ...f, bedtime: e.target.value }))
              }
            />
          </div>
          <div>
            <label
              htmlFor="sleep-wake"
              className="text-xs font-medium text-pocket-muted mb-1 block"
            >
              Wake Time
            </label>
            <Input
              id="sleep-wake"
              type="time"
              value={form.wakeTime}
              onChange={(e) =>
                setForm((f) => ({ ...f, wakeTime: e.target.value }))
              }
            />
          </div>
          <div className="col-span-2">
            <label
              htmlFor="sleep-notes"
              className="text-xs font-medium text-pocket-muted mb-1 block"
            >
              Notes
            </label>
            <Input
              id="sleep-notes"
              value={form.notes}
              onChange={(e) =>
                setForm((f) => ({ ...f, notes: e.target.value }))
              }
              placeholder="How did you feel?"
            />
          </div>
        </div>
        <div className="mt-3 p-3 bg-pocket-blush/20 rounded-xl text-center">
          <span className="text-sm text-pocket-text">
            Duration:{" "}
            <strong className="text-pocket-burgundy">
              {calcDuration(form.bedtime, form.wakeTime)}
            </strong>
          </span>
        </div>
        <Button
          onClick={logSleep}
          className="mt-3 w-full bg-pocket-burgundy text-pocket-cream hover:bg-pocket-burgundy/90"
        >
          Log Sleep
        </Button>
      </div>

      {recent.length > 0 && (
        <div className="pocket-card p-4">
          <h4 className="text-sm font-bold text-pocket-burgundy mb-3">
            Recent Sleep Log
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-pocket-muted border-b border-pocket-blush/30">
                  <th className="text-left pb-2">Date</th>
                  <th className="text-left pb-2">Bedtime</th>
                  <th className="text-left pb-2">Wake</th>
                  <th className="text-left pb-2">Duration</th>
                  <th className="text-left pb-2">Quality</th>
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody>
                {recent.map((e) => (
                  <tr
                    key={e.id}
                    className="border-b border-pocket-blush/10 hover:bg-pocket-blush/10"
                  >
                    <td className="py-2 text-pocket-text">{e.date}</td>
                    <td className="py-2 text-pocket-text">{e.bedtime}</td>
                    <td className="py-2 text-pocket-text">{e.wakeTime}</td>
                    <td className="py-2 font-medium text-pocket-burgundy">
                      {calcDuration(e.bedtime, e.wakeTime)}
                    </td>
                    <td className="py-2">
                      {"★".repeat(e.quality)}
                      <span className="text-pocket-blush/40">
                        {"★".repeat(5 - e.quality)}
                      </span>
                    </td>
                    <td className="py-2">
                      <button
                        type="button"
                        onClick={() =>
                          setEntries((prev) =>
                            prev.filter((x) => x.id !== e.id),
                          )
                        }
                        className="text-pocket-muted hover:text-destructive"
                      >
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== MAIN =====
export default function Habits() {
  return (
    <div className="min-h-full p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-display font-bold text-pocket-burgundy">
          Habits
        </h1>
        <div className="h-0.5 w-16 bg-pocket-gold rounded-full mt-2" />
        <p className="text-pocket-muted mt-2 text-sm">
          Track habits, mood, and sleep to understand your patterns.
        </p>
      </div>
      <Tabs defaultValue="habits">
        <TabsList className="mb-6 bg-pocket-blush/20">
          <TabsTrigger
            value="habits"
            className="data-[state=active]:bg-pocket-burgundy data-[state=active]:text-pocket-cream"
          >
            Habits
          </TabsTrigger>
          <TabsTrigger
            value="mood"
            className="data-[state=active]:bg-pocket-burgundy data-[state=active]:text-pocket-cream"
          >
            Mood
          </TabsTrigger>
          <TabsTrigger
            value="sleep"
            className="data-[state=active]:bg-pocket-burgundy data-[state=active]:text-pocket-cream"
          >
            Sleep
          </TabsTrigger>
        </TabsList>
        <TabsContent value="habits">
          <HabitsTab />
        </TabsContent>
        <TabsContent value="mood">
          <MoodTab />
        </TabsContent>
        <TabsContent value="sleep">
          <SleepTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
