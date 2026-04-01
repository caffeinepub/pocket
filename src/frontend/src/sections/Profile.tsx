import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "@/lib/motion";
import {
  BookOpen,
  CheckSquare,
  Feather,
  Heart,
  Pencil,
  Target,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLocalStorage } from "../hooks/useLocalStorage";
import type {
  Book,
  Goal,
  Habit,
  Poem,
  Profile as ProfileType,
  Task,
} from "../types/pocket";

export default function Profile() {
  const [profile, setProfile] = useLocalStorage<ProfileType>("pocket_profile", {
    displayName: "My Pocket",
    bio: "This is my personal digital brain — a place for everything I think, dream, and track.",
  });
  const [tasks] = useLocalStorage<Task[]>("pocket_tasks", []);
  const [habits] = useLocalStorage<Habit[]>("pocket_habits", []);
  const [books] = useLocalStorage<Book[]>("pocket_books", []);
  const [goals] = useLocalStorage<Goal[]>("pocket_goals", []);
  const [poems] = useLocalStorage<Poem[]>("pocket_poems", []);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...profile });

  const save = () => {
    setProfile(form);
    setEditing(false);
    toast.success("Profile updated!");
  };

  const stats = [
    {
      label: "Tasks Created",
      value: tasks.length,
      icon: <CheckSquare size={18} />,
      color: "text-pocket-burgundy",
      bg: "bg-pocket-blush/20",
    },
    {
      label: "Habits Tracked",
      value: habits.length,
      icon: <Heart size={18} />,
      color: "text-green-700",
      bg: "bg-green-50",
    },
    {
      label: "Books Added",
      value: books.length,
      icon: <BookOpen size={18} />,
      color: "text-blue-700",
      bg: "bg-blue-50",
    },
    {
      label: "Goals Set",
      value: goals.length,
      icon: <Target size={18} />,
      color: "text-purple-700",
      bg: "bg-purple-50",
    },
    {
      label: "Goals Completed",
      value: goals.filter((g) => g.status === "completed").length,
      icon: <Target size={18} />,
      color: "text-pocket-gold",
      bg: "bg-[oklch(0.95_0.04_80)]",
    },
    {
      label: "Poems Written",
      value: poems.length,
      icon: <Feather size={18} />,
      color: "text-pink-700",
      bg: "bg-pink-50",
    },
  ];

  return (
    <div className="min-h-full p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-display font-bold text-pocket-burgundy">
          Profile
        </h1>
        <div className="h-0.5 w-16 bg-pocket-gold rounded-full mt-2" />
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Profile card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="pocket-card p-6"
        >
          {editing ? (
            <div className="space-y-3">
              <div>
                <label
                  htmlFor="profile-name"
                  className="text-xs font-medium text-pocket-muted mb-1 block"
                >
                  Display Name
                </label>
                <Input
                  id="profile-name"
                  data-ocid="profile.input"
                  value={form.displayName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, displayName: e.target.value }))
                  }
                  placeholder="Your name"
                />
              </div>
              <div>
                <label
                  htmlFor="profile-bio"
                  className="text-xs font-medium text-pocket-muted mb-1 block"
                >
                  Bio
                </label>
                <Textarea
                  id="profile-bio"
                  data-ocid="profile.textarea"
                  value={form.bio}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, bio: e.target.value }))
                  }
                  rows={3}
                  placeholder="A few words about yourself..."
                />
              </div>
              <div className="flex gap-2">
                <Button
                  data-ocid="profile.save_button"
                  onClick={save}
                  className="bg-pocket-burgundy text-pocket-cream hover:bg-pocket-burgundy/90"
                >
                  Save
                </Button>
                <Button
                  data-ocid="profile.cancel_button"
                  variant="outline"
                  onClick={() => {
                    setEditing(false);
                    setForm({ ...profile });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center font-display font-bold text-2xl"
                    style={{
                      background: "oklch(0.37 0.13 15)",
                      color: "oklch(0.93 0.018 60)",
                    }}
                  >
                    {profile.displayName?.[0] ?? "P"}
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-pocket-burgundy text-xl">
                      {profile.displayName}
                    </h2>
                    <p className="text-pocket-muted text-sm mt-1 max-w-sm">
                      {profile.bio}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  data-ocid="profile.edit_button"
                  onClick={() => setEditing(true)}
                  className="text-pocket-muted hover:text-pocket-burgundy"
                >
                  <Pencil size={16} />
                </button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="font-display font-bold text-pocket-burgundy text-base mb-3 pocket-section-header">
            Your Pocket Stats
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className={`${stat.bg} rounded-2xl p-4 flex items-center gap-3`}
              >
                <div className={stat.color}>{stat.icon}</div>
                <div>
                  <p className={`text-xl font-display font-bold ${stat.color}`}>
                    {stat.value}
                  </p>
                  <p className="text-xs text-pocket-muted">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* About Pocket */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="pocket-card p-6"
        >
          <h3 className="font-display font-bold text-pocket-burgundy text-base mb-3">
            About Pocket ✦
          </h3>
          <p className="text-sm text-pocket-text leading-relaxed font-crimson italic">
            Pocket is your personal museum, luxury journal, and digital brain —
            all in one. It's a space for tracking habits, goals, memories, and
            ideas. A place to celebrate wins, learn from failures, and dream
            big. Everything important to you, beautifully organized and always
            within reach.
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            {["Knowledge", "Growth", "Reflection"].map((value) => (
              <div key={value} className="bg-pocket-blush/20 rounded-xl py-2">
                <p className="text-xs font-medium text-pocket-burgundy">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
