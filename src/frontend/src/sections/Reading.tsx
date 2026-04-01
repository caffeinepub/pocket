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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { AnimatePresence, motion } from "@/lib/motion";
import { Pencil, Plus, Star, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { type Book, type Show, genId } from "../types/pocket";

const STATUS_COLORS: Record<string, string> = {
  tbr: "bg-blue-100 text-blue-700",
  reading: "bg-yellow-100 text-yellow-700",
  finished: "bg-green-100 text-green-700",
  want: "bg-blue-100 text-blue-700",
  watching: "bg-yellow-100 text-yellow-700",
  watched: "bg-green-100 text-green-700",
};

const STATUS_LABELS: Record<string, string> = {
  tbr: "TBR",
  reading: "Reading",
  finished: "Finished",
  want: "Want to Watch",
  watching: "Watching",
  watched: "Watched",
};

function StarRating({
  rating,
  onChange,
}: { rating: number; onChange?: (n: number) => void }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange?.(n)}
          className={onChange ? "cursor-pointer" : "cursor-default"}
        >
          <Star
            size={14}
            className={
              n <= rating
                ? "fill-pocket-gold text-pocket-gold"
                : "text-pocket-blush/40"
            }
          />
        </button>
      ))}
    </div>
  );
}

// ===== BOOKS TAB =====
function BooksTab() {
  const [books, setBooks] = useLocalStorage<Book[]>("pocket_books", []);
  const [addOpen, setAddOpen] = useState(false);
  const [editBook, setEditBook] = useState<Book | null>(null);
  const [form, setForm] = useState({
    title: "",
    author: "",
    genre: "",
    status: "tbr" as Book["status"],
    rating: 0,
    notes: "",
  });

  const saveBook = () => {
    if (!form.title.trim()) return;
    if (editBook) {
      setBooks((prev) =>
        prev.map((b) => (b.id === editBook.id ? { ...b, ...form } : b)),
      );
      setEditBook(null);
      toast.success("Book updated!");
    } else {
      setBooks((prev) => [
        { id: genId(), ...form, addedAt: new Date().toISOString() },
        ...prev,
      ]);
      setAddOpen(false);
      toast.success("Book added!");
    }
    setForm({
      title: "",
      author: "",
      genre: "",
      status: "tbr",
      rating: 0,
      notes: "",
    });
  };

  const grouped = {
    reading: books.filter((b) => b.status === "reading"),
    tbr: books.filter((b) => b.status === "tbr"),
    finished: books.filter((b) => b.status === "finished"),
  };

  const formContent = (
    <div className="space-y-3">
      <div>
        <label
          htmlFor="book-title"
          className="text-xs font-medium text-pocket-muted mb-1 block"
        >
          Title *
        </label>
        <Input
          id="book-title"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          placeholder="Book title"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label
            htmlFor="book-author"
            className="text-xs font-medium text-pocket-muted mb-1 block"
          >
            Author
          </label>
          <Input
            id="book-author"
            value={form.author}
            onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
            placeholder="Author name"
          />
        </div>
        <div>
          <label
            htmlFor="book-genre"
            className="text-xs font-medium text-pocket-muted mb-1 block"
          >
            Genre
          </label>
          <Input
            id="book-genre"
            value={form.genre}
            onChange={(e) => setForm((f) => ({ ...f, genre: e.target.value }))}
            placeholder="Fiction, Non-fiction..."
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label
            htmlFor="book-status"
            className="text-xs font-medium text-pocket-muted mb-1 block"
          >
            Status
          </label>
          <Select
            value={form.status}
            onValueChange={(v) =>
              setForm((f) => ({ ...f, status: v as Book["status"] }))
            }
          >
            <SelectTrigger id="book-status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tbr">TBR</SelectItem>
              <SelectItem value="reading">Reading</SelectItem>
              <SelectItem value="finished">Finished</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <p className="text-xs font-medium text-pocket-muted mb-1">Rating</p>
          <div className="mt-1.5">
            <StarRating
              rating={form.rating}
              onChange={(n) => setForm((f) => ({ ...f, rating: n }))}
            />
          </div>
        </div>
      </div>
      <div>
        <label
          htmlFor="book-notes"
          className="text-xs font-medium text-pocket-muted mb-1 block"
        >
          Notes
        </label>
        <Textarea
          id="book-notes"
          value={form.notes}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          placeholder="Thoughts, quotes..."
          rows={2}
        />
      </div>
      <Button
        onClick={saveBook}
        className="w-full bg-pocket-burgundy text-pocket-cream hover:bg-pocket-burgundy/90"
      >
        {editBook ? "Update Book" : "Add Book"}
      </Button>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <p className="text-sm text-pocket-muted">
          {books.length} books total · {grouped.reading.length} reading ·{" "}
          {grouped.finished.length} finished
        </p>
        <Button
          onClick={() => setAddOpen(true)}
          className="bg-pocket-burgundy text-pocket-cream hover:bg-pocket-burgundy/90"
        >
          <Plus size={14} className="mr-1" /> Add Book
        </Button>
      </div>

      {books.length === 0 ? (
        <div className="pocket-card p-10 text-center">
          <p className="text-4xl mb-3">📚</p>
          <p className="text-pocket-muted italic">
            Your reading journey begins here. Add your first book!
          </p>
        </div>
      ) : (
        <>
          {(["reading", "tbr", "finished"] as Book["status"][]).map(
            (status) => {
              const group = grouped[status];
              if (group.length === 0) return null;
              return (
                <div key={status}>
                  <h3 className="font-display font-bold text-pocket-burgundy text-base mb-3 flex items-center gap-2">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[status]}`}
                    >
                      {STATUS_LABELS[status]}
                    </span>
                    <span className="text-pocket-muted text-xs font-normal">
                      {group.length}
                    </span>
                  </h3>
                  <div className="space-y-2">
                    <AnimatePresence>
                      {group.map((book) => (
                        <motion.div
                          key={book.id}
                          layout
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="pocket-card p-4 flex items-start gap-4"
                        >
                          <div
                            className="w-10 h-14 rounded-lg shrink-0 flex items-center justify-center font-display font-bold text-lg"
                            style={{
                              background: "oklch(0.37 0.13 15)",
                              color: "oklch(0.93 0.018 60)",
                            }}
                          >
                            {book.title[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-pocket-text text-sm">
                              {book.title}
                            </p>
                            {book.author && (
                              <p className="text-xs text-pocket-muted">
                                {book.author}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                              {book.genre && (
                                <span className="text-xs text-pocket-muted/60">
                                  {book.genre}
                                </span>
                              )}
                              {book.rating > 0 && (
                                <StarRating rating={book.rating} />
                              )}
                            </div>
                            {book.notes && (
                              <p className="text-xs text-pocket-muted mt-1 line-clamp-2 italic">
                                {book.notes}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setForm({
                                  title: book.title,
                                  author: book.author,
                                  genre: book.genre,
                                  status: book.status,
                                  rating: book.rating,
                                  notes: book.notes,
                                });
                                setEditBook(book);
                              }}
                              className="text-pocket-muted hover:text-pocket-burgundy"
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setBooks((prev) =>
                                  prev.filter((b) => b.id !== book.id),
                                )
                              }
                              className="text-pocket-muted hover:text-destructive"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              );
            },
          )}
        </>
      )}

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="bg-pocket-cream">
          <DialogHeader>
            <DialogTitle className="font-display text-pocket-burgundy">
              Add Book
            </DialogTitle>
          </DialogHeader>
          {formContent}
        </DialogContent>
      </Dialog>
      <Dialog
        open={!!editBook}
        onOpenChange={(open) => !open && setEditBook(null)}
      >
        <DialogContent className="bg-pocket-cream">
          <DialogHeader>
            <DialogTitle className="font-display text-pocket-burgundy">
              Edit Book
            </DialogTitle>
          </DialogHeader>
          {formContent}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ===== SHOWS TAB =====
function ShowsTab() {
  const [shows, setShows] = useLocalStorage<Show[]>("pocket_shows", []);
  const [addOpen, setAddOpen] = useState(false);
  const [editShow, setEditShow] = useState<Show | null>(null);
  const [form, setForm] = useState({
    title: "",
    type: "movie" as Show["type"],
    status: "want" as Show["status"],
    rating: 0,
    notes: "",
  });

  const saveShow = () => {
    if (!form.title.trim()) return;
    if (editShow) {
      setShows((prev) =>
        prev.map((s) => (s.id === editShow.id ? { ...s, ...form } : s)),
      );
      setEditShow(null);
      toast.success("Updated!");
    } else {
      setShows((prev) => [
        { id: genId(), ...form, addedAt: new Date().toISOString() },
        ...prev,
      ]);
      setAddOpen(false);
      toast.success("Added!");
    }
    setForm({ title: "", type: "movie", status: "want", rating: 0, notes: "" });
  };

  const TYPE_EMOJI: Record<Show["type"], string> = {
    movie: "🎬",
    tv: "📺",
    documentary: "🎞️",
    anime: "🍙",
    other: "🎭",
  };

  const formContent = (
    <div className="space-y-3">
      <div>
        <label
          htmlFor="show-title"
          className="text-xs font-medium text-pocket-muted mb-1 block"
        >
          Title *
        </label>
        <Input
          id="show-title"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          placeholder="Title"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label
            htmlFor="show-type"
            className="text-xs font-medium text-pocket-muted mb-1 block"
          >
            Type
          </label>
          <Select
            value={form.type}
            onValueChange={(v) =>
              setForm((f) => ({ ...f, type: v as Show["type"] }))
            }
          >
            <SelectTrigger id="show-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(
                [
                  "movie",
                  "tv",
                  "documentary",
                  "anime",
                  "other",
                ] as Show["type"][]
              ).map((t) => (
                <SelectItem key={t} value={t} className="capitalize">
                  {TYPE_EMOJI[t]} {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label
            htmlFor="show-status"
            className="text-xs font-medium text-pocket-muted mb-1 block"
          >
            Status
          </label>
          <Select
            value={form.status}
            onValueChange={(v) =>
              setForm((f) => ({ ...f, status: v as Show["status"] }))
            }
          >
            <SelectTrigger id="show-status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="want">Want to Watch</SelectItem>
              <SelectItem value="watching">Watching</SelectItem>
              <SelectItem value="watched">Watched</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <p className="text-xs font-medium text-pocket-muted mb-1">Rating</p>
        <StarRating
          rating={form.rating}
          onChange={(n) => setForm((f) => ({ ...f, rating: n }))}
        />
      </div>
      <div>
        <label
          htmlFor="show-notes"
          className="text-xs font-medium text-pocket-muted mb-1 block"
        >
          Notes
        </label>
        <Textarea
          id="show-notes"
          value={form.notes}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          rows={2}
          placeholder="Thoughts..."
        />
      </div>
      <Button
        onClick={saveShow}
        className="w-full bg-pocket-burgundy text-pocket-cream hover:bg-pocket-burgundy/90"
      >
        {editShow ? "Update" : "Add"}
      </Button>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-pocket-muted">{shows.length} titles</p>
        <Button
          onClick={() => setAddOpen(true)}
          className="bg-pocket-burgundy text-pocket-cream hover:bg-pocket-burgundy/90"
        >
          <Plus size={14} className="mr-1" /> Add
        </Button>
      </div>

      {shows.length === 0 ? (
        <div className="pocket-card p-10 text-center">
          <p className="text-4xl mb-3">🎬</p>
          <p className="text-pocket-muted italic">
            Your watchlist is empty. What's next on queue?
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {shows.map((show) => (
              <motion.div
                key={show.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="pocket-card p-4"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{TYPE_EMOJI[show.type]}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[show.status]}`}
                    >
                      {STATUS_LABELS[show.status]}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setForm({
                          title: show.title,
                          type: show.type,
                          status: show.status,
                          rating: show.rating,
                          notes: show.notes,
                        });
                        setEditShow(show);
                      }}
                      className="text-pocket-muted hover:text-pocket-burgundy"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setShows((prev) => prev.filter((s) => s.id !== show.id))
                      }
                      className="text-pocket-muted hover:text-destructive"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                <h4 className="font-medium text-pocket-text text-sm mb-1">
                  {show.title}
                </h4>
                {show.rating > 0 && <StarRating rating={show.rating} />}
                {show.notes && (
                  <p className="text-xs text-pocket-muted mt-1 line-clamp-2 italic">
                    {show.notes}
                  </p>
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
              Add Show/Movie
            </DialogTitle>
          </DialogHeader>
          {formContent}
        </DialogContent>
      </Dialog>
      <Dialog open={!!editShow} onOpenChange={(o) => !o && setEditShow(null)}>
        <DialogContent className="bg-pocket-cream">
          <DialogHeader>
            <DialogTitle className="font-display text-pocket-burgundy">
              Edit
            </DialogTitle>
          </DialogHeader>
          {formContent}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function Reading() {
  return (
    <div className="min-h-full p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-display font-bold text-pocket-burgundy">
          Reading
        </h1>
        <div className="h-0.5 w-16 bg-pocket-gold rounded-full mt-2" />
        <p className="text-pocket-muted mt-2 text-sm">
          Track your books, shows, and movies.
        </p>
      </div>
      <Tabs defaultValue="books">
        <TabsList className="mb-6 bg-pocket-blush/20">
          <TabsTrigger
            value="books"
            className="data-[state=active]:bg-pocket-burgundy data-[state=active]:text-pocket-cream"
          >
            Books
          </TabsTrigger>
          <TabsTrigger
            value="shows"
            className="data-[state=active]:bg-pocket-burgundy data-[state=active]:text-pocket-cream"
          >
            Shows & Movies
          </TabsTrigger>
        </TabsList>
        <TabsContent value="books">
          <BooksTab />
        </TabsContent>
        <TabsContent value="shows">
          <ShowsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
