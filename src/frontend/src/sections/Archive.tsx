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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { AnimatePresence, motion } from "@/lib/motion";
import { Image as ImageIcon, Plus, Star, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLocalStorage } from "../hooks/useLocalStorage";
import {
  type Dish,
  type Photo,
  type Place,
  genId,
  today,
} from "../types/pocket";

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Best Photos
function PhotosTab() {
  const [photos, setPhotos] = useLocalStorage<Photo[]>("pocket_photos", []);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    dateTaken: today(),
    dataUrl: "",
  });
  const [loading, setLoading] = useState(false);
  const [viewPhoto, setViewPhoto] = useState<Photo | null>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const dataUrl = await readFileAsBase64(file);
      setForm((f) => ({ ...f, dataUrl }));
    } finally {
      setLoading(false);
    }
  };

  const save = () => {
    if (!form.title.trim() || !form.dataUrl) return;
    setPhotos((prev) => [{ id: genId(), ...form }, ...prev]);
    setAddOpen(false);
    setForm({ title: "", description: "", dateTaken: today(), dataUrl: "" });
    toast.success("Photo saved! 📸");
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-pocket-muted">{photos.length} best photos</p>
        <Button
          onClick={() => setAddOpen(true)}
          className="bg-pocket-burgundy text-pocket-cream hover:bg-pocket-burgundy/90"
        >
          <Plus size={14} className="mr-1" /> Add Photo
        </Button>
      </div>

      {photos.length === 0 ? (
        <div className="pocket-card p-10 text-center">
          <p className="text-4xl mb-3">📸</p>
          <p className="text-pocket-muted italic">
            Preserve your best moments here.
          </p>
        </div>
      ) : (
        <div className="masonry-grid">
          {photos.map((photo) => (
            <motion.div
              key={photo.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="pocket-card overflow-hidden cursor-pointer"
              onClick={() => setViewPhoto(photo)}
            >
              <img
                src={photo.dataUrl}
                alt={photo.title}
                className="w-full object-cover"
                style={{ maxHeight: 300 }}
              />
              <div className="p-3">
                <h4 className="font-display font-bold text-pocket-burgundy text-sm">
                  {photo.title}
                </h4>
                {photo.description && (
                  <p className="text-xs text-pocket-muted mt-0.5 line-clamp-2">
                    {photo.description}
                  </p>
                )}
                <p className="text-xs text-pocket-muted/60 mt-0.5">
                  {photo.dateTaken}
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
                  }}
                  className="text-pocket-muted hover:text-destructive text-xs mt-1"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="bg-pocket-cream">
          <DialogHeader>
            <DialogTitle className="font-display text-pocket-burgundy">
              Add Photo
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="border-2 border-dashed border-pocket-blush rounded-2xl p-6 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleFile}
                id="photo-upload"
                className="hidden"
              />
              <label htmlFor="photo-upload" className="cursor-pointer">
                {form.dataUrl ? (
                  <img
                    src={form.dataUrl}
                    alt="Preview"
                    className="max-h-40 mx-auto rounded-xl object-cover"
                  />
                ) : (
                  <>
                    <ImageIcon
                      size={32}
                      className="mx-auto text-pocket-muted mb-2"
                    />
                    <p className="text-sm text-pocket-muted">
                      {loading ? "Loading..." : "Click to upload photo"}
                    </p>
                  </>
                )}
              </label>
            </div>
            <div>
              <label
                htmlFor="photo-title"
                className="text-xs font-medium text-pocket-muted mb-1 block"
              >
                Title *
              </label>
              <Input
                id="photo-title"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="Photo title"
              />
            </div>
            <div>
              <label
                htmlFor="photo-desc"
                className="text-xs font-medium text-pocket-muted mb-1 block"
              >
                Description
              </label>
              <Textarea
                id="photo-desc"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                rows={2}
              />
            </div>
            <div>
              <label
                htmlFor="photo-date"
                className="text-xs font-medium text-pocket-muted mb-1 block"
              >
                Date Taken
              </label>
              <Input
                id="photo-date"
                type="date"
                value={form.dateTaken}
                onChange={(e) =>
                  setForm((f) => ({ ...f, dateTaken: e.target.value }))
                }
              />
            </div>
            <Button
              onClick={save}
              disabled={!form.dataUrl || !form.title}
              className="w-full bg-pocket-burgundy text-pocket-cream hover:bg-pocket-burgundy/90 disabled:opacity-40"
            >
              Save Photo
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewPhoto} onOpenChange={(o) => !o && setViewPhoto(null)}>
        <DialogContent className="bg-pocket-cream max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-pocket-burgundy">
              {viewPhoto?.title}
            </DialogTitle>
          </DialogHeader>
          {viewPhoto && (
            <div>
              <img
                src={viewPhoto.dataUrl}
                alt={viewPhoto.title}
                className="w-full rounded-xl max-h-96 object-contain"
              />
              <p className="text-xs text-pocket-muted mt-2">
                {viewPhoto.dateTaken}
              </p>
              {viewPhoto.description && (
                <p className="text-sm text-pocket-text mt-1">
                  {viewPhoto.description}
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Dishes
function DishesTab() {
  const [dishes, setDishes] = useLocalStorage<Dish[]>("pocket_dishes", []);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    cuisineType: "",
    dataUrl: "",
  });
  const [loading, setLoading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const dataUrl = await readFileAsBase64(file);
      setForm((f) => ({ ...f, dataUrl }));
    } finally {
      setLoading(false);
    }
  };

  const save = () => {
    if (!form.name.trim()) return;
    setDishes((prev) => [{ id: genId(), ...form }, ...prev]);
    setAddOpen(false);
    setForm({ name: "", description: "", cuisineType: "", dataUrl: "" });
    toast.success("Dish added! 🍽️");
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-pocket-muted">{dishes.length} dishes</p>
        <Button
          onClick={() => setAddOpen(true)}
          className="bg-pocket-burgundy text-pocket-cream hover:bg-pocket-burgundy/90"
        >
          <Plus size={14} className="mr-1" /> Add Dish
        </Button>
      </div>

      {dishes.length === 0 ? (
        <div className="pocket-card p-10 text-center">
          <p className="text-4xl mb-3">🍽️</p>
          <p className="text-pocket-muted italic">
            Your personal food diary. Add dishes you love!
          </p>
        </div>
      ) : (
        <div className="masonry-grid">
          {dishes.map((dish) => (
            <motion.div
              key={dish.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="pocket-card overflow-hidden"
            >
              {dish.dataUrl && (
                <img
                  src={dish.dataUrl}
                  alt={dish.name}
                  className="w-full object-cover"
                  style={{ maxHeight: 220 }}
                />
              )}
              {!dish.dataUrl && (
                <div className="w-full h-32 flex items-center justify-center text-4xl bg-pocket-blush/20">
                  🍽️
                </div>
              )}
              <div className="p-3">
                <h4 className="font-display font-bold text-pocket-burgundy text-sm">
                  {dish.name}
                </h4>
                {dish.cuisineType && (
                  <span className="pocket-badge-blush text-xs">
                    {dish.cuisineType}
                  </span>
                )}
                {dish.description && (
                  <p className="text-xs text-pocket-muted mt-1 line-clamp-2">
                    {dish.description}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() =>
                    setDishes((prev) => prev.filter((d) => d.id !== dish.id))
                  }
                  className="text-pocket-muted hover:text-destructive text-xs mt-1"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="bg-pocket-cream">
          <DialogHeader>
            <DialogTitle className="font-display text-pocket-burgundy">
              Add Dish
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="border-2 border-dashed border-pocket-blush rounded-2xl p-6 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleFile}
                id="dish-upload"
                className="hidden"
              />
              <label htmlFor="dish-upload" className="cursor-pointer">
                {form.dataUrl ? (
                  <img
                    src={form.dataUrl}
                    alt="Preview"
                    className="max-h-36 mx-auto rounded-xl object-cover"
                  />
                ) : (
                  <>
                    <span className="text-3xl mb-2 block">🍽️</span>
                    <p className="text-sm text-pocket-muted">
                      {loading ? "Loading..." : "Click to add photo"}
                    </p>
                  </>
                )}
              </label>
            </div>
            <div>
              <label
                htmlFor="dish-name"
                className="text-xs font-medium text-pocket-muted mb-1 block"
              >
                Dish Name *
              </label>
              <Input
                id="dish-name"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="e.g. Grandma's Pasta"
              />
            </div>
            <div>
              <label
                htmlFor="dish-cuisine"
                className="text-xs font-medium text-pocket-muted mb-1 block"
              >
                Cuisine Type
              </label>
              <Input
                id="dish-cuisine"
                value={form.cuisineType}
                onChange={(e) =>
                  setForm((f) => ({ ...f, cuisineType: e.target.value }))
                }
                placeholder="Italian, Mexican, Fusion..."
              />
            </div>
            <div>
              <label
                htmlFor="dish-desc"
                className="text-xs font-medium text-pocket-muted mb-1 block"
              >
                Description
              </label>
              <Textarea
                id="dish-desc"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                rows={2}
                placeholder="Why you love it..."
              />
            </div>
            <Button
              onClick={save}
              disabled={!form.name}
              className="w-full bg-pocket-burgundy text-pocket-cream hover:bg-pocket-burgundy/90 disabled:opacity-40"
            >
              Add Dish
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Places
function PlacesTab() {
  const [places, setPlaces] = useLocalStorage<Place[]>("pocket_places", []);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({
    country: "",
    city: "",
    description: "",
    priority: 2 as 1 | 2 | 3,
    visited: false,
  });

  const save = () => {
    if (!form.country.trim()) return;
    setPlaces((prev) => [{ id: genId(), ...form }, ...prev]);
    setAddOpen(false);
    setForm({
      country: "",
      city: "",
      description: "",
      priority: 2,
      visited: false,
    });
    toast.success("Place added! 🌍");
  };

  const toggleVisited = (id: string) => {
    setPlaces((prev) =>
      prev.map((p) => (p.id === id ? { ...p, visited: !p.visited } : p)),
    );
  };

  const PRIORITY_STARS = (n: 1 | 2 | 3) => "★".repeat(n) + "☆".repeat(3 - n);

  const sorted = [...places].sort((a, b) => b.priority - a.priority);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-pocket-muted">
          {places.length} places · {places.filter((p) => !p.visited).length} to
          visit
        </p>
        <Button
          onClick={() => setAddOpen(true)}
          className="bg-pocket-burgundy text-pocket-cream hover:bg-pocket-burgundy/90"
        >
          <Plus size={14} className="mr-1" /> Add Place
        </Button>
      </div>

      {places.length === 0 ? (
        <div className="pocket-card p-10 text-center">
          <p className="text-4xl mb-3">🌍</p>
          <p className="text-pocket-muted italic">
            The world is waiting. Where do you want to go?
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {sorted.map((place) => (
              <motion.div
                key={place.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`pocket-card p-4 ${place.visited ? "opacity-70" : ""}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-display font-bold text-pocket-burgundy text-base">
                      {place.city || place.country}
                    </h4>
                    {place.city && (
                      <p className="text-xs text-pocket-muted">
                        {place.country}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-pocket-gold text-sm">
                      {PRIORITY_STARS(place.priority)}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setPlaces((prev) =>
                          prev.filter((x) => x.id !== place.id),
                        )
                      }
                      className="text-pocket-muted hover:text-destructive"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                {place.description && (
                  <p className="text-xs text-pocket-text mb-2">
                    {place.description}
                  </p>
                )}
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={place.visited}
                    onCheckedChange={() => toggleVisited(place.id)}
                    className="border-pocket-blush data-[state=checked]:bg-pocket-burgundy"
                  />
                  <span
                    className={`text-xs ${place.visited ? "line-through text-pocket-muted" : "text-pocket-text"}`}
                  >
                    {place.visited ? "Visited! ✓" : "Want to visit"}
                  </span>
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
              Add Place
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="place-country"
                  className="text-xs font-medium text-pocket-muted mb-1 block"
                >
                  Country *
                </label>
                <Input
                  id="place-country"
                  value={form.country}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, country: e.target.value }))
                  }
                  placeholder="e.g. Japan"
                />
              </div>
              <div>
                <label
                  htmlFor="place-city"
                  className="text-xs font-medium text-pocket-muted mb-1 block"
                >
                  City
                </label>
                <Input
                  id="place-city"
                  value={form.city}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, city: e.target.value }))
                  }
                  placeholder="e.g. Kyoto"
                />
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-pocket-muted mb-1">
                Priority
              </p>
              <div className="flex gap-2 mt-1">
                {([1, 2, 3] as const).map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, priority: n }))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${form.priority === n ? "bg-pocket-burgundy text-pocket-cream" : "bg-pocket-blush/30 text-pocket-muted hover:bg-pocket-blush/50"}`}
                  >
                    {"★".repeat(n)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label
                htmlFor="place-desc"
                className="text-xs font-medium text-pocket-muted mb-1 block"
              >
                Why you want to go
              </label>
              <Textarea
                id="place-desc"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                rows={2}
              />
            </div>
            <Button
              onClick={save}
              className="w-full bg-pocket-burgundy text-pocket-cream hover:bg-pocket-burgundy/90"
            >
              Add Place
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function Archive() {
  return (
    <div className="min-h-full p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-display font-bold text-pocket-burgundy">
          Archive
        </h1>
        <div className="h-0.5 w-16 bg-pocket-gold rounded-full mt-2" />
        <p className="text-pocket-muted mt-2 text-sm">
          Your personal gallery — photos, food, and dream destinations.
        </p>
      </div>
      <Tabs defaultValue="photos">
        <TabsList className="mb-6 bg-pocket-blush/20">
          <TabsTrigger
            value="photos"
            className="data-[state=active]:bg-pocket-burgundy data-[state=active]:text-pocket-cream"
          >
            Best Photos
          </TabsTrigger>
          <TabsTrigger
            value="dishes"
            className="data-[state=active]:bg-pocket-burgundy data-[state=active]:text-pocket-cream"
          >
            Dishes I Like
          </TabsTrigger>
          <TabsTrigger
            value="places"
            className="data-[state=active]:bg-pocket-burgundy data-[state=active]:text-pocket-cream"
          >
            Places to Travel
          </TabsTrigger>
        </TabsList>
        <TabsContent value="photos">
          <PhotosTab />
        </TabsContent>
        <TabsContent value="dishes">
          <DishesTab />
        </TabsContent>
        <TabsContent value="places">
          <PlacesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
