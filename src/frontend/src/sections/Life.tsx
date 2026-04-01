import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AnimatePresence, motion } from "@/lib/motion";
import { ChevronRight, Pencil, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLocalStorage } from "../hooks/useLocalStorage";
import {
  type EncyclopediaEntry,
  type Experience,
  type Failure,
  type Fear,
  type FrankensteinModel,
  type GratitudeEntry,
  type LifeValue,
  type Poem,
  type RejectionEntry,
  type Win,
  genId,
  today,
} from "../types/pocket";

type SubSection =
  | "gratitudes"
  | "poems"
  | "successes"
  | "failures"
  | "fears"
  | "rejections"
  | "frankenstein"
  | "values"
  | "encyclopedia"
  | "experiences";

const subSections: { id: SubSection; label: string; emoji: string }[] = [
  { id: "gratitudes", label: "Gratitudes", emoji: "🙏" },
  { id: "poems", label: "Poems", emoji: "✍️" },
  { id: "successes", label: "Successes", emoji: "🏆" },
  { id: "failures", label: "Failures", emoji: "💔" },
  { id: "fears", label: "Fears", emoji: "🌑" },
  { id: "rejections", label: "Rejection Therapy", emoji: "🎯" },
  { id: "frankenstein", label: "Frankenstein Model", emoji: "🪡" },
  { id: "values", label: "Life Values", emoji: "💎" },
  { id: "encyclopedia", label: "Encyclopedia About Me", emoji: "📖" },
  { id: "experiences", label: "Experiences", emoji: "🌟" },
];

