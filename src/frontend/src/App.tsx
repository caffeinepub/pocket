import { Toaster } from "@/components/ui/sonner";
import { AnimatePresence, motion } from "@/lib/motion";
import {
  Archive as ArchiveIcon,
  BookOpen,
  Bookmark,
  Briefcase,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Heart,
  Home,
  RefreshCw,
  Target,
  User,
} from "lucide-react";
import { useState } from "react";
import Archive from "./sections/Archive";
import Dashboard from "./sections/Dashboard";
import Goals from "./sections/Goals";
import Habits from "./sections/Habits";
import Knowledge from "./sections/Knowledge";
import Life from "./sections/Life";
import Opportunities from "./sections/Opportunities";
import Profile from "./sections/Profile";
import Reading from "./sections/Reading";
import Tasks from "./sections/Tasks";

export type Section =
  | "dashboard"
  | "knowledge"
  | "tasks"
  | "habits"
  | "reading"
  | "life"
  | "goals"
  | "opportunities"
  | "archive"
  | "profile";

const navItems: { id: Section; label: string; icon: React.ReactNode }[] = [
  { id: "dashboard", label: "Dashboard", icon: <Home size={18} /> },
  { id: "knowledge", label: "Knowledge", icon: <BookOpen size={18} /> },
  { id: "tasks", label: "Tasks", icon: <CheckSquare size={18} /> },
  { id: "habits", label: "Habits", icon: <RefreshCw size={18} /> },
  { id: "reading", label: "Reading", icon: <Bookmark size={18} /> },
  { id: "life", label: "Life", icon: <Heart size={18} /> },
  { id: "goals", label: "Goals", icon: <Target size={18} /> },
  {
    id: "opportunities",
    label: "Opportunities",
    icon: <Briefcase size={18} />,
  },
  { id: "archive", label: "Archive", icon: <ArchiveIcon size={18} /> },
  { id: "profile", label: "Profile", icon: <User size={18} /> },
];

const sectionComponents: Record<Section, React.ReactNode> = {
  dashboard: <Dashboard />,
  knowledge: <Knowledge />,
  tasks: <Tasks />,
  habits: <Habits />,
  reading: <Reading />,
  life: <Life />,
  goals: <Goals />,
  opportunities: <Opportunities />,
  archive: <Archive />,
  profile: <Profile />,
};

export default function App() {
  const [activeSection, setActiveSection] = useState<Section>("dashboard");
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 64 : 220 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="shrink-0 h-full flex flex-col overflow-hidden"
        style={{
          background: "oklch(0.28 0.10 15)",
          borderRight: "1px solid oklch(0.35 0.08 15)",
        }}
      >
        {/* Logo area */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-[oklch(0.35_0.08_15)]">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "oklch(0.72 0.09 80)" }}
          >
            <span className="text-[oklch(0.22_0.04_30)] font-bold text-sm font-display">
              P
            </span>
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="text-[oklch(0.93_0.018_60)] font-display text-xl font-bold tracking-wide whitespace-nowrap overflow-hidden"
              >
                Pocket
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-3 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 transition-all duration-150 relative group ${
                activeSection === item.id
                  ? "text-[oklch(0.93_0.018_60)]"
                  : "text-[oklch(0.72_0.04_15)] hover:text-[oklch(0.93_0.018_60)]"
              }`}
              title={collapsed ? item.label : undefined}
              type="button"
            >
              {/* Active indicator */}
              {activeSection === item.id && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute inset-0 rounded-lg mx-2"
                  style={{ background: "oklch(0.37 0.13 15)" }}
                  transition={{ duration: 0.2 }}
                />
              )}
              <span className="relative z-10 shrink-0">{item.icon}</span>
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="relative z-10 text-sm font-medium whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {/* Active gold dot */}
              {activeSection === item.id && (
                <motion.div
                  className="absolute right-3 w-1.5 h-1.5 rounded-full"
                  style={{ background: "oklch(0.72 0.09 80)" }}
                />
              )}
            </button>
          ))}
        </nav>

        {/* Collapse button */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          type="button"
          className="flex items-center justify-center p-3 border-t border-[oklch(0.35_0.08_15)] text-[oklch(0.72_0.04_15)] hover:text-[oklch(0.93_0.018_60)] transition-colors"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </motion.aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto h-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="h-full"
          >
            {sectionComponents[activeSection]}
          </motion.div>
        </AnimatePresence>
      </main>

      <Toaster position="bottom-right" />
    </div>
  );
}
