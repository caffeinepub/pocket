import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import {
  Award,
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  FileText,
  Info,
  Loader2,
  Mail,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  Users,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useLocalStorage } from "../hooks/useLocalStorage";
import {
  type ColdEmail,
  type Opportunity,
  type Professional,
  type Scholarship,
  genId,
  today,
} from "../types/pocket";

// ===== OPENAI FALLBACK =====

// ── Opportunities (Kanban) ─────────────────────────────────────────────────────
function OpportunitiesTab() {
  const [opps, setOpps] = useLocalStorage<Opportunity[]>(
    "pocket_opportunities",
    [],
  );
  const [addOpen, setAddOpen] = useState(false);
  const [editOpp, setEditOpp] = useState<Opportunity | null>(null);
  const [form, setForm] = useState({
    title: "",
    source: "",
    status: "active" as Opportunity["status"],
    notes: "",
    deadline: "",
  });

  const save = () => {
    if (!form.title.trim()) return;
    if (editOpp) {
      setOpps((prev) =>
        prev.map((o) => (o.id === editOpp.id ? { ...o, ...form } : o)),
      );
      setEditOpp(null);
      toast.success("Updated!");
    } else {
      setOpps((prev) => [{ id: genId(), ...form }, ...prev]);
      setAddOpen(false);
      toast.success("Opportunity added!");
    }
    setForm({
      title: "",
      source: "",
      status: "active",
      notes: "",
      deadline: "",
    });
  };

  const COLUMNS: { id: Opportunity["status"]; label: string; color: string }[] =
    [
      { id: "active", label: "Active", color: "bg-blue-50 border-blue-200" },
      {
        id: "applied",
        label: "Applied",
        color: "bg-yellow-50 border-yellow-200",
      },
      { id: "passed", label: "Passed", color: "bg-green-50 border-green-200" },
      { id: "closed", label: "Closed", color: "bg-gray-50 border-gray-200" },
    ];

  const formContent = (
    <div className="space-y-3">
      <div>
        <label
          htmlFor="opp-title"
          className="text-xs font-medium text-pocket-muted mb-1 block"
        >
          Title *
        </label>
        <Input
          id="opp-title"
          data-ocid="opportunity.input"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          placeholder="Opportunity title"
        />
      </div>
      <div>
        <label
          htmlFor="opp-source"
          className="text-xs font-medium text-pocket-muted mb-1 block"
        >
          Source
        </label>
        <Input
          id="opp-source"
          value={form.source}
          onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))}
          placeholder="Where did you find it?"
        />
      </div>
      <div>
        <label
          htmlFor="opp-status"
          className="text-xs font-medium text-pocket-muted mb-1 block"
        >
          Status
        </label>
        <Select
          value={form.status}
          onValueChange={(v) =>
            setForm((f) => ({ ...f, status: v as Opportunity["status"] }))
          }
        >
          <SelectTrigger id="opp-status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="applied">Applied</SelectItem>
            <SelectItem value="passed">Passed</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <label
          htmlFor="opp-deadline"
          className="text-xs font-medium text-pocket-muted mb-1 block"
        >
          Deadline
        </label>
        <Input
          id="opp-deadline"
          type="date"
          value={form.deadline}
          onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))}
        />
      </div>
      <div>
        <label
          htmlFor="opp-notes"
          className="text-xs font-medium text-pocket-muted mb-1 block"
        >
          Notes
        </label>
        <Textarea
          id="opp-notes"
          value={form.notes}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          rows={2}
        />
      </div>
      <Button
        data-ocid="opportunity.submit_button"
        onClick={save}
        className="w-full bg-pocket-burgundy text-pocket-cream hover:bg-pocket-burgundy/90"
      >
        {editOpp ? "Update" : "Add"}
      </Button>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-pocket-muted">
          {opps.length} opportunities tracked
        </p>
        <Button
          data-ocid="opportunity.primary_button"
          onClick={() => setAddOpen(true)}
          className="bg-pocket-burgundy text-pocket-cream hover:bg-pocket-burgundy/90"
        >
          <Plus size={14} className="mr-1" /> Add
        </Button>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto">
        {COLUMNS.map((col) => {
          const items = opps.filter((o) => o.status === col.id);
          return (
            <div
              key={col.id}
              className={`kanban-col border-2 p-3 ${col.color}`}
            >
              <h4 className="text-xs font-bold text-pocket-burgundy mb-3 uppercase tracking-wide">
                {col.label} ({items.length})
              </h4>
              <AnimatePresence>
                {items.map((opp) => (
                  <motion.div
                    key={opp.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white rounded-xl p-3 mb-2 shadow-xs"
                  >
                    <p className="text-xs font-medium text-pocket-text mb-1">
                      {opp.title}
                    </p>
                    {opp.source && (
                      <p className="text-xs text-pocket-muted">{opp.source}</p>
                    )}
                    {opp.deadline && (
                      <p className="text-xs text-pocket-muted">
                        📅 {opp.deadline}
                      </p>
                    )}
                    <div className="flex gap-1 mt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setForm({
                            title: opp.title,
                            source: opp.source,
                            status: opp.status,
                            notes: opp.notes,
                            deadline: opp.deadline,
                          });
                          setEditOpp(opp);
                        }}
                        className="text-pocket-muted hover:text-pocket-burgundy"
                      >
                        <Pencil size={11} />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setOpps((prev) => prev.filter((x) => x.id !== opp.id))
                        }
                        className="text-pocket-muted hover:text-destructive"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {items.length === 0 && (
                <p className="text-xs text-pocket-muted/50 italic text-center py-4">
                  Empty
                </p>
              )}
            </div>
          );
        })}
      </div>
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="bg-pocket-cream">
          <DialogHeader>
            <DialogTitle className="font-display text-pocket-burgundy">
              Add Opportunity
            </DialogTitle>
          </DialogHeader>
          {formContent}
        </DialogContent>
      </Dialog>
      <Dialog open={!!editOpp} onOpenChange={(o) => !o && setEditOpp(null)}>
        <DialogContent className="bg-pocket-cream">
          <DialogHeader>
            <DialogTitle className="font-display text-pocket-burgundy">
              Edit Opportunity
            </DialogTitle>
          </DialogHeader>
          {formContent}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Scholarships ───────────────────────────────────────────────────────────────