// Gratitudes
function GratitudesSection() {
  const [entries, setEntries] = useLocalStorage<GratitudeEntry[]>(
    "pocket_gratitudes",
    [],
  );
  const [form, setForm] = useState<string[]>(["", "", ""]);

  const saveGratitude = () => {
    const items = form.filter((f) => f.trim());
    if (items.length === 0) return;
    const existing = entries.find((e) => e.date === today());
    if (existing) {
      setEntries((prev) =>
        prev.map((e) => (e.id === existing.id ? { ...e, items } : e)),
      );
    } else {
      setEntries((prev) => [{ id: genId(), date: today(), items }, ...prev]);
    }
    setForm(["", "", ""]);
    toast.success("Gratitudes saved! ✨");
  };

  const todayEntry = entries.find((e) => e.date === today());

  return (
    <div className="space-y-4">
      <div className="pocket-card p-6">
        <h3 className="font-display font-bold text-pocket-burgundy text-lg mb-1">
          Today's Gratitudes
        </h3>
        <p className="text-xs text-pocket-muted mb-4 italic">
          Three things you're grateful for today
        </p>
        {[0, 1, 2].map((i) => (
          <div key={i} className="mb-3">
            <label
              htmlFor={`gratitude-${i}`}
              className="text-xs font-medium text-pocket-muted mb-1 block"
            >
              {i + 1}.
            </label>
            <Input
              id={`gratitude-${i}`}
              value={form[i]}
              onChange={(e) =>
                setForm((prev) =>
                  prev.map((v, j) => (j === i ? e.target.value : v)),
                )
              }
              placeholder={
                [
                  "I'm grateful for...",
                  "Something that made me smile...",
                  "A person or moment I appreciate...",
                ][i]
              }
            />
          </div>
        ))}
        {todayEntry && (
          <p className="text-xs text-pocket-muted mb-2">
            Today already logged — submitting will update it.
          </p>
        )}
        <Button
          onClick={saveGratitude}
          className="w-full bg-pocket-burgundy text-pocket-cream hover:bg-pocket-burgundy/90"
        >
          Save Gratitudes
        </Button>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {[...entries]
            .sort((a, b) => b.date.localeCompare(a.date))
            .map((entry) => (
              <motion.div
                key={entry.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="pocket-card p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-pocket-muted font-medium">
                    {entry.date}
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      setEntries((prev) =>
                        prev.filter((e) => e.id !== entry.id),
                      )
                    }
                    className="text-pocket-muted hover:text-destructive"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
                {entry.items.map((item, i) => (
                  <p
                    key={`${entry.id}-${i}`}
                    className="text-sm text-pocket-text font-crimson italic py-0.5"
                  >
                    {i + 1}. "{item}"
                  </p>
                ))}
              </motion.div>
            ))}
        </AnimatePresence>
        {entries.length === 0 && (
          <div className="text-center py-8">
            <p className="text-3xl mb-2">🙏</p>
            <p className="text-pocket-muted italic text-sm">
              Begin your gratitude practice today.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Poems
function PoemsSection() {
  const [poems, setPoems] = useLocalStorage<Poem[]>("pocket_poems", []);
  const [addOpen, setAddOpen] = useState(false);
  const [viewPoem, setViewPoem] = useState<Poem | null>(null);
  const [editPoem, setEditPoem] = useState<Poem | null>(null);
  const [form, setForm] = useState({ title: "", content: "", date: today() });

  const savePoem = () => {
    if (!form.title.trim() || !form.content.trim()) return;
    if (editPoem) {
      setPoems((prev) =>
        prev.map((p) => (p.id === editPoem.id ? { ...p, ...form } : p)),
      );
      setEditPoem(null);
      toast.success("Poem updated!");
    } else {
      setPoems((prev) => [{ id: genId(), ...form }, ...prev]);
      setAddOpen(false);
      toast.success("Poem saved!");
    }
    setForm({ title: "", content: "", date: today() });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-pocket-muted">{poems.length} poems</p>
        <Button
          onClick={() => setAddOpen(true)}
          className="bg-pocket-burgundy text-pocket-cream hover:bg-pocket-burgundy/90"
        >
          <Plus size={14} className="mr-1" /> Write Poem
        </Button>
      </div>

      {poems.length === 0 ? (
        <div className="pocket-card p-10 text-center">
          <p className="text-4xl mb-3">✍️</p>
          <p className="text-pocket-muted italic">
            Your words, your art. Write your first poem.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {poems.map((poem) => (
            <motion.div
              key={poem.id}
              whileHover={{ y: -2 }}
              className="pocket-card p-5 cursor-pointer"
              onClick={() => setViewPoem(poem)}
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-display font-bold text-pocket-burgundy text-base">
                  {poem.title}
                </h4>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setForm({
                        title: poem.title,
                        content: poem.content,
                        date: poem.date,
                      });
                      setEditPoem(poem);
                    }}
                    className="text-pocket-muted hover:text-pocket-burgundy"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPoems((prev) => prev.filter((p) => p.id !== poem.id));
                    }}
                    className="text-pocket-muted hover:text-destructive"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              <p className="text-xs text-pocket-muted mb-2">{poem.date}</p>
              <p className="poem-text text-xs line-clamp-4">{poem.content}</p>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog
        open={addOpen || !!editPoem}
        onOpenChange={(o) => {
          if (!o) {
            setAddOpen(false);
            setEditPoem(null);
            setForm({ title: "", content: "", date: today() });
          }
        }}
      >
        <DialogContent className="bg-pocket-cream max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-pocket-burgundy">
              {editPoem ? "Edit Poem" : "Write a Poem"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="poem-title"
                  className="text-xs font-medium text-pocket-muted mb-1 block"
                >
                  Title
                </label>
                <Input
                  id="poem-title"
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                  placeholder="Poem title"
                />
              </div>
              <div>
                <label
                  htmlFor="poem-date"
                  className="text-xs font-medium text-pocket-muted mb-1 block"
                >
                  Date
                </label>
                <Input
                  id="poem-date"
                  type="date"
                  value={form.date}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, date: e.target.value }))
                  }
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="poem-content"
                className="text-xs font-medium text-pocket-muted mb-1 block"
              >
                Your poem
              </label>
              <Textarea
                id="poem-content"
                value={form.content}
                onChange={(e) =>
                  setForm((f) => ({ ...f, content: e.target.value }))
                }
                rows={10}
                placeholder="Write your poem here..."
                className="font-crimson text-base"
              />
            </div>
            <Button
              onClick={savePoem}
              className="w-full bg-pocket-burgundy text-pocket-cream hover:bg-pocket-burgundy/90"
            >
              {editPoem ? "Update" : "Save Poem"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewPoem} onOpenChange={(o) => !o && setViewPoem(null)}>
        <DialogContent className="bg-pocket-cream max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-pocket-burgundy text-xl">
              {viewPoem?.title}
            </DialogTitle>
          </DialogHeader>
          <p className="text-xs text-pocket-muted mb-4">{viewPoem?.date}</p>
          <div className="poem-text text-sm leading-relaxed">
            {viewPoem?.content}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Successes
function SuccessesSection() {
  const [wins, setWins] = useLocalStorage<Win[]>("pocket_successes", []);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: today(),
  });

  const save = () => {
    if (!form.title.trim()) return;
    setWins((prev) => [{ id: genId(), ...form }, ...prev]);
    setAddOpen(false);
    setForm({ title: "", description: "", date: today() });
    toast.success("Win logged! 🏆");
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-pocket-muted">{wins.length} wins logged</p>
        <Button
          onClick={() => setAddOpen(true)}
          className="bg-pocket-burgundy text-pocket-cream hover:bg-pocket-burgundy/90"
        >
          <Plus size={14} className="mr-1" /> Log Win
        </Button>
      </div>
      {wins.length === 0 ? (
        <div className="pocket-card p-10 text-center">
          <p className="text-4xl mb-3">🏆</p>
          <p className="text-pocket-muted italic">
            Celebrate your wins, big and small!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {wins.map((w) => (
            <motion.div
              key={w.id}
              layout
              className="pocket-card p-4"
              style={{ borderLeft: "3px solid oklch(0.72 0.09 80)" }}
            >
              <div className="flex justify-between mb-1">
                <h4 className="font-display font-bold text-pocket-burgundy text-sm">
                  {w.title}
                </h4>
                <div className="flex gap-1">
                  <span className="text-xs text-pocket-muted">{w.date}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setWins((prev) => prev.filter((x) => x.id !== w.id))
                    }
                    className="text-pocket-muted hover:text-destructive ml-2"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              {w.description && (
                <p className="text-sm text-pocket-text">{w.description}</p>
              )}
            </motion.div>
          ))}
        </div>
      )}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="bg-pocket-cream">
          <DialogHeader>
            <DialogTitle className="font-display text-pocket-burgundy">
              Log a Win
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label
                htmlFor="win-title"
                className="text-xs font-medium text-pocket-muted mb-1 block"
              >
                Title
              </label>
              <Input
                id="win-title"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="What did you achieve?"
              />
            </div>
            <div>
              <label
                htmlFor="win-desc"
                className="text-xs font-medium text-pocket-muted mb-1 block"
              >
                Description
              </label>
              <Textarea
                id="win-desc"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                rows={3}
                placeholder="Tell the story..."
              />
            </div>
            <div>
              <label
                htmlFor="win-date"
                className="text-xs font-medium text-pocket-muted mb-1 block"
              >
                Date
              </label>
              <Input
                id="win-date"
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm((f) => ({ ...f, date: e.target.value }))
                }
              />
            </div>
            <Button
              onClick={save}
              className="w-full bg-pocket-burgundy text-pocket-cream hover:bg-pocket-burgundy/90"
            >
              Save Win
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Failures
function FailuresSection() {
  const [failures, setFailures] = useLocalStorage<Failure[]>(
    "pocket_failures",
    [],
  );
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    reflection: "",
    date: today(),
  });

  const save = () => {
    if (!form.title.trim()) return;
    setFailures((prev) => [{ id: genId(), ...form }, ...prev]);
    setAddOpen(false);
    setForm({ title: "", description: "", reflection: "", date: today() });
    toast.success("Lesson logged 💪");
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-pocket-muted">
            {failures.length} lessons from failure
          </p>
          <p className="text-xs text-pocket-muted/70 italic">
            Failure is data, not defeat.
          </p>
        </div>
        <Button
          onClick={() => setAddOpen(true)}
          className="bg-pocket-burgundy text-pocket-cream hover:bg-pocket-burgundy/90"
        >
          <Plus size={14} className="mr-1" /> Log Failure
        </Button>
      </div>
      {failures.length === 0 ? (
        <div className="pocket-card p-10 text-center">
          <p className="text-4xl mb-3">💔</p>
          <p className="text-pocket-muted italic">
            Your setbacks are your stepping stones.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {failures.map((f) => (
            <motion.div key={f.id} layout className="pocket-card p-4">
              <div className="flex justify-between mb-1">
                <h4 className="font-display font-bold text-pocket-burgundy text-sm">
                  {f.title}
                </h4>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-pocket-muted">{f.date}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setFailures((prev) => prev.filter((x) => x.id !== f.id))
                    }
                    className="text-pocket-muted hover:text-destructive"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              {f.description && (
                <p className="text-sm text-pocket-text mb-2">{f.description}</p>
              )}
              {f.reflection && (
                <div className="bg-pocket-blush/20 rounded-xl p-3">
                  <p className="text-xs font-medium text-pocket-burgundy mb-1">
                    Reflection ✦
                  </p>
                  <p className="text-sm text-pocket-text font-crimson italic">
                    {f.reflection}
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="bg-pocket-cream">
          <DialogHeader>
            <DialogTitle className="font-display text-pocket-burgundy">
              Log a Failure
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label
                htmlFor="fail-title"
                className="text-xs font-medium text-pocket-muted mb-1 block"
              >
                What happened?
              </label>
              <Input
                id="fail-title"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="Brief title"
              />
            </div>
            <div>
              <label
                htmlFor="fail-desc"
                className="text-xs font-medium text-pocket-muted mb-1 block"
              >
                Description
              </label>
              <Textarea
                id="fail-desc"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                rows={2}
                placeholder="What happened..."
              />
            </div>
            <div>
              <label
                htmlFor="fail-reflect"
                className="text-xs font-medium text-pocket-muted mb-1 block"
              >
                Reflection / Lesson learned
              </label>
              <Textarea
                id="fail-reflect"
                value={form.reflection}
                onChange={(e) =>
                  setForm((f) => ({ ...f, reflection: e.target.value }))
                }
                rows={3}
                placeholder="What did you learn from this?"
              />
            </div>
            <div>
              <label
                htmlFor="fail-date"
                className="text-xs font-medium text-pocket-muted mb-1 block"
              >
                Date
              </label>
              <Input
                id="fail-date"
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm((f) => ({ ...f, date: e.target.value }))
                }
              />
            </div>
            <Button
              onClick={save}
              className="w-full bg-pocket-burgundy text-pocket-cream hover:bg-pocket-burgundy/90"
            >
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Fears
function FearsSection() {
  const [fears, setFears] = useLocalStorage<Fear[]>("pocket_fears", []);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ fear: "", notes: "" });

  const save = () => {
    if (!form.fear.trim()) return;
    setFears((prev) => [
      {
        id: genId(),
        ...form,
        facing: false,
        addedAt: new Date().toISOString(),
      },
      ...prev,
    ]);
    setAddOpen(false);
    setForm({ fear: "", notes: "" });
    toast.success("Fear acknowledged 🌑");
  };

  const toggleFacing = (id: string) => {
    setFears((prev) =>
      prev.map((f) => (f.id === id ? { ...f, facing: !f.facing } : f)),
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-pocket-muted">
          {fears.length} fears · {fears.filter((f) => f.facing).length} being
          faced
        </p>
        <Button
          onClick={() => setAddOpen(true)}
          className="bg-pocket-burgundy text-pocket-cream hover:bg-pocket-burgundy/90"
        >
          <Plus size={14} className="mr-1" /> Add Fear
        </Button>
      </div>
      {fears.length === 0 ? (
        <div className="pocket-card p-10 text-center">
          <p className="text-4xl mb-3">🌑</p>
          <p className="text-pocket-muted italic">
            Name your fears. That's the first step.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {fears.map((f) => (
            <motion.div
              key={f.id}
              layout
              className={`pocket-card p-4 flex items-start gap-3 ${f.facing ? "opacity-70" : ""}`}
            >
              <Checkbox
                checked={f.facing}
                onCheckedChange={() => toggleFacing(f.id)}
                className="mt-0.5 border-pocket-blush data-[state=checked]:bg-pocket-burgundy"
              />
              <div className="flex-1">
                <p
                  className={`text-sm font-medium text-pocket-text ${f.facing ? "line-through text-pocket-muted" : ""}`}
                >
                  {f.fear}
                </p>
                {f.notes && (
                  <p className="text-xs text-pocket-muted mt-0.5">{f.notes}</p>
                )}
                {f.facing && (
                  <span className="text-xs text-green-600 font-medium">
                    Facing this fear ✓
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() =>
                  setFears((prev) => prev.filter((x) => x.id !== f.id))
                }
                className="text-pocket-muted hover:text-destructive shrink-0"
              >
                <Trash2 size={13} />
              </button>
            </motion.div>
          ))}
        </div>
      )}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="bg-pocket-cream">
          <DialogHeader>
            <DialogTitle className="font-display text-pocket-burgundy">
              Name a Fear
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label
                htmlFor="fear-text"
                className="text-xs font-medium text-pocket-muted mb-1 block"
              >
                Fear
              </label>
              <Input
                id="fear-text"
                value={form.fear}
                onChange={(e) =>
                  setForm((f) => ({ ...f, fear: e.target.value }))
                }
                placeholder="What are you afraid of?"
              />
            </div>
            <div>
              <label
                htmlFor="fear-notes"
                className="text-xs font-medium text-pocket-muted mb-1 block"
              >
                Notes / Context
              </label>
              <Textarea
                id="fear-notes"
                value={form.notes}
                onChange={(e) =>
                  setForm((f) => ({ ...f, notes: e.target.value }))
                }
                rows={2}
                placeholder="More context..."
              />
            </div>
            <Button
              onClick={save}
              className="w-full bg-pocket-burgundy text-pocket-cream hover:bg-pocket-burgundy/90"
            >
              Add Fear
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Rejection Therapy
function RejectionsSection() {
  const [entries, setEntries] = useLocalStorage<RejectionEntry[]>(
    "pocket_rejections",
    [],
  );
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({
    date: today(),
    context: "",
    outcome: "",
    reflection: "",
  });

  const save = () => {
    if (!form.context.trim()) return;
    setEntries((prev) => [{ id: genId(), ...form }, ...prev]);
    setAddOpen(false);
    setForm({ date: today(), context: "", outcome: "", reflection: "" });
    toast.success(`Rejection #${entries.length + 1} logged! 🎯`);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="pocket-card px-4 py-2 flex items-center gap-3">
          <span className="text-2xl font-display font-bold text-pocket-burgundy">
            {entries.length}
          </span>
          <span className="text-xs text-pocket-muted">
            Total rejections
            <br />
            <span className="text-pocket-burgundy font-medium">collected</span>
          </span>
        </div>
        <Button
          onClick={() => setAddOpen(true)}
          className="bg-pocket-burgundy text-pocket-cream hover:bg-pocket-burgundy/90"
        >
          <Plus size={14} className="mr-1" /> Log Rejection
        </Button>
      </div>
      {entries.length === 0 ? (
        <div className="pocket-card p-10 text-center">
          <p className="text-4xl mb-3">🎯</p>
          <p className="text-pocket-muted italic">
            Rejection = data. Collect them like trophies.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {[...entries]
            .sort((a, b) => b.date.localeCompare(a.date))
            .map((e, i) => (
              <motion.div key={e.id} layout className="pocket-card p-4">
                <div className="flex justify-between mb-2">
                  <span className="pocket-badge-gold">
                    #{entries.length - i}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-pocket-muted">{e.date}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setEntries((prev) => prev.filter((x) => x.id !== e.id))
                      }
                      className="text-pocket-muted hover:text-destructive"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                <p className="text-sm font-medium text-pocket-text mb-1">
                  {e.context}
                </p>
                {e.outcome && (
                  <p className="text-xs text-pocket-muted mb-1">
                    Outcome: {e.outcome}
                  </p>
                )}
                {e.reflection && (
                  <p className="text-xs text-pocket-text font-crimson italic border-l-2 border-pocket-gold pl-2 mt-1">
                    {e.reflection}
                  </p>
                )}
              </motion.div>
            ))}
        </div>
      )}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="bg-pocket-cream">
          <DialogHeader>
            <DialogTitle className="font-display text-pocket-burgundy">
              Log Rejection #{entries.length + 1}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label
                htmlFor="rej-date"
                className="text-xs font-medium text-pocket-muted mb-1 block"
              >
                Date
              </label>
              <Input
                id="rej-date"
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm((f) => ({ ...f, date: e.target.value }))
                }
              />
            </div>
            <div>
              <label
                htmlFor="rej-context"
                className="text-xs font-medium text-pocket-muted mb-1 block"
              >
                Context / What happened?
              </label>
              <Textarea
                id="rej-context"
                value={form.context}
                onChange={(e) =>
                  setForm((f) => ({ ...f, context: e.target.value }))
                }
                rows={2}
                placeholder="What did you ask for / attempt?"
              />
            </div>
            <div>
              <label
                htmlFor="rej-outcome"
                className="text-xs font-medium text-pocket-muted mb-1 block"
              >
                Outcome
              </label>
              <Input
                id="rej-outcome"
                value={form.outcome}
                onChange={(e) =>
                  setForm((f) => ({ ...f, outcome: e.target.value }))
                }
                placeholder="What happened?"
              />
            </div>
            <div>
              <label
                htmlFor="rej-reflect"
                className="text-xs font-medium text-pocket-muted mb-1 block"
              >
                Reflection
              </label>
              <Textarea
                id="rej-reflect"
                value={form.reflection}
                onChange={(e) =>
                  setForm((f) => ({ ...f, reflection: e.target.value }))
                }
                rows={2}
                placeholder="What did you learn?"
              />
            </div>
            <Button
              onClick={save}
              className="w-full bg-pocket-burgundy text-pocket-cream hover:bg-pocket-burgundy/90"
            >
              Log It!
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Frankenstein
function FrankensteinSection() {
  const [model, setModel] = useLocalStorage<FrankensteinModel>(
    "pocket_frankenstein",
    {
      head: "",
      arms: "",
      torso: "",
      legs: "",
    },
  );
  const [form, setForm] = useState({ ...model });

  const save = () => {
    setModel(form);
    toast.success("Frankenstein model saved!");
  };

  const sections: {
    key: keyof FrankensteinModel;
    label: string;
    emoji: string;
    desc: string;
    pos: string;
  }[] = [
    {
      key: "head",
      label: "Head",
      emoji: "🧠",
      desc: "Traits & Behaviors you don't want",
      pos: "top",
    },
    {
      key: "arms",
      label: "Arms",
      emoji: "💪",
      desc: "Lifestyles you don't want",
      pos: "left",
    },
    {
      key: "torso",
      label: "Torso",
      emoji: "🫀",
      desc: "Habits you don't want",
      pos: "center",
    },
    {
      key: "legs",
      label: "Legs",
      emoji: "🦵",
      desc: "Outcomes you don't want",
      pos: "bottom",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="pocket-card p-6">
        <h3 className="font-display font-bold text-pocket-burgundy text-xl mb-1">
          The Frankenstein Model
        </h3>
        <p className="text-sm text-pocket-muted italic mb-6">
          Define what you <em>don't</em> want — to clarify who you truly want to
          be.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {sections.map((s) => (
            <div
              key={s.key}
              className="bg-white rounded-2xl p-4 border border-pocket-blush/40"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{s.emoji}</span>
                <div>
                  <p className="font-display font-bold text-pocket-burgundy text-sm">
                    {s.label}
                  </p>
                  <p className="text-xs text-pocket-muted">{s.desc}</p>
                </div>
              </div>
              <Textarea
                value={form[s.key]}
                onChange={(e) =>
                  setForm((f) => ({ ...f, [s.key]: e.target.value }))
                }
                rows={4}
                placeholder={`${s.desc}...`}
                className="resize-none text-sm"
              />
            </div>
          ))}
        </div>
        <Button
          onClick={save}
          className="mt-4 w-full bg-pocket-burgundy text-pocket-cream hover:bg-pocket-burgundy/90"
        >
          Save Model
        </Button>
      </div>
    </div>
  );
}

// Life Values
function ValuesSection() {
  const [values, setValues] = useLocalStorage<LifeValue[]>("pocket_values", []);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });

  const save = () => {
    if (!form.name.trim()) return;
    setValues((prev) => [...prev, { id: genId(), ...form }]);
    setAddOpen(false);
    setForm({ name: "", description: "" });
    toast.success("Value added! 💎");
  };

  const VALUE_COLORS = [
    "bg-red-50 border-red-200",
    "bg-orange-50 border-orange-200",
    "bg-yellow-50 border-yellow-200",
    "bg-green-50 border-green-200",
    "bg-teal-50 border-teal-200",
    "bg-blue-50 border-blue-200",
    "bg-purple-50 border-purple-200",
    "bg-pink-50 border-pink-200",
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-pocket-muted">{values.length} core values</p>
        <Button
          onClick={() => setAddOpen(true)}
          className="bg-pocket-burgundy text-pocket-cream hover:bg-pocket-burgundy/90"
        >
          <Plus size={14} className="mr-1" /> Add Value
        </Button>
      </div>
      {values.length === 0 ? (
        <div className="pocket-card p-10 text-center">
          <p className="text-4xl mb-3">💎</p>
          <p className="text-pocket-muted italic">
            What do you stand for? Define your core values.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {values.map((v, i) => (
            <motion.div
              key={v.id}
              layout
              className={`rounded-2xl border-2 p-5 ${VALUE_COLORS[i % VALUE_COLORS.length]}`}
            >
              <div className="flex justify-between items-start">
                <h4 className="font-display font-bold text-pocket-burgundy text-base mb-2">
                  {v.name}
                </h4>
                <button
                  type="button"
                  onClick={() =>
                    setValues((prev) => prev.filter((x) => x.id !== v.id))
                  }
                  className="text-pocket-muted hover:text-destructive"
                >
                  <Trash2 size={13} />
                </button>
              </div>
              {v.description && (
                <p className="text-sm text-pocket-text">{v.description}</p>
              )}
            </motion.div>
          ))}
        </div>
      )}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="bg-pocket-cream">
          <DialogHeader>
            <DialogTitle className="font-display text-pocket-burgundy">
              Add Life Value
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label
                htmlFor="val-name"
                className="text-xs font-medium text-pocket-muted mb-1 block"
              >
                Value
              </label>
              <Input
                id="val-name"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="e.g. Integrity, Growth, Freedom"
              />
            </div>
            <div>
              <label
                htmlFor="val-desc"
                className="text-xs font-medium text-pocket-muted mb-1 block"
              >
                What it means to you
              </label>
              <Textarea
                id="val-desc"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                rows={3}
                placeholder="Describe this value..."
              />
            </div>
            <Button
              onClick={save}
              className="w-full bg-pocket-burgundy text-pocket-cream hover:bg-pocket-burgundy/90"
            >
              Add Value
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Encyclopedia
function EncyclopediaSection() {
  const [entries, setEntries] = useLocalStorage<EncyclopediaEntry[]>(
    "pocket_encyclopedia",
    [
      { id: genId(), field: "Blood Type", value: "" },
      { id: genId(), field: "Personality Type", value: "" },
      { id: genId(), field: "Zodiac Sign", value: "" },
      { id: genId(), field: "Favorite Color", value: "" },
      { id: genId(), field: "Enneagram", value: "" },
      { id: genId(), field: "Love Language", value: "" },
    ],
  );
  const [newField, setNewField] = useState("");
  const [addOpen, setAddOpen] = useState(false);

  const updateEntry = (id: string, value: string) => {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, value } : e)));
  };

  const addEntry = () => {
    if (!newField.trim()) return;
    setEntries((prev) => [
      ...prev,
      { id: genId(), field: newField, value: "" },
    ]);
    setNewField("");
    setAddOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-display font-bold text-pocket-burgundy text-lg">
          About Me
        </h3>
        <Button
          onClick={() => setAddOpen(true)}
          className="bg-pocket-burgundy text-pocket-cream hover:bg-pocket-burgundy/90"
          size="sm"
        >
          <Plus size={13} className="mr-1" /> Add Field
        </Button>
      </div>
      <div className="pocket-card p-4">
        <div className="space-y-3">
          {entries.map((entry) => (
            <div key={entry.id} className="flex items-center gap-3">
              <span className="text-sm font-medium text-pocket-text w-36 shrink-0">
                {entry.field}
              </span>
              <Input
                value={entry.value}
                onChange={(e) => updateEntry(entry.id, e.target.value)}
                placeholder={`Enter ${entry.field.toLowerCase()}...`}
                className="flex-1"
              />
              <button
                type="button"
                onClick={() =>
                  setEntries((prev) => prev.filter((e) => e.id !== entry.id))
                }
                className="text-pocket-muted hover:text-destructive shrink-0"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
        <Button
          onClick={() => setEntries((prev) => prev)}
          className="mt-4 w-full bg-pocket-burgundy text-pocket-cream hover:bg-pocket-burgundy/90"
        >
          Save Changes
        </Button>
      </div>
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="bg-pocket-cream">
          <DialogHeader>
            <DialogTitle className="font-display text-pocket-burgundy">
              Add Field
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label
                htmlFor="enc-field"
                className="text-xs font-medium text-pocket-muted mb-1 block"
              >
                Field Name
              </label>
              <Input
                id="enc-field"
                value={newField}
                onChange={(e) => setNewField(e.target.value)}
                placeholder="e.g. Favorite Book, Birth Year..."
                onKeyDown={(e) => e.key === "Enter" && addEntry()}
              />
            </div>
            <Button
              onClick={addEntry}
              className="w-full bg-pocket-burgundy text-pocket-cream hover:bg-pocket-burgundy/90"
            >
              Add Field
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Experiences
function ExperienceForm({
  form,
  setForm,
  onSave,
  saveLabel,
}: {
  form: { title: string; description: string; date: string; category: string };
  setForm: React.Dispatch<
    React.SetStateAction<{
      title: string;
      description: string;
      date: string;
      category: string;
    }>
  >;
  onSave: () => void;
  saveLabel: string;
}) {
  return (
    <div className="space-y-3">
      <div>
        <label
          htmlFor="exp-title"
          className="text-xs font-medium text-pocket-muted mb-1 block"
        >
          Title
        </label>
        <Input
          id="exp-title"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          placeholder="What happened?"
        />
      </div>
      <div>
        <label
          htmlFor="exp-desc"
          className="text-xs font-medium text-pocket-muted mb-1 block"
        >
          Description
        </label>
        <Textarea
          id="exp-desc"
          value={form.description}
          onChange={(e) =>
            setForm((f) => ({ ...f, description: e.target.value }))
          }
          rows={3}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label
            htmlFor="exp-cat"
            className="text-xs font-medium text-pocket-muted mb-1 block"
          >
            Category
          </label>
          <Input
            id="exp-cat"
            value={form.category}
            onChange={(e) =>
              setForm((f) => ({ ...f, category: e.target.value }))
            }
            placeholder="Travel, Work, Personal..."
          />
        </div>
        <div>
          <label
            htmlFor="exp-date"
            className="text-xs font-medium text-pocket-muted mb-1 block"
          >
            Date
          </label>
          <Input
            id="exp-date"
            type="date"
            value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
          />
        </div>
      </div>
      <Button
        onClick={onSave}
        className="w-full bg-pocket-burgundy text-pocket-cream hover:bg-pocket-burgundy/90"
      >
        {saveLabel}
      </Button>
    </div>
  );
}

function ExperiencesSection() {
  const [experiences, setExperiences] = useLocalStorage<Experience[]>(
    "pocket_experiences",
    [],
  );
  const [addOpen, setAddOpen] = useState(false);
  const [editExp, setEditExp] = useState<Experience | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: today(),
    category: "",
  });
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    date: today(),
    category: "",
  });

  const save = () => {
    if (!form.title.trim()) return;
    setExperiences((prev) => [{ id: genId(), ...form }, ...prev]);
    setAddOpen(false);
    setForm({ title: "", description: "", date: today(), category: "" });
    toast.success("Experience logged! 🌟");
  };

  const openEdit = (exp: Experience) => {
    setEditExp(exp);
    setEditForm({
      title: exp.title,
      description: exp.description,
      date: exp.date,
      category: exp.category,
    });
  };

  const saveEdit = () => {
    if (!editForm.title.trim() || !editExp) return;
    setExperiences((prev) =>
      prev.map((e) => (e.id === editExp.id ? { ...e, ...editForm } : e)),
    );
    setEditExp(null);
    toast.success("Experience updated!");
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-pocket-muted">
          {experiences.length} experiences
        </p>
        <Button
          onClick={() => setAddOpen(true)}
          className="bg-pocket-burgundy text-pocket-cream hover:bg-pocket-burgundy/90"
        >
          <Plus size={14} className="mr-1" /> Add Experience
        </Button>
      </div>
      {experiences.length === 0 ? (
        <div className="pocket-card p-10 text-center">
          <p className="text-4xl mb-3">🌟</p>
          <p className="text-pocket-muted italic">
            Log the moments that shape your story.
          </p>
        </div>
      ) : (
        <div className="relative pl-8">
          <div className="timeline-line" />
          {[...experiences]
            .sort((a, b) => b.date.localeCompare(a.date))
            .map((exp) => (
              <motion.div key={exp.id} layout className="relative mb-4 pl-4">
                <div className="absolute -left-[0.9rem] top-3 w-3 h-3 rounded-full bg-pocket-burgundy border-2 border-white" />
                <div className="pocket-card p-4">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-display font-bold text-pocket-burgundy text-sm">
                      {exp.title}
                    </h4>
                    <div className="flex items-center gap-2">
                      {exp.category && (
                        <span className="pocket-badge-blush text-xs">
                          {exp.category}
                        </span>
                      )}
                      <span className="text-xs text-pocket-muted">
                        {exp.date}
                      </span>
                      <button
                        type="button"
                        onClick={() => openEdit(exp)}
                        className="text-pocket-muted hover:text-pocket-burgundy"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setExperiences((prev) =>
                            prev.filter((x) => x.id !== exp.id),
                          )
                        }
                        className="text-pocket-muted hover:text-destructive"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                  {exp.description && (
                    <p className="text-sm text-pocket-text">
                      {exp.description}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="bg-pocket-cream">
          <DialogHeader>
            <DialogTitle className="font-display text-pocket-burgundy">
              Log Experience
            </DialogTitle>
          </DialogHeader>
          <ExperienceForm
            form={form}
            setForm={setForm}
            onSave={save}
            saveLabel="Save"
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={!!editExp}
        onOpenChange={(open) => !open && setEditExp(null)}
      >
        <DialogContent className="bg-pocket-cream">
          <DialogHeader>
            <DialogTitle className="font-display text-pocket-burgundy">
              Edit Experience
            </DialogTitle>
          </DialogHeader>
          <ExperienceForm
            form={editForm}
            setForm={setEditForm}
            onSave={saveEdit}
            saveLabel="Update"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ===== MAIN LIFE SECTION =====
const SECTIONS_MAP: Record<SubSection, React.ReactNode> = {
  gratitudes: <GratitudesSection />,
  poems: <PoemsSection />,
  successes: <SuccessesSection />,
  failures: <FailuresSection />,
  fears: <FearsSection />,
  rejections: <RejectionsSection />,
  frankenstein: <FrankensteinSection />,
  values: <ValuesSection />,
  encyclopedia: <EncyclopediaSection />,
  experiences: <ExperiencesSection />,
};

export default function Life() {
  const [active, setActive] = useState<SubSection>("gratitudes");
  const current = subSections.find((s) => s.id === active)!;

  return (
    <div className="min-h-full flex">
      {/* Sub-sidebar */}
      <div className="w-44 shrink-0 border-r border-pocket-blush/30 py-4 bg-pocket-cream/50">
        <p className="text-xs font-bold text-pocket-muted uppercase tracking-wider px-4 mb-2">
          Life
        </p>
        {subSections.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setActive(s.id)}
            className={`w-full flex items-center gap-2 px-4 py-2 text-left text-sm transition-all ${
              active === s.id
                ? "bg-pocket-burgundy text-pocket-cream font-medium"
                : "text-pocket-muted hover:text-pocket-text hover:bg-pocket-blush/20"
            }`}
          >
            <span>{s.emoji}</span>
            <span className="truncate">{s.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-display font-bold text-pocket-burgundy">
            {current.emoji} {current.label}
          </h1>
          <div className="h-0.5 w-16 bg-pocket-gold rounded-full mt-2" />
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {SECTIONS_MAP[active]}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
