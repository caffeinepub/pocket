import { Badge } from "@/components/ui/badge";
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
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  ExternalLink,
  FileText,
  Link,
  Loader2,
  Pencil,
  Plus,
  QrCode,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { useLocalStorage } from "../hooks/useLocalStorage";
import {
  type Bookmark,
  type Citation,
  type Flashcard,
  type FlashcardDeck,
  genId,
} from "../types/pocket";

// ===== OPENAI HELPERS =====
const OPENAI_API_KEY = "OPENAI_API_KEY";

async function callOpenAI(
  messages: { role: string; content: unknown }[],
  model = "gpt-4o-mini",
): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({ model, messages, max_tokens: 4096 }),
  });
  if (!res.ok) throw new Error(`OpenAI error: ${res.status}`);
  const data = await res.json();
  return data.choices[0].message.content as string;
}

function parseJsonFromAI(text: string): unknown {
  // Strip markdown code blocks if present
  const cleaned = text
    .replace(/```(?:json)?\s*/g, "")
    .replace(/```\s*/g, "")
    .trim();
  return JSON.parse(cleaned);
}

// ===== CITATION GENERATOR =====
function generateCitation(
  c: Omit<Citation, "id" | "generated" | "createdAt">,
): string {
  const authorFormatted = c.author || "Unknown Author";
  const yr = c.year || "n.d.";
  const title = c.title || "Untitled";
  const pub = c.publisher || "";
  const url = c.url || "";

  if (c.style === "apa") {
    // APA 7th edition
    if (c.sourceType === "website") {
      return `${authorFormatted}. (${yr}). *${title}*. ${pub}.${url ? ` ${url}` : ""}`;
    }
    if (c.sourceType === "journal") {
      const vol = (c as any).volume || "";
      const issue = (c as any).issue || "";
      const pages = (c as any).pages || "";
      const volIssue = vol ? (issue ? `${vol}(${issue})` : vol) : "";
      return `${authorFormatted}. (${yr}). ${title}. *${pub}*${volIssue ? `, ${volIssue}` : ""}${pages ? `, ${pages}` : ""}.${url ? ` ${url}` : ""}`;
    }
    if (c.sourceType === "book") {
      return `${authorFormatted}. (${yr}). *${title}*. ${pub}.`;
    }
    return `${authorFormatted}. (${yr}). *${title}*. ${pub}.`;
  }
  if (c.style === "mla") {
    // MLA 9th edition
    if (c.sourceType === "website") {
      return `${authorFormatted}. "${title}." *${pub}*${url ? `, ${url}` : ""}.`;
    }
    if (c.sourceType === "journal") {
      const vol = (c as any).volume || "";
      const issue = (c as any).issue || "";
      const pages = (c as any).pages || "";
      return `${authorFormatted}. "${title}." *${pub}*${vol ? `, vol. ${vol}` : ""}${issue ? `, no. ${issue}` : ""}, ${yr}${pages ? `, pp. ${pages}` : ""}${url ? `, ${url}` : ""}.`;
    }
    if (c.sourceType === "book") {
      return `${authorFormatted}. *${title}*. ${pub}, ${yr}.`;
    }
    return `${authorFormatted}. "${title}." *${pub}*, ${yr}${url ? `, ${url}` : ""}.`;
  }
  if (c.style === "chicago") {
    // Chicago 17th edition
    if (c.sourceType === "website") {
      return `${authorFormatted}. "${title}." *${pub}*. ${yr}.${url ? ` ${url}` : ""}`;
    }
    if (c.sourceType === "journal") {
      const vol = (c as any).volume || "";
      const issue = (c as any).issue || "";
      return `${authorFormatted}. "${title}." *${pub}* ${vol}${issue ? `, no. ${issue}` : ""} (${yr}).${url ? ` ${url}` : ""}`;
    }
    if (c.sourceType === "book") {
      return `${authorFormatted}. *${title}*. ${pub}, ${yr}.`;
    }
    return `${authorFormatted}. "${title}." *${pub}*. ${yr}.${url ? ` ${url}` : ""}`;
  }
  return `${authorFormatted}. (${yr}). ${title}. ${pub}.`;
}