function ScholarshipsTab() {
  const [scholarships, setScholarships] = useLocalStorage<Scholarship[]>(
    "pocket_scholarships",
    [],
  );
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    amount: "",
    deadline: "",
    requirements: "",
    status: "researching" as Scholarship["status"],
    notes: "",
  });

  const save = () => {
    if (!form.name.trim()) return;
    setScholarships((prev) => [{ id: genId(), ...form }, ...prev]);
    setAddOpen(false);
    setForm({
      name: "",
      amount: "",
      deadline: "",
      requirements: "",
      status: "researching",
      notes: "",
    });
    toast.success("Scholarship added!");
  };

  const STATUS_BADGE: Record<Scholarship["status"], string> = {
    researching: "bg-blue-100 text-blue-700",
    applied: "bg-yellow-100 text-yellow-700",
    awarded: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <p className="text-sm text-pocket-muted">
          {scholarships.length} scholarships tracked
        </p>
        <div className="flex gap-2">
          <Button
            data-ocid="scholarship.secondary_button"
            onClick={() => setAddOpen(true)}
            className="bg-pocket-burgundy text-pocket-cream hover:bg-pocket-burgundy/90"
          >
            <Plus size={14} className="mr-1" /> Add
          </Button>
        </div>
      </div>

      {scholarships.length === 0 ? (
        <div
          className="pocket-card p-10 text-center"
          data-ocid="scholarship.empty_state"
        >
          <p className="text-4xl mb-3">🎓</p>
          <p className="text-pocket-muted italic">
            Invest in your education. Track your scholarships here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {scholarships.map((s) => (
            <motion.div key={s.id} layout className="pocket-card p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-display font-bold text-pocket-burgundy text-sm">
                    {s.name}
                  </h4>
                  {s.amount && (
                    <p className="text-sm text-pocket-gold font-bold">
                      {s.amount}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full capitalize ${STATUS_BADGE[s.status]}`}
                  >
                    {s.status}
                  </span>
                  <Select
                    value={s.status}
                    onValueChange={(v) =>
                      setScholarships((prev) =>
                        prev.map((x) =>
                          x.id === s.id
                            ? { ...x, status: v as Scholarship["status"] }
                            : x,
                        ),
                      )
                    }
                  >
                    <SelectTrigger className="h-6 w-8 border-none shadow-none p-0 text-pocket-muted">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(
                        [
                          "researching",
                          "applied",
                          "awarded",
                          "rejected",
                        ] as Scholarship["status"][]
                      ).map((st) => (
                        <SelectItem
                          key={st}
                          value={st}
                          className="capitalize text-xs"
                        >
                          {st}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <button
                    type="button"
                    onClick={() =>
                      setScholarships((prev) =>
                        prev.filter((x) => x.id !== s.id),
                      )
                    }
                    className="text-pocket-muted hover:text-destructive"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              <div className="text-xs text-pocket-muted grid grid-cols-2 gap-2">
                {s.deadline && <span>📅 Deadline: {s.deadline}</span>}
                {s.requirements && <span>📋 {s.requirements}</span>}
              </div>
              {s.notes && (
                <p className="text-xs text-pocket-text mt-1 italic">
                  {s.notes}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Scholarship Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="bg-pocket-cream">
          <DialogHeader>
            <DialogTitle className="font-display text-pocket-burgundy">
              Add Scholarship
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label
                htmlFor="sch-name"
                className="text-xs font-medium text-pocket-muted mb-1 block"
              >
                Name
              </label>
              <Input
                id="sch-name"
                data-ocid="scholarship.input"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="sch-amount"
                  className="text-xs font-medium text-pocket-muted mb-1 block"
                >
                  Amount
                </label>
                <Input
                  id="sch-amount"
                  value={form.amount}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, amount: e.target.value }))
                  }
                  placeholder="$5,000"
                />
              </div>
              <div>
                <label
                  htmlFor="sch-deadline"
                  className="text-xs font-medium text-pocket-muted mb-1 block"
                >
                  Deadline
                </label>
                <Input
                  id="sch-deadline"
                  type="date"
                  value={form.deadline}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, deadline: e.target.value }))
                  }
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="sch-req"
                className="text-xs font-medium text-pocket-muted mb-1 block"
              >
                Requirements
              </label>
              <Input
                id="sch-req"
                value={form.requirements}
                onChange={(e) =>
                  setForm((f) => ({ ...f, requirements: e.target.value }))
                }
                placeholder="GPA, essay, etc."
              />
            </div>
            <div>
              <label
                htmlFor="sch-status"
                className="text-xs font-medium text-pocket-muted mb-1 block"
              >
                Status
              </label>
              <Select
                value={form.status}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, status: v as Scholarship["status"] }))
                }
              >
                <SelectTrigger id="sch-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(
                    [
                      "researching",
                      "applied",
                      "awarded",
                      "rejected",
                    ] as Scholarship["status"][]
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
                htmlFor="sch-notes"
                className="text-xs font-medium text-pocket-muted mb-1 block"
              >
                Notes
              </label>
              <Textarea
                id="sch-notes"
                value={form.notes}
                onChange={(e) =>
                  setForm((f) => ({ ...f, notes: e.target.value }))
                }
                rows={2}
              />
            </div>
            <Button
              data-ocid="scholarship.submit_button"
              onClick={save}
              className="w-full bg-pocket-burgundy text-pocket-cream hover:bg-pocket-burgundy/90"
            >
              Add Scholarship
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Cold Emails ────────────────────────────────────────────────────────────────
function ColdEmailsTab() {
  const [emails, setEmails] = useLocalStorage<ColdEmail[]>(
    "pocket_coldEmails",
    [],
  );
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({
    contactName: "",
    company: "",
    sentDate: today(),
    subject: "",
    status: "sent" as ColdEmail["status"],
    notes: "",
  });

  const save = () => {
    if (!form.contactName.trim()) return;
    setEmails((prev) => [{ id: genId(), ...form }, ...prev]);
    setAddOpen(false);
    setForm({
      contactName: "",
      company: "",
      sentDate: today(),
      subject: "",
      status: "sent",
      notes: "",
    });
    toast.success("Email logged!");
  };

  const STATUS_BADGE: Record<ColdEmail["status"], string> = {
    sent: "bg-blue-100 text-blue-700",
    replied: "bg-green-100 text-green-700",
    "follow-up": "bg-yellow-100 text-yellow-700",
    closed: "bg-gray-100 text-gray-700",
  };

  const STATUS_LABELS: Record<ColdEmail["status"], string> = {
    sent: "Sent",
    replied: "Replied!",
    "follow-up": "Follow-Up",
    closed: "Closed",
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <p className="text-sm text-pocket-muted">
          {emails.length} emails ·{" "}
          {emails.filter((e) => e.status === "replied").length} replied
        </p>
        <div className="flex gap-2">
          <Button
            data-ocid="email.secondary_button"
            onClick={() => setAddOpen(true)}
            className="bg-pocket-burgundy text-pocket-cream hover:bg-pocket-burgundy/90"
          >
            <Plus size={14} className="mr-1" /> Log Email
          </Button>
        </div>
      </div>

      {emails.length === 0 ? (
        <div
          className="pocket-card p-10 text-center"
          data-ocid="email.empty_state"
        >
          <p className="text-4xl mb-3">📧</p>
          <p className="text-pocket-muted italic">
            Track your outreach. Every "no" gets you closer to "yes."
          </p>
        </div>
      ) : (
        <div className="pocket-card p-4 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-pocket-muted border-b border-pocket-blush/30">
                <th className="text-left pb-2 pr-4">Contact</th>
                <th className="text-left pb-2 pr-4">Company</th>
                <th className="text-left pb-2 pr-4">Subject</th>
                <th className="text-left pb-2 pr-4">Date</th>
                <th className="text-left pb-2 pr-4">Status</th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody>
              {emails.map((e) => (
                <tr
                  key={e.id}
                  className="border-b border-pocket-blush/10 hover:bg-pocket-blush/5"
                >
                  <td className="py-2 pr-4 font-medium text-pocket-text">
                    {e.contactName}
                  </td>
                  <td className="py-2 pr-4 text-pocket-muted">{e.company}</td>
                  <td className="py-2 pr-4 text-pocket-muted max-w-32 truncate">
                    {e.subject}
                  </td>
                  <td className="py-2 pr-4 text-pocket-muted">{e.sentDate}</td>
                  <td className="py-2 pr-4">
                    <Select
                      value={e.status}
                      onValueChange={(v) =>
                        setEmails((prev) =>
                          prev.map((x) =>
                            x.id === e.id
                              ? { ...x, status: v as ColdEmail["status"] }
                              : x,
                          ),
                        )
                      }
                    >
                      <SelectTrigger
                        className={`h-6 text-xs px-2 border-none rounded-full ${STATUS_BADGE[e.status]}`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(
                          [
                            "sent",
                            "replied",
                            "follow-up",
                            "closed",
                          ] as ColdEmail["status"][]
                        ).map((s) => (
                          <SelectItem key={s} value={s} className="text-xs">
                            {STATUS_LABELS[s]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="py-2">
                    <button
                      type="button"
                      onClick={() =>
                        setEmails((prev) => prev.filter((x) => x.id !== e.id))
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
      )}

      {/* Log Email Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="bg-pocket-cream">
          <DialogHeader>
            <DialogTitle className="font-display text-pocket-burgundy">
              Log Cold Email
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="em-name"
                  className="text-xs font-medium text-pocket-muted mb-1 block"
                >
                  Contact Name
                </label>
                <Input
                  id="em-name"
                  data-ocid="email.input"
                  value={form.contactName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, contactName: e.target.value }))
                  }
                />
              </div>
              <div>
                <label
                  htmlFor="em-company"
                  className="text-xs font-medium text-pocket-muted mb-1 block"
                >
                  Company
                </label>
                <Input
                  id="em-company"
                  value={form.company}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, company: e.target.value }))
                  }
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="em-subject"
                className="text-xs font-medium text-pocket-muted mb-1 block"
              >
                Subject
              </label>
              <Input
                id="em-subject"
                value={form.subject}
                onChange={(e) =>
                  setForm((f) => ({ ...f, subject: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="em-date"
                  className="text-xs font-medium text-pocket-muted mb-1 block"
                >
                  Date Sent
                </label>
                <Input
                  id="em-date"
                  type="date"
                  value={form.sentDate}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, sentDate: e.target.value }))
                  }
                />
              </div>
              <div>
                <label
                  htmlFor="em-status"
                  className="text-xs font-medium text-pocket-muted mb-1 block"
                >
                  Status
                </label>
                <Select
                  value={form.status}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, status: v as ColdEmail["status"] }))
                  }
                >
                  <SelectTrigger id="em-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(
                      [
                        "sent",
                        "replied",
                        "follow-up",
                        "closed",
                      ] as ColdEmail["status"][]
                    ).map((s) => (
                      <SelectItem key={s} value={s} className="capitalize">
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label
                htmlFor="em-notes"
                className="text-xs font-medium text-pocket-muted mb-1 block"
              >
                Notes
              </label>
              <Textarea
                id="em-notes"
                value={form.notes}
                onChange={(e) =>
                  setForm((f) => ({ ...f, notes: e.target.value }))
                }
                rows={2}
              />
            </div>
            <Button
              data-ocid="email.submit_button"
              onClick={save}
              className="w-full bg-pocket-burgundy text-pocket-cream hover:bg-pocket-burgundy/90"
            >
              Log Email
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Professional Network ───────────────────────────────────────────────────────
function NetworkTab() {
  const [pros, setPros] = useLocalStorage<Professional[]>(
    "pocket_professionals",
    [],
  );
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    role: "",
    company: "",
    whereMet: "",
    date: today(),
    notes: "",
    followUpDate: "",
  });

  const save = () => {
    if (!form.name.trim()) return;
    setPros((prev) => [{ id: genId(), ...form }, ...prev]);
    setAddOpen(false);
    setForm({
      name: "",
      role: "",
      company: "",
      whereMet: "",
      date: today(),
      notes: "",
      followUpDate: "",
    });
    toast.success("Contact added!");
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-pocket-muted">
          {pros.length} professional contacts
        </p>
        <Button
          data-ocid="network.primary_button"
          onClick={() => setAddOpen(true)}
          className="bg-pocket-burgundy text-pocket-cream hover:bg-pocket-burgundy/90"
        >
          <Plus size={14} className="mr-1" /> Add Contact
        </Button>
      </div>
      {pros.length === 0 ? (
        <div
          className="pocket-card p-10 text-center"
          data-ocid="network.empty_state"
        >
          <p className="text-4xl mb-3">🤝</p>
          <p className="text-pocket-muted italic">
            Your network is your net worth. Start tracking!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {pros.map((pro) => (
              <motion.div
                key={pro.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="pocket-card p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center font-display font-bold text-lg bg-pocket-burgundy text-pocket-cream">
                    {pro.name[0]}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setPros((prev) => prev.filter((p) => p.id !== pro.id))
                    }
                    className="text-pocket-muted hover:text-destructive"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
                <h4 className="font-display font-bold text-pocket-burgundy text-sm">
                  {pro.name}
                </h4>
                {pro.role && (
                  <p className="text-xs text-pocket-muted">
                    {pro.role}
                    {pro.company ? ` @ ${pro.company}` : ""}
                  </p>
                )}
                {pro.whereMet && (
                  <p className="text-xs text-pocket-muted mt-1">
                    Met: {pro.whereMet} · {pro.date}
                  </p>
                )}
                {pro.followUpDate && (
                  <p className="text-xs text-pocket-gold mt-0.5">
                    ⏰ Follow up: {pro.followUpDate}
                  </p>
                )}
                {pro.notes && (
                  <p className="text-xs text-pocket-text mt-1 italic line-clamp-2">
                    {pro.notes}
                  </p>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="bg-pocket-cream max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-pocket-burgundy">
              Add Professional Contact
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label
                htmlFor="pro-name"
                className="text-xs font-medium text-pocket-muted mb-1 block"
              >
                Name *
              </label>
              <Input
                id="pro-name"
                data-ocid="network.input"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="pro-role"
                  className="text-xs font-medium text-pocket-muted mb-1 block"
                >
                  Role
                </label>
                <Input
                  id="pro-role"
                  value={form.role}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, role: e.target.value }))
                  }
                  placeholder="CEO, Engineer..."
                />
              </div>
              <div>
                <label
                  htmlFor="pro-company"
                  className="text-xs font-medium text-pocket-muted mb-1 block"
                >
                  Company
                </label>
                <Input
                  id="pro-company"
                  value={form.company}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, company: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="pro-where"
                  className="text-xs font-medium text-pocket-muted mb-1 block"
                >
                  Where Met
                </label>
                <Input
                  id="pro-where"
                  value={form.whereMet}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, whereMet: e.target.value }))
                  }
                  placeholder="Conference, LinkedIn..."
                />
              </div>
              <div>
                <label
                  htmlFor="pro-date"
                  className="text-xs font-medium text-pocket-muted mb-1 block"
                >
                  Date
                </label>
                <Input
                  id="pro-date"
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
                htmlFor="pro-followup"
                className="text-xs font-medium text-pocket-muted mb-1 block"
              >
                Follow-up Date
              </label>
              <Input
                id="pro-followup"
                type="date"
                value={form.followUpDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, followUpDate: e.target.value }))
                }
              />
            </div>
            <div>
              <label
                htmlFor="pro-notes"
                className="text-xs font-medium text-pocket-muted mb-1 block"
              >
                Notes
              </label>
              <Textarea
                id="pro-notes"
                value={form.notes}
                onChange={(e) =>
                  setForm((f) => ({ ...f, notes: e.target.value }))
                }
                rows={2}
              />
            </div>
            <Button
              data-ocid="network.submit_button"
              onClick={save}
              className="w-full bg-pocket-burgundy text-pocket-cream hover:bg-pocket-burgundy/90"
            >
              Add Contact
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Main Export ────────────────────────────────────────────────────────────────
export default function Opportunities() {
  return (
    <div className="min-h-full p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-display font-bold text-pocket-burgundy">
          Opportunities
        </h1>
        <div className="h-0.5 w-16 bg-pocket-gold rounded-full mt-2" />
        <p className="text-pocket-muted mt-2 text-sm">
          Track every opportunity you're pursuing.
        </p>
      </div>
      <Tabs defaultValue="opportunities">
        <TabsList className="mb-6 bg-pocket-blush/20">
          <TabsTrigger
            value="opportunities"
            className="data-[state=active]:bg-pocket-burgundy data-[state=active]:text-pocket-cream"
            data-ocid="opportunities.opportunities.tab"
          >
            <Zap size={13} className="mr-1" />
            Opportunities
          </TabsTrigger>
          <TabsTrigger
            value="scholarships"
            className="data-[state=active]:bg-pocket-burgundy data-[state=active]:text-pocket-cream"
            data-ocid="opportunities.scholarships.tab"
          >
            <Award size={13} className="mr-1" />
            Scholarships
          </TabsTrigger>
          <TabsTrigger
            value="emails"
            className="data-[state=active]:bg-pocket-burgundy data-[state=active]:text-pocket-cream"
            data-ocid="opportunities.emails.tab"
          >
            <Mail size={13} className="mr-1" />
            Cold Emails
          </TabsTrigger>
          <TabsTrigger
            value="network"
            className="data-[state=active]:bg-pocket-burgundy data-[state=active]:text-pocket-cream"
            data-ocid="opportunities.network.tab"
          >
            <Users size={13} className="mr-1" />
            Network
          </TabsTrigger>
        </TabsList>
        <TabsContent value="opportunities">
          <OpportunitiesTab />
        </TabsContent>
        <TabsContent value="scholarships">
          <ScholarshipsTab />
        </TabsContent>
        <TabsContent value="emails">
          <ColdEmailsTab />
        </TabsContent>
        <TabsContent value="network">
          <NetworkTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
