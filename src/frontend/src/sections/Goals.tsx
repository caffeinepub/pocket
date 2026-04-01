import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { AnimatePresence, motion } from "@/lib/motion";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLocalStorage } from "../hooks/useLocalStorage";
import {
  type BucketItem,
  type Goal,
  type Idea,
  type LifeQuest,
  genId,
  today,
} from "../types/pocket";

const STATUS_COLORS: Record<string, string> = {
  active: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  paused: "bg-yellow-100 text-yellow-700",
  raw: "bg-gray-100 text-gray-700",
  developing: "bg-blue-100 text-blue-700",
  shelved: "bg-yellow-100 text-yellow-700",
  pursuing: "bg-green-100 text-green-700",
};

// Goals
function GoalsTab() {
  const [goals, setGoals] = useLocalStorage<Goal[]>("pocket_goals", []);
  const [addOpen, setAddOpen] = useState(false);
  const [editGoal, setEditGoal] = useState<Goal | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    deadline: "",
    status: "active" as Goal["status"],
    type: "short" as Goal["type"],
    notes: "",
  });
  const [typeFilter, setTypeFilter] = useState<"short" | "long">("short");

  const save = () => {
    if (!form.title.trim()) return;
    if (editGoal) {
      setGoals((prev) =>
        prev.map((g) => (g.id === editGoal.id ? { ...g, ...form } : g)),
      );
      setEditGoal(null);
      toast.success("Goal updated!");
    } else {
      setGoals((prev) => [{ id: genId(), ...form }, ...prev]);
      setAddOpen(false);
      toast.success("Goal added!");
    }
    setForm({
      title: "",
      description: "",
      deadline: "",
      status: "active",
      type: "short",
      notes: "",
    });
  };

  const filtered = goals.filter((g) => g.type === typeFilter);
  const statusPct: Record<Goal["status"], number> = {
    active: 40,
    paused: 10,
    completed: 100,
  };

  const formContent = (
    <div className="space-y-3">
      <div>
        <label
          htmlFor="goal-title"
          className="text-xs font-medium text-pocket-muted mb-1 block"
        >
          Title *
        </label>
        <Input
          id="goal-title"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          placeholder="Goal title"
        />
      </div>
      <div>
        <label
          htmlFor="goal-desc"
          className="text-xs font-medium text-pocket-muted mb-1 block"
        >
          Description
        </label>
        <Textarea
          id="goal-desc"
          value={form.description}
          onChange={(e) =>
            setForm((f) => ({ ...f, description: e.target.value }))
          }
          rows={2}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label
            htmlFor="goal-type"
            className="text-xs font-medium text-pocket-muted mb-1 block"
          >
            Type
          </label>
          <Select
            value={form.type}
            onValueChange={(v) =>
              setForm((f) => ({ ...f, type: v as Goal["type"] }))
            }
          >
            <SelectTrigger id="goal-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="short">Short Term</SelectItem>
              <SelectItem value="long">Long Term</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label
            htmlFor="goal-status"
            className="text-xs font-medium text-pocket-muted mb-1 block"
          >
            Status
          </label>
          <Select
            value={form.status}
            onValueChange={(v) =>
              setForm((f) => ({ ...f, status: v as Goal["status"] }))
            }
          >
            <SelectTrigger id="goal-status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <label
          htmlFor="goal-deadline"
          className="text-xs font-medium text-pocket-muted mb-1 block"
        >
          Deadline
        </label>
        <Input
          id="goal-deadline"
          type="date"
          value={form.deadline}
          onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))}
        />
      </div>
      <div>
        <label
          htmlFor="goal-notes"
          className="text-xs font-medium text-pocket-muted mb-1 block"
        >
          Progress Notes
        </label>
        <Textarea
          id="goal-notes"
          value={form.notes}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          rows={2}
          placeholder="Updates, progress..."
        />
      </div>
      <Button
        onClick={save}
        className="w-full bg-pocket-burgundy text-pocket-cream hover:bg-pocket-burgundy/90"
      >
        {editGoal ? "Update" : "Add Goal"}
      </Button>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex bg-pocket-blush/20 rounded-lg p-0.5">
          {(["short", "long"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTypeFilter(t)}
              className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${typeFilter === t ? "bg-pocket-burgundy text-pocket-cream" : "text-pocket-muted hover:text-pocket-text"}`}
            >
              {t === "short" ? "Short Term" : "Long Term"}
            </button>
          ))}
        </div>
        <Button
          onClick={() => {
            setForm((f) => ({ ...f, type: typeFilter }));
            setAddOpen(true);
          }}
          className="bg-pocket-burgundy text-pocket-cream hover:bg-pocket-burgundy/90"
        >
          <Plus size={14} className="mr-1" /> Add Goal
        </Button>
      </div>

      {filtered.length === 0 ? (
        <div className="pocket-card p-10 text-center">
          <p className="text-4xl mb-3">🎯</p>
          <p className="text-pocket-muted italic">
            Set your first {typeFilter === "short" ? "short-term" : "long-term"}{" "}
            goal.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((goal) => (
              <motion.div
                key={goal.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="pocket-card p-4"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-display font-bold text-pocket-burgundy text-sm">
                        {goal.title}
                      </h4>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[goal.status]}`}
                      >
                        {goal.status}
                      </span>
                    </div>
                    {goal.description && (
                      <p className="text-xs text-pocket-text mb-2">
                        {goal.description}
                      </p>
                    )}
                    <Progress
                      value={statusPct[goal.status]}
                      className="h-1.5 mb-1"
                    />
                    <div className="flex justify-between items-center text-xs text-pocket-muted">
                      {goal.deadline && <span>Due: {goal.deadline}</span>}
                      <span>{statusPct[goal.status]}%</span>
                    </div>
                    {goal.notes && (
                      <p className="text-xs text-pocket-muted mt-1 italic border-l-2 border-pocket-gold pl-2">
                        {goal.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setForm({
                          title: goal.title,
                          description: goal.description,
                          deadline: goal.deadline,
                          status: goal.status,
                          type: goal.type,
                          notes: goal.notes,
                        });
                        setEditGoal(goal);
                      }}
                      className="text-pocket-muted hover:text-pocket-burgundy"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setGoals((prev) => prev.filter((g) => g.id !== goal.id))
                      }
                      className="text-pocket-muted hover:text-destructive"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="bg-pocket-cream">
          <DialogHeader>
            <DialogTitle className="font-display text-pocket-burgundy">
              Add Goal
            </DialogTitle>
          </DialogHeader>
          {formContent}
        </DialogContent>
      </Dialog>
      <Dialog open={!!editGoal} onOpenChange={(o) => !o && setEditGoal(null)}>
        <DialogContent className="bg-pocket-cream">
          <DialogHeader>
            <DialogTitle className="font-display text-pocket-burgundy">
              Edit Goal
            </DialogTitle>
          </DialogHeader>
          {formContent}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Life Quests
function QuestsTab() {
  const [quests, setQuests] = useLocalStorage<LifeQuest[]>("pocket_quests", []);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "" });
  const [newStep, setNewStep] = useState<Record<string, string>>({});

  const addQuest = () => {
    if (!form.title.trim()) return;
    setQuests((prev) => [{ id: genId(), ...form, steps: [] }, ...prev]);
    setAddOpen(false);
    setForm({ title: "", description: "" });
    toast.success("Quest created! ⚔️");
  };

  const addStep = (questId: string) => {
    const text = newStep[questId];
    if (!text?.trim()) return;
    setQuests((prev) =>
      prev.map((q) =>
        q.id === questId
          ? { ...q, steps: [...q.steps, { id: genId(), text, done: false }] }
          : q,
      ),
    );
    setNewStep((prev) => ({ ...prev, [questId]: "" }));
  };

  const toggleStep = (questId: string, stepId: string) => {
    setQuests((prev) =>
      prev.map((q) =>
        q.id === questId
          ? {
              ...q,
              steps: q.steps.map((s) =>
                s.id === stepId ? { ...s, done: !s.done } : s,
              ),
            }
          : q,
      ),
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-pocket-muted">{quests.length} quests</p>
        <Button
          onClick={() => setAddOpen(true)}
          className="bg-pocket-burgundy text-pocket-cream hover:bg-pocket-burgundy/90"
        >
          <Plus size={14} className="mr-1" /> New Quest
        </Button>
      </div>

      {quests.length === 0 ? (
        <div className="pocket-card p-10 text-center">
          <p className="text-4xl mb-3">⚔️</p>
          <p className="text-pocket-muted italic">
            Great adventures await. Define your life quests!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {quests.map((quest) => {
            const done = quest.steps.filter((s) => s.done).length;
            const pct = quest.steps.length
              ? Math.round((done / quest.steps.length) * 100)
              : 0;
            return (
              <motion.div key={quest.id} layout className="pocket-card p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-display font-bold text-pocket-burgundy text-base">
                      {quest.title}
                    </h4>
                    {quest.description && (
                      <p className="text-xs text-pocket-muted">
                        {quest.description}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setQuests((prev) => prev.filter((q) => q.id !== quest.id))
                    }
                    className="text-pocket-muted hover:text-destructive"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                {quest.steps.length > 0 && (
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-pocket-muted mb-1">
                      <span>
                        {done}/{quest.steps.length} steps
                      </span>
                      <span>{pct}%</span>
                    </div>
                    <Progress value={pct} className="h-1.5 mb-2" />
                    <div className="space-y-1">
                      {quest.steps.map((step) => (
                        <div key={step.id} className="flex items-center gap-2">
                          <Checkbox
                            checked={step.done}
                            onCheckedChange={() =>
                              toggleStep(quest.id, step.id)
                            }
                            className="border-pocket-blush data-[state=checked]:bg-pocket-burgundy"
                          />
                          <span
                            className={`text-sm ${step.done ? "line-through text-pocket-muted" : "text-pocket-text"}`}
                          >
                            {step.text}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setQuests((prev) =>
                                prev.map((q) =>
                                  q.id === quest.id
                                    ? {
                                        ...q,
                                        steps: q.steps.filter(
                                          (s) => s.id !== step.id,
                                        ),
                                      }
                                    : q,
                                ),
                              )
                            }
                            className="text-pocket-muted hover:text-destructive ml-auto"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex gap-2 mt-2">
                  <Input
                    value={newStep[quest.id] || ""}
                    onChange={(e) =>
                      setNewStep((prev) => ({
                        ...prev,
                        [quest.id]: e.target.value,
                      }))
                    }
                    placeholder="Add a step..."
                    className="text-xs h-8"
                    onKeyDown={(e) => e.key === "Enter" && addStep(quest.id)}
                  />
                  <Button
                    size="sm"
                    onClick={() => addStep(quest.id)}
                    className="bg-pocket-burgundy text-pocket-cream hover:bg-pocket-burgundy/90 h-8"
                  >
                    <Plus size={12} />
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="bg-pocket-cream">
          <DialogHeader>
            <DialogTitle className="font-display text-pocket-burgundy">
              New Life Quest
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label
                htmlFor="quest-title"
                className="text-xs font-medium text-pocket-muted mb-1 block"
              >
                Quest Name
              </label>
              <Input
                id="quest-title"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="e.g. Become a published author"
              />
            </div>
            <div>
              <label
                htmlFor="quest-desc"
                className="text-xs font-medium text-pocket-muted mb-1 block"
              >
                Description
              </label>
              <Textarea
                id="quest-desc"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                rows={2}
              />
            </div>
            <Button
              onClick={addQuest}
              className="w-full bg-pocket-burgundy text-pocket-cream hover:bg-pocket-burgundy/90"
            >
              Create Quest
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Bucket List
function BucketListTab() {
  const [items, setItems] = useLocalStorage<BucketItem[]>(
    "pocket_bucketList",
    [],
  );
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    category: "",
    targetDate: "",
    notes: "",
  });

  const save = () => {
    if (!form.title.trim()) return;
    setItems((prev) => [{ id: genId(), ...form, completed: false }, ...prev]);
    setAddOpen(false);
    setForm({ title: "", category: "", targetDate: "", notes: "" });
    toast.success("Bucket list item added!");
  };

  const toggle = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item,
      ),
    );
  };

  const groups = items.reduce<Record<string, BucketItem[]>>((acc, item) => {
    const cat = item.category || "Other";
    acc[cat] = [...(acc[cat] || []), item];
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-pocket-muted">
          {items.length} items · {items.filter((i) => i.completed).length}{" "}
          completed
        </p>
        <Button
          onClick={() => setAddOpen(true)}
          className="bg-pocket-burgundy text-pocket-cream hover:bg-pocket-burgundy/90"
        >
          <Plus size={14} className="mr-1" /> Add Item
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="pocket-card p-10 text-center">
          <p className="text-4xl mb-3">🌍</p>
          <p className="text-pocket-muted italic">
            A life fully lived starts with a list of dreams.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groups).map(([cat, catItems]) => (
            <div key={cat}>
              <h3 className="font-display font-bold text-pocket-burgundy text-sm mb-2 flex items-center gap-2">
                {cat}{" "}
                <span className="text-pocket-muted font-normal text-xs">
                  ({catItems.filter((i) => !i.completed).length} remaining)
                </span>
              </h3>
              <div className="space-y-2">
                {catItems.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    className={`pocket-card p-3 flex items-start gap-3 ${item.completed ? "opacity-60" : ""}`}
                  >
                    <Checkbox
                      checked={item.completed}
                      onCheckedChange={() => toggle(item.id)}
                      className="mt-0.5 border-pocket-blush data-[state=checked]:bg-pocket-burgundy"
                    />
                    <div className="flex-1">
                      <p
                        className={`text-sm font-medium text-pocket-text ${item.completed ? "line-through" : ""}`}
                      >
                        {item.title}
                      </p>
                      {item.targetDate && (
                        <p className="text-xs text-pocket-muted">
                          Target: {item.targetDate}
                        </p>
                      )}
                      {item.notes && (
                        <p className="text-xs text-pocket-muted italic">
                          {item.notes}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setItems((prev) => prev.filter((x) => x.id !== item.id))
                      }
                      className="text-pocket-muted hover:text-destructive shrink-0"
                    >
                      <Trash2 size={13} />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="bg-pocket-cream">
          <DialogHeader>
            <DialogTitle className="font-display text-pocket-burgundy">
              Bucket List Item
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label
                htmlFor="bucket-title"
                className="text-xs font-medium text-pocket-muted mb-1 block"
              >
                What do you want to do?
              </label>
              <Input
                id="bucket-title"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="e.g. Watch the Northern Lights"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="bucket-cat"
                  className="text-xs font-medium text-pocket-muted mb-1 block"
                >
                  Category
                </label>
                <Input
                  id="bucket-cat"
                  value={form.category}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, category: e.target.value }))
                  }
                  placeholder="Travel, Experience..."
                />
              </div>
              <div>
                <label
                  htmlFor="bucket-date"
                  className="text-xs font-medium text-pocket-muted mb-1 block"
                >
                  Target Date
                </label>
                <Input
                  id="bucket-date"
                  type="date"
                  value={form.targetDate}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, targetDate: e.target.value }))
                  }
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="bucket-notes"
                className="text-xs font-medium text-pocket-muted mb-1 block"
              >
                Notes
              </label>
              <Textarea
                id="bucket-notes"
                value={form.notes}
                onChange={(e) =>
                  setForm((f) => ({ ...f, notes: e.target.value }))
                }
                rows={2}
              />
            </div>
            <Button
              onClick={save}
              className="w-full bg-pocket-burgundy text-pocket-cream hover:bg-pocket-burgundy/90"
            >
              Add
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Idea Vault
function IdeaVaultTab() {
  const [ideas, setIdeas] = useLocalStorage<Idea[]>("pocket_ideas", []);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    tags: "",
    status: "raw" as Idea["status"],
  });

  const save = () => {
    if (!form.title.trim()) return;
    const idea: Idea = {
      id: genId(),
      title: form.title,
      description: form.description,
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      status: form.status,
      createdAt: new Date().toISOString(),
    };
    setIdeas((prev) => [idea, ...prev]);
    setAddOpen(false);
    setForm({ title: "", description: "", tags: "", status: "raw" });
    toast.success("Idea captured! 💡");
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-pocket-muted">
          {ideas.length} ideas in the vault
        </p>
        <Button
          onClick={() => setAddOpen(true)}
          className="bg-pocket-burgundy text-pocket-cream hover:bg-pocket-burgundy/90"
        >
          <Plus size={14} className="mr-1" /> Capture Idea
        </Button>
      </div>

      {ideas.length === 0 ? (
        <div className="pocket-card p-10 text-center">
          <p className="text-4xl mb-3">💡</p>
          <p className="text-pocket-muted italic">
            Don't let ideas evaporate. Capture everything here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {ideas.map((idea) => (
              <motion.div
                key={idea.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="pocket-card p-4"
              >
                <div className="flex justify-between mb-2">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium ${STATUS_COLORS[idea.status]}`}
                  >
                    {idea.status}
                  </span>
                  <div className="flex gap-1">
                    <Select
                      value={idea.status}
                      onValueChange={(v) =>
                        setIdeas((prev) =>
                          prev.map((i) =>
                            i.id === idea.id
                              ? { ...i, status: v as Idea["status"] }
                              : i,
                          ),
                        )
                      }
                    >
                      <SelectTrigger className="h-6 w-24 text-xs border-none shadow-none">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(
                          [
                            "raw",
                            "developing",
                            "shelved",
                            "pursuing",
                          ] as Idea["status"][]
                        ).map((s) => (
                          <SelectItem
                            key={s}
                            value={s}
                            className="text-xs capitalize"
                          >
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <button
                      type="button"
                      onClick={() =>
                        setIdeas((prev) => prev.filter((i) => i.id !== idea.id))
                      }
                      className="text-pocket-muted hover:text-destructive"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                <h4 className="font-display font-bold text-pocket-burgundy text-sm mb-1">
                  {idea.title}
                </h4>
                {idea.description && (
                  <p className="text-xs text-pocket-text mb-2 line-clamp-3">
                    {idea.description}
                  </p>
                )}
                {idea.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {idea.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs bg-pocket-blush/30 text-pocket-burgundy px-2 py-0.5 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="bg-pocket-cream">
          <DialogHeader>
            <DialogTitle className="font-display text-pocket-burgundy">
              Capture Idea
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label
                htmlFor="idea-title"
                className="text-xs font-medium text-pocket-muted mb-1 block"
              >
                Idea
              </label>
              <Input
                id="idea-title"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="The idea in a few words"
              />
            </div>
            <div>
              <label
                htmlFor="idea-desc"
                className="text-xs font-medium text-pocket-muted mb-1 block"
              >
                Description
              </label>
              <Textarea
                id="idea-desc"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                rows={3}
                placeholder="Elaborate..."
              />
            </div>
            <div>
              <label
                htmlFor="idea-status"
                className="text-xs font-medium text-pocket-muted mb-1 block"
              >
                Status
              </label>
              <Select
                value={form.status}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, status: v as Idea["status"] }))
                }
              >
                <SelectTrigger id="idea-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(
                    [
                      "raw",
                      "developing",
                      "shelved",
                      "pursuing",
                    ] as Idea["status"][]
                  ).map((s) => (
                    <SelectItem key={s} value={s} className="capitalize">
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label
                htmlFor="idea-tags"
                className="text-xs font-medium text-pocket-muted mb-1 block"
              >
                Tags
              </label>
              <Input
                id="idea-tags"
                value={form.tags}
                onChange={(e) =>
                  setForm((f) => ({ ...f, tags: e.target.value }))
                }
                placeholder="startup, app, writing (comma separated)"
              />
            </div>
            <Button
              onClick={save}
              className="w-full bg-pocket-burgundy text-pocket-cream hover:bg-pocket-burgundy/90"
            >
              Capture Idea
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function Goals() {
  return (
    <div className="min-h-full p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-display font-bold text-pocket-burgundy">
          Goals
        </h1>
        <div className="h-0.5 w-16 bg-pocket-gold rounded-full mt-2" />
        <p className="text-pocket-muted mt-2 text-sm">
          Chart your vision and pursue it with purpose.
        </p>
      </div>
      <Tabs defaultValue="goals">
        <TabsList className="mb-6 bg-pocket-blush/20">
          <TabsTrigger
            value="goals"
            className="data-[state=active]:bg-pocket-burgundy data-[state=active]:text-pocket-cream"
          >
            Goals
          </TabsTrigger>
          <TabsTrigger
            value="quests"
            className="data-[state=active]:bg-pocket-burgundy data-[state=active]:text-pocket-cream"
          >
            Life Quests
          </TabsTrigger>
          <TabsTrigger
            value="bucket"
            className="data-[state=active]:bg-pocket-burgundy data-[state=active]:text-pocket-cream"
          >
            Bucket List
          </TabsTrigger>
          <TabsTrigger
            value="ideas"
            className="data-[state=active]:bg-pocket-burgundy data-[state=active]:text-pocket-cream"
          >
            Idea Vault
          </TabsTrigger>
        </TabsList>
        <TabsContent value="goals">
          <GoalsTab />
        </TabsContent>
        <TabsContent value="quests">
          <QuestsTab />
        </TabsContent>
        <TabsContent value="bucket">
          <BucketListTab />
        </TabsContent>
        <TabsContent value="ideas">
          <IdeaVaultTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