function CitationTab() {
  const { actor } = useActor();
  const [citations, setCitations] = useLocalStorage<Citation[]>(
    "pocket_citations",
    [],
  );
  const [form, setForm] = useState({
    style: "apa" as Citation["style"],
    sourceType: "website" as Citation["sourceType"],
    title: "",
    author: "",
    year: "",
    publisher: "",
    url: "",
  });
  const [result, setResult] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [urlLoading, setUrlLoading] = useState(false);

  const handleUrlAutofill = async () => {
    if (!urlInput.trim()) {
      toast.error("Please enter a URL first.");
      return;
    }
    setUrlLoading(true);
    try {
      let data: {
        title?: string;
        author?: string;
        year?: string;
        publisher?: string;
      } = {};

      // Fetch citation data from backend
      if (!actor) throw new Error("Backend not available. Please try again.");
      const raw = await actor.fetchCitationFromUrl(urlInput.trim());
      data = parseJsonFromAI(raw) as typeof data;

      setForm((f) => ({
        ...f,
        url: urlInput.trim(),
        title: (data.title as string) || f.title,
        author: (data.author as string) || f.author,
        year: (data.year as string) || f.year,
        publisher: (data.publisher as string) || f.publisher,
        sourceType: "website",
      }));
      toast.success("Fields pre-filled from URL!");
    } catch (err) {
      console.error(err);
      toast.error("Could not auto-fill from URL. Please fill in manually.");
    } finally {
      setUrlLoading(false);
    }
  };

  const handleGenerate = () => {
    const generated = generateCitation(form);
    setResult(generated);
    const newCit: Citation = {
      id: genId(),
      ...form,
      generated,
      createdAt: new Date().toISOString(),
    };
    setCitations((prev) => [newCit, ...prev]);
    toast.success("Citation generated!");
  };

  return (
    <div className="space-y-6">
      {/* URL Auto-fill */}
      <div className="pocket-card p-5 border-2 border-pocket-gold/30">
        <div className="flex items-center gap-2 mb-3">
          <Link size={16} className="text-pocket-gold" />
          <h3 className="font-display font-bold text-pocket-burgundy text-base">
            Fetch from URL
          </h3>
          <span className="text-xs bg-pocket-gold/20 text-pocket-gold px-2 py-0.5 rounded-full font-medium">
            Auto-fill
          </span>
        </div>
        <p className="text-xs text-pocket-muted mb-3">
          Paste a URL and we'll automatically extract the citation details for
          you.
        </p>
        <div className="flex gap-2">
          <Input
            data-ocid="citation.search_input"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://example.com/article..."
            className="flex-1 border-pocket-blush focus:border-pocket-burgundy"
            onKeyDown={(e) => e.key === "Enter" && handleUrlAutofill()}
          />
          <Button
            data-ocid="citation.primary_button"
            onClick={handleUrlAutofill}
            disabled={urlLoading}
            className="bg-pocket-gold text-white hover:bg-pocket-gold/90 shrink-0"
          >
            {urlLoading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <RefreshCw size={14} />
            )}
            <span className="ml-1.5">
              {urlLoading ? "Fetching…" : "Auto-fill"}
            </span>
          </Button>
        </div>
      </div>

      <div className="pocket-card p-6">
        <h3 className="font-display font-bold text-pocket-burgundy text-lg mb-4 pocket-section-header">
          Generate Citation
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="cit-style"
              className="text-xs font-medium text-pocket-muted mb-1 block"
            >
              Citation Style
            </label>
            <Select
              value={form.style}
              onValueChange={(v) =>
                setForm((f) => ({ ...f, style: v as Citation["style"] }))
              }
            >
              <SelectTrigger id="cit-style" data-ocid="citation.select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="apa">APA</SelectItem>
                <SelectItem value="mla">MLA</SelectItem>
                <SelectItem value="chicago">Chicago</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label
              htmlFor="cit-source-type"
              className="text-xs font-medium text-pocket-muted mb-1 block"
            >
              Source Type
            </label>
            <Select
              value={form.sourceType}
              onValueChange={(v) =>
                setForm((f) => ({
                  ...f,
                  sourceType: v as Citation["sourceType"],
                }))
              }
            >
              <SelectTrigger id="cit-source-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[
                  "book",
                  "website",
                  "article",
                  "journal",
                  "video",
                  "other",
                ].map((t) => (
                  <SelectItem key={t} value={t} className="capitalize">
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label
              htmlFor="cit-title"
              className="text-xs font-medium text-pocket-muted mb-1 block"
            >
              Title
            </label>
            <Input
              id="cit-title"
              data-ocid="citation.input"
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              placeholder="Source title"
            />
          </div>
          <div>
            <label
              htmlFor="cit-author"
              className="text-xs font-medium text-pocket-muted mb-1 block"
            >
              Author(s)
            </label>
            <Input
              id="cit-author"
              value={form.author}
              onChange={(e) =>
                setForm((f) => ({ ...f, author: e.target.value }))
              }
              placeholder="Last, First or First Last"
            />
          </div>
          <div>
            <label
              htmlFor="cit-year"
              className="text-xs font-medium text-pocket-muted mb-1 block"
            >
              Year
            </label>
            <Input
              id="cit-year"
              value={form.year}
              onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))}
              placeholder="2024"
            />
          </div>
          <div>
            <label
              htmlFor="cit-pub"
              className="text-xs font-medium text-pocket-muted mb-1 block"
            >
              Publisher / Journal
            </label>
            <Input
              id="cit-pub"
              value={form.publisher}
              onChange={(e) =>
                setForm((f) => ({ ...f, publisher: e.target.value }))
              }
              placeholder="Publisher name"
            />
          </div>
          <div className="sm:col-span-2">
            <label
              htmlFor="cit-url"
              className="text-xs font-medium text-pocket-muted mb-1 block"
            >
              URL (optional)
            </label>
            <Input
              id="cit-url"
              value={form.url}
              onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
              placeholder="https://..."
            />
          </div>
        </div>
        <Button
          data-ocid="citation.submit_button"
          onClick={handleGenerate}
          className="mt-4 bg-pocket-burgundy text-pocket-cream hover:bg-pocket-burgundy/90"
        >
          Generate Citation
        </Button>
        {result && (
          <div className="mt-4 bg-pocket-blush/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <p className="text-xs text-pocket-muted font-medium">
                {form.style.toUpperCase()} Citation:
              </p>
              {form.url && (
                <a
                  href={form.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-pocket-burgundy hover:underline flex items-center gap-1"
                >
                  <ExternalLink size={10} /> Open source
                </a>
              )}
            </div>
            <p className="text-sm text-pocket-text font-crimson italic leading-relaxed">
              {result}
            </p>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(result);
                toast.success("Copied!");
              }}
              className="mt-2 flex items-center gap-1 text-xs text-pocket-burgundy hover:underline"
            >
              <Copy size={12} /> Copy
            </button>
          </div>
        )}
      </div>

      {/* Saved citations */}
      {citations.length > 0 && (
        <div className="pocket-card p-5">
          <h3 className="font-display font-bold text-pocket-burgundy mb-3">
            Saved Citations
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {citations.map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-xl p-3 flex items-start gap-2"
              >
                <div className="flex-1">
                  <div className="flex gap-2 mb-1 flex-wrap">
                    <span className="pocket-badge-blush">
                      {c.style.toUpperCase()}
                    </span>
                    <span className="pocket-badge-gold capitalize">
                      {c.sourceType}
                    </span>
                    {c.url && (
                      <a
                        href={c.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-pocket-burgundy hover:underline flex items-center gap-0.5"
                      >
                        <ExternalLink size={10} /> Source
                      </a>
                    )}
                  </div>
                  <p className="text-xs text-pocket-text font-crimson italic">
                    {c.generated}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(c.generated);
                      toast.success("Copied!");
                    }}
                    className="text-pocket-muted hover:text-pocket-burgundy"
                  >
                    <Copy size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setCitations((prev) => prev.filter((x) => x.id !== c.id))
                    }
                    className="text-pocket-muted hover:text-destructive"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ===== FLASHCARDS =====
interface GeneratedCard {
  id: string;
  front: string;
  back: string;
}

function AIGenerateModal({
  open,
  onClose,
  onSave,
  actor,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (deckName: string, cards: GeneratedCard[]) => void;
  actor: ReturnType<typeof useActor>["actor"];
}) {
  const [topic, setTopic] = useState("");
  const [knowledge, setKnowledge] = useState("");
  const [loading, setLoading] = useState(false);
  const [cards, setCards] = useState<GeneratedCard[]>([]);
  const [deckName, setDeckName] = useState("");

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic.");
      return;
    }
    setLoading(true);
    setCards([]);
    try {
      let raw = "";

      // Try backend first
      try {
        if (!actor) throw new Error("no actor");
        raw = await actor.generateFlashcards(topic, knowledge);
      } catch {
        // Fallback: direct OpenAI
        raw = await callOpenAI([
          {
            role: "system",
            content:
              "You are an expert study flashcard generator. Return ONLY a JSON array of 10 flashcard objects with 'front' and 'back' keys. No markdown, no explanation.",
          },
          {
            role: "user",
            content: `Generate 10 study flashcards for the topic: "${topic}".\n${knowledge ? `Use this knowledge as reference:\n${knowledge}` : "Use reliable, accurate information from online resources."}`,
          },
        ]);
      }

      const parsed = parseJsonFromAI(raw) as { front: string; back: string }[];
      if (!Array.isArray(parsed)) throw new Error("Invalid format");
      setCards(
        parsed.slice(0, 20).map((c, i) => ({
          id: `gen-${i}-${Date.now()}`,
          front: c.front,
          back: c.back,
        })),
      );
      setDeckName(topic);
      toast.success(`Generated ${parsed.length} flashcards!`);
    } catch (err) {
      console.error(err);
      toast.error("Could not generate flashcards. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const updateCard = (id: string, field: "front" | "back", val: string) => {
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: val } : c)),
    );
  };

  const deleteCard = (id: string) => {
    setCards((prev) => prev.filter((c) => c.id !== id));
  };

  const handleSave = () => {
    if (!deckName.trim() || cards.length === 0) {
      toast.error("Please add a deck name and ensure cards exist.");
      return;
    }
    onSave(deckName, cards);
    onClose();
  };

  const handleClose = () => {
    setTopic("");
    setKnowledge("");
    setCards([]);
    setDeckName("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="bg-pocket-cream max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="shrink-0">
          <DialogTitle className="font-display text-pocket-burgundy flex items-center gap-2 text-xl">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-pocket-burgundy to-pocket-gold">
              <Sparkles size={16} className="text-pocket-cream" />
            </span>
            AI Flashcard Generator
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-1 overflow-auto pr-2">
          <div className="space-y-4 py-2">
            <div>
              <label
                htmlFor="ai-fc-topic"
                className="text-xs font-semibold text-pocket-burgundy uppercase tracking-wide mb-1.5 block"
              >
                Topic *
              </label>
              <Input
                id="ai-fc-topic"
                data-ocid="flashcard-ai.input"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Mitosis, World War II, Supply and Demand…"
                className="border-pocket-blush focus:border-pocket-burgundy"
              />
            </div>
            <div>
              <label
                htmlFor="ai-fc-notes"
                className="text-xs font-semibold text-pocket-burgundy uppercase tracking-wide mb-1.5 block"
              >
                Your Notes / Knowledge{" "}
                <span className="font-normal text-pocket-muted lowercase tracking-normal">
                  (optional)
                </span>
              </label>
              <Textarea
                id="ai-fc-notes"
                data-ocid="flashcard-ai.textarea"
                value={knowledge}
                onChange={(e) => setKnowledge(e.target.value)}
                rows={4}
                placeholder="Paste your notes, textbook excerpts, or anything you want the cards based on…"
                className="border-pocket-blush focus:border-pocket-burgundy resize-none"
              />
            </div>
            <Button
              data-ocid="flashcard-ai.primary_button"
              onClick={handleGenerate}
              disabled={loading}
              className="w-full bg-gradient-to-r from-pocket-burgundy to-pocket-burgundy/80 text-pocket-cream hover:from-pocket-burgundy/90 hover:to-pocket-burgundy/70 font-semibold py-5"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" /> Generating
                  cards…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles size={16} /> Generate Flashcards
                </span>
              )}
            </Button>

            {/* Loading shimmer */}
            <AnimatePresence>
              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="rounded-xl overflow-hidden border border-pocket-blush"
                >
                  <div className="p-4 space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex gap-3">
                        <div className="h-10 flex-1 rounded-lg bg-gradient-to-r from-pocket-blush via-pocket-cream to-pocket-blush bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]" />
                        <div className="h-10 flex-1 rounded-lg bg-gradient-to-r from-pocket-blush via-pocket-cream to-pocket-blush bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite_0.2s]" />
                      </div>
                    ))}
                  </div>
                  <div className="bg-pocket-blush/20 px-4 py-2 border-t border-pocket-blush">
                    <p className="text-xs text-pocket-burgundy/70 font-medium animate-pulse flex items-center gap-1.5">
                      <Sparkles size={11} /> Generating your personalized
                      flashcards…
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Generated cards preview */}
            <AnimatePresence>
              {cards.length > 0 && !loading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-pocket-burgundy uppercase tracking-wide">
                      Preview ({cards.length} cards)
                    </p>
                    <p className="text-xs text-pocket-muted">
                      Click to edit front/back inline
                    </p>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {cards.map((card) => (
                      <div
                        key={card.id}
                        className="bg-white rounded-xl p-3 grid grid-cols-2 gap-3"
                      >
                        <div>
                          <p className="text-xs text-pocket-muted mb-1 font-medium">
                            Front
                          </p>
                          <Textarea
                            value={card.front}
                            onChange={(e) =>
                              updateCard(card.id, "front", e.target.value)
                            }
                            rows={2}
                            className="text-xs resize-none"
                          />
                        </div>
                        <div>
                          <p className="text-xs text-pocket-muted mb-1 font-medium">
                            Back
                          </p>
                          <Textarea
                            value={card.back}
                            onChange={(e) =>
                              updateCard(card.id, "back", e.target.value)
                            }
                            rows={2}
                            className="text-xs resize-none"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => deleteCard(card.id)}
                          className="col-span-2 text-left text-xs text-pocket-muted hover:text-destructive flex items-center gap-1"
                        >
                          <Trash2 size={11} /> Remove card
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Deck Name + Save */}
                  <div>
                    <label
                      htmlFor="ai-fc-deck-name"
                      className="text-xs font-semibold text-pocket-burgundy uppercase tracking-wide mb-1.5 block"
                    >
                      Deck Name
                    </label>
                    <Input
                      id="ai-fc-deck-name"
                      data-ocid="flashcard-ai.search_input"
                      value={deckName}
                      onChange={(e) => setDeckName(e.target.value)}
                      placeholder="Name for your new deck"
                      className="border-pocket-blush focus:border-pocket-burgundy"
                    />
                  </div>
                  <Button
                    data-ocid="flashcard-ai.save_button"
                    onClick={handleSave}
                    className="w-full bg-pocket-burgundy text-pocket-cream hover:bg-pocket-burgundy/90 font-semibold"
                  >
                    Save as Deck ({cards.length} cards)
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function FlashcardsTab() {
  const { actor } = useActor();
  const [decks, setDecks] = useLocalStorage<FlashcardDeck[]>(
    "pocket_flashcardDecks",
    [],
  );
  const [cards, setCards] = useLocalStorage<Flashcard[]>(
    "pocket_flashcards",
    [],
  );
  const [activeDeck, setActiveDeck] = useState<FlashcardDeck | null>(null);
  const [studyIndex, setStudyIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [addDeckOpen, setAddDeckOpen] = useState(false);
  const [addCardOpen, setAddCardOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [deckForm, setDeckForm] = useState({ name: "", topic: "" });
  const [cardForm, setCardForm] = useState({ front: "", back: "" });

  const deckCards = activeDeck
    ? cards.filter((c) => c.deckId === activeDeck.id)
    : [];

  const addDeck = () => {
    if (!deckForm.name.trim()) return;
    const deck: FlashcardDeck = {
      id: genId(),
      name: deckForm.name,
      topic: deckForm.topic,
      createdAt: new Date().toISOString(),
    };
    setDecks((prev) => [...prev, deck]);
    setDeckForm({ name: "", topic: "" });
    setAddDeckOpen(false);
    toast.success("Deck created!");
  };

  const addCard = () => {
    if (!cardForm.front.trim() || !activeDeck) return;
    const card: Flashcard = {
      id: genId(),
      deckId: activeDeck.id,
      front: cardForm.front,
      back: cardForm.back,
      reviewed: false,
    };
    setCards((prev) => [...prev, card]);
    setCardForm({ front: "", back: "" });
    setAddCardOpen(false);
    toast.success("Card added!");
  };

  const markReviewed = (cardId: string) => {
    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, reviewed: true } : c)),
    );
  };

  const handleAISave = (deckName: string, generatedCards: GeneratedCard[]) => {
    const deck: FlashcardDeck = {
      id: genId(),
      name: deckName,
      topic: deckName,
      createdAt: new Date().toISOString(),
    };
    setDecks((prev) => [...prev, deck]);
    const newCards: Flashcard[] = generatedCards.map((c) => ({
      id: genId(),
      deckId: deck.id,
      front: c.front,
      back: c.back,
      reviewed: false,
    }));
    setCards((prev) => [...prev, ...newCards]);
    toast.success(`Deck "${deckName}" created with ${newCards.length} cards!`);
  };

  if (activeDeck) {
    const current = deckCards[studyIndex];
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setActiveDeck(null);
              setStudyIndex(0);
              setFlipped(false);
            }}
            className="text-pocket-muted hover:text-pocket-burgundy flex items-center gap-1 text-sm"
            data-ocid="flashcard.secondary_button"
          >
            <ChevronLeft size={16} /> Back
          </button>
          <h3 className="font-display font-bold text-pocket-burgundy text-lg">
            {activeDeck.name}
          </h3>
          <span className="pocket-badge-blush">{activeDeck.topic}</span>
          <div className="ml-auto flex gap-2">
            <Button
              data-ocid="flashcard.primary_button"
              size="sm"
              onClick={() => setAddCardOpen(true)}
              className="bg-pocket-burgundy text-pocket-cream hover:bg-pocket-burgundy/90"
            >
              <Plus size={14} className="mr-1" /> Add Card
            </Button>
          </div>
        </div>

        {deckCards.length === 0 ? (
          <div
            className="pocket-card p-8 text-center"
            data-ocid="flashcard.empty_state"
          >
            <p className="text-pocket-muted italic">
              No cards yet. Add your first card!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-pocket-muted text-center">
              {studyIndex + 1} / {deckCards.length}
            </p>
            {/* Flashcard */}
            <button
              type="button"
              className="perspective-1000 cursor-pointer w-full text-left"
              onClick={() => setFlipped((f) => !f)}
              onKeyDown={(e) => e.key === "Enter" && setFlipped((f) => !f)}
              style={{ perspective: "1000px" }}
              data-ocid="flashcard.canvas_target"
            >
              <div
                className={`flashcard-inner ${flipped ? "flipped" : ""}`}
                style={{ height: 200 }}
              >
                <div className="flashcard-face pocket-card p-8 flex items-center justify-center text-center">
                  <p className="font-display text-xl text-pocket-burgundy">
                    {current?.front}
                  </p>
                </div>
                <div
                  className="flashcard-face flashcard-back pocket-card p-8 flex items-center justify-center text-center"
                  style={{
                    background: "oklch(0.37 0.13 15)",
                    color: "oklch(0.93 0.018 60)",
                  }}
                >
                  <p className="font-crimson text-xl italic">{current?.back}</p>
                </div>
              </div>
            </button>
            <p className="text-center text-xs text-pocket-muted">
              Click card to flip
            </p>

            <div className="flex justify-center gap-3">
              <button
                type="button"
                data-ocid="flashcard.pagination_prev"
                onClick={() => {
                  setStudyIndex((i) => Math.max(0, i - 1));
                  setFlipped(false);
                }}
                className="pocket-btn-ghost flex items-center gap-1 px-4 py-2 rounded-xl"
                disabled={studyIndex === 0}
              >
                <ChevronLeft size={16} /> Prev
              </button>
              {current && !current.reviewed && (
                <button
                  type="button"
                  onClick={() => markReviewed(current.id)}
                  className="px-4 py-2 rounded-xl text-sm font-medium bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                >
                  ✓ Mark Reviewed
                </button>
              )}
              {current?.reviewed && (
                <span className="px-4 py-2 rounded-xl text-sm font-medium bg-green-50 text-green-600">
                  ✓ Reviewed
                </span>
              )}
              <button
                type="button"
                data-ocid="flashcard.pagination_next"
                onClick={() => {
                  setStudyIndex((i) => Math.min(deckCards.length - 1, i + 1));
                  setFlipped(false);
                }}
                className="pocket-btn-ghost flex items-center gap-1 px-4 py-2 rounded-xl"
                disabled={studyIndex === deckCards.length - 1}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>

            {/* All cards list */}
            <div className="pocket-card p-4">
              <h4 className="text-sm font-bold text-pocket-burgundy mb-3">
                All Cards
              </h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {deckCards.map((card, i) => (
                  <div
                    key={card.id}
                    className="flex items-center gap-2 text-sm bg-white rounded-lg p-2"
                  >
                    <span className="text-pocket-muted w-6">{i + 1}.</span>
                    <span className="flex-1 text-pocket-text truncate">
                      {card.front}
                    </span>
                    {card.reviewed && (
                      <span className="text-green-500 text-xs">✓</span>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        setCards((prev) => prev.filter((c) => c.id !== card.id))
                      }
                      className="text-pocket-muted hover:text-destructive"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <Dialog open={addCardOpen} onOpenChange={setAddCardOpen}>
          <DialogContent className="bg-pocket-cream">
            <DialogHeader>
              <DialogTitle className="font-display text-pocket-burgundy">
                Add Flashcard
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <label
                  htmlFor="card-front"
                  className="text-xs font-medium text-pocket-muted mb-1 block"
                >
                  Front
                </label>
                <Textarea
                  id="card-front"
                  data-ocid="flashcard.textarea"
                  value={cardForm.front}
                  onChange={(e) =>
                    setCardForm((f) => ({ ...f, front: e.target.value }))
                  }
                  placeholder="Question or term"
                  rows={3}
                />
              </div>
              <div>
                <label
                  htmlFor="card-back"
                  className="text-xs font-medium text-pocket-muted mb-1 block"
                >
                  Back
                </label>
                <Textarea
                  id="card-back"
                  value={cardForm.back}
                  onChange={(e) =>
                    setCardForm((f) => ({ ...f, back: e.target.value }))
                  }
                  placeholder="Answer or definition"
                  rows={3}
                />
              </div>
              <Button
                data-ocid="flashcard.submit_button"
                onClick={addCard}
                className="w-full bg-pocket-burgundy text-pocket-cream hover:bg-pocket-burgundy/90"
              >
                Add Card
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-bold text-pocket-burgundy text-lg pocket-section-header">
          Flashcard Decks
        </h3>
        <div className="flex gap-2">
          <Button
            data-ocid="flashcard.secondary_button"
            onClick={() => setAiOpen(true)}
            className="relative overflow-hidden bg-gradient-to-r from-pocket-burgundy via-pocket-burgundy to-pocket-gold text-pocket-cream hover:opacity-90 gap-2 font-semibold text-xs"
          >
            <Sparkles size={14} className="shrink-0" /> AI Generate
          </Button>
          <Button
            data-ocid="flashcard.primary_button"
            onClick={() => setAddDeckOpen(true)}
            className="bg-pocket-burgundy text-pocket-cream hover:bg-pocket-burgundy/90"
          >
            <Plus size={14} className="mr-1" /> New Deck
          </Button>
        </div>
      </div>

      {decks.length === 0 ? (
        <div
          className="pocket-card p-10 text-center"
          data-ocid="flashcard.empty_state"
        >
          <p className="text-4xl mb-3">🗂️</p>
          <p className="text-pocket-muted italic">
            No decks yet. Create one manually or let AI generate flashcards for
            you!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {decks.map((deck) => {
            const count = cards.filter((c) => c.deckId === deck.id).length;
            const reviewed = cards.filter(
              (c) => c.deckId === deck.id && c.reviewed,
            ).length;
            return (
              <motion.div
                key={deck.id}
                whileHover={{ y: -2 }}
                className="pocket-card p-5 cursor-pointer"
                onClick={() => {
                  setActiveDeck(deck);
                  setStudyIndex(0);
                  setFlipped(false);
                }}
              >
                <h4 className="font-display font-bold text-pocket-burgundy text-base mb-1">
                  {deck.name}
                </h4>
                {deck.topic && (
                  <p className="text-xs text-pocket-muted mb-3">{deck.topic}</p>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-pocket-text">
                    {count} cards
                  </span>
                  <span className="text-xs text-green-600">
                    {reviewed}/{count} reviewed
                  </span>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-pocket-blush/40">
                  <div
                    className="h-full rounded-full bg-pocket-burgundy/60 transition-all"
                    style={{
                      width: count ? `${(reviewed / count) * 100}%` : "0%",
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDecks((prev) => prev.filter((d) => d.id !== deck.id));
                    setCards((prev) =>
                      prev.filter((c) => c.deckId !== deck.id),
                    );
                  }}
                  className="mt-3 text-xs text-pocket-muted hover:text-destructive"
                >
                  Delete deck
                </button>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Manual new deck dialog */}
      <Dialog open={addDeckOpen} onOpenChange={setAddDeckOpen}>
        <DialogContent className="bg-pocket-cream">
          <DialogHeader>
            <DialogTitle className="font-display text-pocket-burgundy">
              New Deck
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label
                htmlFor="deck-name"
                className="text-xs font-medium text-pocket-muted mb-1 block"
              >
                Deck Name
              </label>
              <Input
                id="deck-name"
                data-ocid="flashcard.input"
                value={deckForm.name}
                onChange={(e) =>
                  setDeckForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="e.g. Psychology 101"
              />
            </div>
            <div>
              <label
                htmlFor="deck-topic"
                className="text-xs font-medium text-pocket-muted mb-1 block"
              >
                Topic
              </label>
              <Input
                id="deck-topic"
                value={deckForm.topic}
                onChange={(e) =>
                  setDeckForm((f) => ({ ...f, topic: e.target.value }))
                }
                placeholder="e.g. Chapter 4: Memory"
              />
            </div>
            <Button
              onClick={addDeck}
              className="w-full bg-pocket-burgundy text-pocket-cream hover:bg-pocket-burgundy/90"
            >
              Create Deck
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Generate Modal */}
      <AIGenerateModal
        open={aiOpen}
        onClose={() => setAiOpen(false)}
        onSave={handleAISave}
        actor={actor}
      />
    </div>
  );
}

// ===== IMAGE TO TEXT =====
function ImageToTextTab() {
  const { actor } = useActor();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file.");
        return;
      }
      const mime = file.type;
      setExtractedText(null);

      const reader = new FileReader();
      reader.onload = async (ev) => {
        const dataUrl = ev.target?.result as string;
        setImageUrl(dataUrl);
        // Extract base64 data (after the comma)
        const base64 = dataUrl.split(",")[1];

        // Auto-extract
        setLoading(true);
        try {
          if (!actor) throw new Error("Backend not available.");
          const result = await actor.extractTextFromImage(base64, mime);
          setExtractedText(result.trim());
        } catch (err) {
          console.error(err);
          toast.error("Could not extract text. Please try again.");
        } finally {
          setLoading(false);
        }
      };
      reader.readAsDataURL(file);
    },
    [actor],
  );

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const isUrl = extractedText?.trim().startsWith("http");

  return (
    <div className="space-y-4">
      <div className="pocket-card p-6">
        <h3 className="font-display font-bold text-pocket-burgundy text-lg mb-2 pocket-section-header">
          Image to Text / QR Decoder
        </h3>
        <p className="text-xs text-pocket-muted mb-4">
          Upload an image to extract text, or decode a QR code to get its link.
        </p>

        {/* Drop zone */}
        <div
          data-ocid="image-text.dropzone"
          className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors cursor-pointer ${
            isDragging
              ? "border-pocket-burgundy bg-pocket-blush/20"
              : "border-pocket-blush hover:border-pocket-burgundy/50"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ")
              fileInputRef.current?.click();
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFile}
            id="img-upload"
            className="hidden"
          />
          <div className="flex justify-center gap-4 mb-3">
            <div className="w-10 h-10 rounded-xl bg-pocket-blush/40 flex items-center justify-center">
              <FileText size={18} className="text-pocket-burgundy" />
            </div>
            <div className="w-10 h-10 rounded-xl bg-pocket-gold/20 flex items-center justify-center">
              <QrCode size={18} className="text-pocket-gold" />
            </div>
          </div>
          <p className="text-pocket-muted text-sm font-medium">
            {isDragging ? "Drop image here!" : "Drag & drop or click to upload"}
          </p>
          <p className="text-xs text-pocket-muted/70 mt-1">
            PNG, JPG, WebP · Also decodes QR codes
          </p>
          <Button
            data-ocid="image-text.upload_button"
            type="button"
            size="sm"
            className="mt-3 bg-pocket-burgundy text-pocket-cream hover:bg-pocket-burgundy/90"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            <Upload size={13} className="mr-1" /> Choose Image
          </Button>
        </div>

        {/* Image preview */}
        {imageUrl && (
          <div className="mt-4 rounded-xl overflow-hidden">
            <img
              src={imageUrl}
              alt="Uploaded"
              className="max-h-64 w-full object-contain bg-white rounded-xl"
            />
          </div>
        )}
      </div>

      {/* Extracted Result */}
      {(loading || extractedText !== null) && (
        <div className="pocket-card p-6">
          <h3 className="font-display font-bold text-pocket-burgundy text-base mb-3 flex items-center gap-2">
            {loading ? (
              <>
                <Loader2
                  size={16}
                  className="animate-spin text-pocket-burgundy"
                />
                Analyzing image…
              </>
            ) : isUrl ? (
              <>
                <QrCode size={16} className="text-pocket-gold" /> QR Code / Link
                Detected
              </>
            ) : (
              <>
                <FileText size={16} /> Extracted Text
              </>
            )}
          </h3>

          {loading && (
            <div data-ocid="image-text.loading_state" className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-3 rounded-full bg-gradient-to-r from-pocket-blush via-pocket-cream to-pocket-blush bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]"
                  style={{ width: `${60 + i * 10}%` }}
                />
              ))}
            </div>
          )}

          {extractedText !== null && !loading && (
            <div data-ocid="image-text.success_state">
              {isUrl ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <a
                      href={extractedText}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-pocket-burgundy underline underline-offset-2 hover:text-pocket-burgundy/80 font-medium flex items-center gap-1 break-all"
                    >
                      <ExternalLink size={13} className="shrink-0" />
                      {extractedText}
                    </a>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(extractedText);
                      toast.success("Link copied!");
                    }}
                    className="flex items-center gap-1 text-xs text-pocket-burgundy hover:underline"
                  >
                    <Copy size={12} /> Copy link
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="bg-white rounded-xl p-4 text-sm text-pocket-text leading-relaxed whitespace-pre-wrap font-crimson">
                    {extractedText}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(extractedText);
                      toast.success("Text copied!");
                    }}
                    className="flex items-center gap-1 text-xs text-pocket-burgundy hover:underline"
                  >
                    <Copy size={12} /> Copy text
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ===== BOOKMARKS =====
function BookmarksTab() {
  const [bookmarks, setBookmarks] = useLocalStorage<Bookmark[]>(
    "pocket_bookmarks",
    [],
  );
  const [addOpen, setAddOpen] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [filterCat, setFilterCat] = useState<string>("all");
  const [form, setForm] = useState({
    url: "",
    title: "",
    description: "",
    category: "article" as Bookmark["category"],
    tags: "",
  });

  const addBookmark = () => {
    if (!form.title.trim()) return;
    const bm: Bookmark = {
      id: genId(),
      url: form.url,
      title: form.title,
      description: form.description,
      category: form.category,
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      addedAt: new Date().toISOString(),
    };
    setBookmarks((prev) => [bm, ...prev]);
    setForm({
      url: "",
      title: "",
      description: "",
      category: "article",
      tags: "",
    });
    setAddOpen(false);
    toast.success("Bookmark saved!");
  };

  const filtered = bookmarks.filter((bm) => {
    const q = searchQ.toLowerCase();
    const matchSearch =
      !q ||
      bm.title.toLowerCase().includes(q) ||
      bm.description.toLowerCase().includes(q) ||
      bm.tags.some((t) => t.toLowerCase().includes(q));
    const matchCat = filterCat === "all" || bm.category === filterCat;
    return matchSearch && matchCat;
  });

  const catColors: Record<Bookmark["category"], string> = {
    article: "bg-blue-100 text-blue-700",
    blog: "bg-green-100 text-green-700",
    quote: "bg-purple-100 text-purple-700",
    lyrics: "bg-pink-100 text-pink-700",
    video: "bg-red-100 text-red-700",
    other: "bg-gray-100 text-gray-700",
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2 flex-1 min-w-48">
          <div className="relative flex-1">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-pocket-muted"
            />
            <Input
              data-ocid="bookmark.search_input"
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              placeholder="Search bookmarks..."
              className="pl-9"
            />
          </div>
          <Select value={filterCat} onValueChange={setFilterCat}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {["article", "blog", "quote", "lyrics", "video", "other"].map(
                (c) => (
                  <SelectItem key={c} value={c} className="capitalize">
                    {c}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>
        </div>
        <Button
          data-ocid="bookmark.primary_button"
          onClick={() => setAddOpen(true)}
          className="bg-pocket-burgundy text-pocket-cream hover:bg-pocket-burgundy/90"
        >
          <Plus size={14} className="mr-1" /> Add Bookmark
        </Button>
      </div>

      {filtered.length === 0 ? (
        <div
          className="pocket-card p-10 text-center"
          data-ocid="bookmark.empty_state"
        >
          <p className="text-4xl mb-3">🔖</p>
          <p className="text-pocket-muted italic">
            {bookmarks.length === 0
              ? "No bookmarks yet. Save your first link!"
              : "No results match your search."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map((bm) => (
              <motion.div
                key={bm.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="pocket-card p-4"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${catColors[bm.category]}`}
                  >
                    {bm.category}
                  </span>
                  <div className="flex gap-1">
                    {bm.url && (
                      <a
                        href={bm.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-pocket-muted hover:text-pocket-burgundy"
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        setBookmarks((prev) =>
                          prev.filter((b) => b.id !== bm.id),
                        )
                      }
                      className="text-pocket-muted hover:text-destructive"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <h4 className="font-medium text-pocket-text text-sm leading-tight mb-1 line-clamp-2">
                  {bm.title}
                </h4>
                {bm.description && (
                  <p className="text-xs text-pocket-muted line-clamp-2">
                    {bm.description}
                  </p>
                )}
                {bm.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {bm.tags.map((tag) => (
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
              Add Bookmark
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label
                htmlFor="bm-title"
                className="text-xs font-medium text-pocket-muted mb-1 block"
              >
                Title *
              </label>
              <Input
                id="bm-title"
                data-ocid="bookmark.input"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="Title or name"
              />
            </div>
            <div>
              <label
                htmlFor="bm-url"
                className="text-xs font-medium text-pocket-muted mb-1 block"
              >
                URL
              </label>
              <Input
                id="bm-url"
                value={form.url}
                onChange={(e) =>
                  setForm((f) => ({ ...f, url: e.target.value }))
                }
                placeholder="https://..."
              />
            </div>
            <div>
              <label
                htmlFor="bm-category"
                className="text-xs font-medium text-pocket-muted mb-1 block"
              >
                Category
              </label>
              <Select
                value={form.category}
                onValueChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    category: v as Bookmark["category"],
                  }))
                }
              >
                <SelectTrigger id="bm-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["article", "blog", "quote", "lyrics", "video", "other"].map(
                    (c) => (
                      <SelectItem key={c} value={c} className="capitalize">
                        {c}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label
                htmlFor="bm-description"
                className="text-xs font-medium text-pocket-muted mb-1 block"
              >
                Description
              </label>
              <Textarea
                id="bm-description"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Short description..."
                rows={2}
              />
            </div>
            <div>
              <label
                htmlFor="bm-tags"
                className="text-xs font-medium text-pocket-muted mb-1 block"
              >
                Tags (comma separated)
              </label>
              <Input
                id="bm-tags"
                value={form.tags}
                onChange={(e) =>
                  setForm((f) => ({ ...f, tags: e.target.value }))
                }
                placeholder="psychology, research, inspiration"
              />
            </div>
            <Button
              data-ocid="bookmark.submit_button"
              onClick={addBookmark}
              className="w-full bg-pocket-burgundy text-pocket-cream hover:bg-pocket-burgundy/90"
            >
              Save Bookmark
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ===== MAIN KNOWLEDGE SECTION =====
export default function Knowledge() {
  return (
    <div className="min-h-full p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-display font-bold text-pocket-burgundy">
          Knowledge
        </h1>
        <div className="h-0.5 w-16 bg-pocket-gold rounded-full mt-2" />
        <p className="text-pocket-muted mt-2 text-sm">
          Citations, flashcards, image extraction, and your saved web finds.
        </p>
      </div>
      <Tabs defaultValue="citations">
        <TabsList className="mb-6 bg-pocket-blush/20">
          <TabsTrigger
            value="citations"
            className="data-[state=active]:bg-pocket-burgundy data-[state=active]:text-pocket-cream"
            data-ocid="knowledge.citations.tab"
          >
            Citations
          </TabsTrigger>
          <TabsTrigger
            value="flashcards"
            className="data-[state=active]:bg-pocket-burgundy data-[state=active]:text-pocket-cream"
            data-ocid="knowledge.flashcards.tab"
          >
            Flashcards
          </TabsTrigger>
          <TabsTrigger
            value="image-text"
            className="data-[state=active]:bg-pocket-burgundy data-[state=active]:text-pocket-cream"
            data-ocid="knowledge.image-text.tab"
          >
            Image to Text
          </TabsTrigger>
          <TabsTrigger
            value="bookmarks"
            className="data-[state=active]:bg-pocket-burgundy data-[state=active]:text-pocket-cream"
            data-ocid="knowledge.bookmarks.tab"
          >
            Bookmarks
          </TabsTrigger>
        </TabsList>
        <TabsContent value="citations">
          <CitationTab />
        </TabsContent>
        <TabsContent value="flashcards">
          <FlashcardsTab />
        </TabsContent>
        <TabsContent value="image-text">
          <ImageToTextTab />
        </TabsContent>
        <TabsContent value="bookmarks">
          <BookmarksTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
