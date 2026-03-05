import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useState, useRef, useCallback } from "react";
import { Link } from "wouter";
import {
  ArrowLeft, Plus, Trash2, Edit3, Eye, EyeOff, Image, Youtube,
  Upload, X, Check, MapPin, AlertCircle, LogIn
} from "lucide-react";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";

type Category = "wildlife" | "landscape" | "street" | "other";
type PostType = "photo" | "video";

const CATEGORIES: { value: Category; label: string }[] = [
  { value: "wildlife", label: "Wildlife" },
  { value: "landscape", label: "Landscape" },
  { value: "street", label: "Street" },
  { value: "other", label: "Other" },
];

export default function AdminPanel() {
  const { user, isAuthenticated, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<"posts" | "upload">("posts");
  const [uploadType, setUploadType] = useState<PostType>("photo");
  const [editingPost, setEditingPost] = useState<any>(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={48} className="text-muted-foreground mx-auto mb-4" />
          <h2 className="font-serif text-2xl text-foreground mb-2">Login Required</h2>
          <p className="text-muted-foreground mb-6">Please login to access the admin panel.</p>
          <a href={getLoginUrl()} className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors">
            <LogIn size={18} /> Login
          </a>
        </div>
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={48} className="text-destructive mx-auto mb-4" />
          <h2 className="font-serif text-2xl text-foreground mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-6">You don't have admin privileges.</p>
          <Link href="/" className="text-primary hover:underline">← Back to Gallery</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border px-6 py-4 flex items-center justify-between bg-card">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="font-serif text-xl font-semibold">Admin Panel</h1>
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">Wilds Aura</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{user.name}</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setActiveTab("posts")}
            className={`px-5 py-2.5 rounded-full font-heading text-sm font-medium transition-all ${activeTab === "posts" ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground hover:border-primary hover:text-primary"}`}
          >
            Manage Posts
          </button>
          <button
            onClick={() => { setActiveTab("upload"); setEditingPost(null); }}
            className={`px-5 py-2.5 rounded-full font-heading text-sm font-medium transition-all flex items-center gap-2 ${activeTab === "upload" ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground hover:border-primary hover:text-primary"}`}
          >
            <Plus size={16} /> New Post
          </button>
        </div>

        {activeTab === "posts" && (
          <PostsList
            onEdit={(post) => { setEditingPost(post); setActiveTab("upload"); }}
          />
        )}

        {activeTab === "upload" && (
          <UploadForm
            editingPost={editingPost}
            uploadType={uploadType}
            setUploadType={setUploadType}
            onSuccess={() => { setActiveTab("posts"); setEditingPost(null); }}
            onCancel={() => { setActiveTab("posts"); setEditingPost(null); }}
          />
        )}
      </div>
    </div>
  );
}

// ── Posts List ───────────────────────────────────────────────────────────────
function PostsList({ onEdit }: { onEdit: (post: any) => void }) {
  const { data: posts = [], refetch } = trpc.admin.listPosts.useQuery();
  const deletePostMutation = trpc.admin.deletePost.useMutation({
    onSuccess: () => { toast.success("Post deleted!"); refetch(); },
    onError: () => toast.error("Failed to delete post"),
  });
  const updatePostMutation = trpc.admin.updatePost.useMutation({
    onSuccess: () => { toast.success("Post updated!"); refetch(); },
  });

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this post?")) {
      deletePostMutation.mutate({ id });
    }
  };

  const handleTogglePublish = (post: any) => {
    updatePostMutation.mutate({ id: post.id, published: !post.published });
  };

  if (posts.length === 0) {
    return (
      <div className="text-center py-24 text-muted-foreground">
        <div className="text-5xl mb-4">📷</div>
        <p className="font-serif text-xl">No posts yet. Create your first post!</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {posts.map((post: any) => (
        <div key={post.id} className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors">
          {/* Thumbnail */}
          <div className="w-20 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
            {post.type === "photo" && post.imageUrl ? (
              <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
            ) : post.type === "video" && post.youtubeId ? (
              <img src={`https://img.youtube.com/vi/${post.youtubeId}/default.jpg`} alt={post.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                {post.type === "photo" ? <Image size={20} className="text-muted-foreground" /> : <Youtube size={20} className="text-muted-foreground" />}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-foreground truncate">{post.title}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${post.type === "video" ? "bg-red-500/20 text-red-400" : "bg-primary/20 text-primary"}`}>
                {post.type === "video" ? "YouTube" : "Photo"}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground flex-shrink-0 capitalize">{post.category}</span>
            </div>
            {post.caption && <p className="text-sm text-muted-foreground truncate">{post.caption}</p>}
            <p className="text-xs text-muted-foreground/50 mt-1">{new Date(post.createdAt).toLocaleDateString()}</p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => handleTogglePublish(post)}
              title={post.published ? "Unpublish" : "Publish"}
              className={`p-2 rounded-lg transition-colors ${post.published ? "text-primary hover:bg-primary/10" : "text-muted-foreground hover:bg-muted"}`}
            >
              {post.published ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
            <button
              onClick={() => onEdit(post)}
              className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
            >
              <Edit3 size={16} />
            </button>
            <button
              onClick={() => handleDelete(post.id)}
              disabled={deletePostMutation.isPending}
              className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Upload / Edit Form ───────────────────────────────────────────────────────
function UploadForm({ editingPost, uploadType, setUploadType, onSuccess, onCancel }: {
  editingPost: any;
  uploadType: PostType;
  setUploadType: (t: PostType) => void;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const isEditing = !!editingPost;
  const utils = trpc.useUtils();

  const [title, setTitle] = useState(editingPost?.title ?? "");
  const [caption, setCaption] = useState(editingPost?.caption ?? "");
  const [category, setCategory] = useState<Category>(editingPost?.category ?? "wildlife");
  const [location, setLocation] = useState(editingPost?.location ?? "");
  const [youtubeUrl, setYoutubeUrl] = useState(editingPost?.youtubeUrl ?? "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(editingPost?.imageUrl ?? null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentType: PostType = isEditing ? editingPost.type : uploadType;

  const createPhotoMutation = trpc.admin.createPhotoPost.useMutation({
    onSuccess: () => { toast.success("Photo post created!"); utils.admin.listPosts.invalidate(); onSuccess(); },
    onError: (e) => toast.error(e.message),
  });

  const createVideoMutation = trpc.admin.createVideoPost.useMutation({
    onSuccess: () => { toast.success("Video post created!"); utils.admin.listPosts.invalidate(); onSuccess(); },
    onError: (e) => toast.error(e.message),
  });

  const updateMutation = trpc.admin.updatePost.useMutation({
    onSuccess: () => { toast.success("Post updated!"); utils.admin.listPosts.invalidate(); onSuccess(); },
    onError: (e) => toast.error(e.message),
  });

  const handleFileChange = (file: File) => {
    if (!file.type.startsWith("image/")) { toast.error("Please select an image file"); return; }
    if (file.size > 20 * 1024 * 1024) { toast.error("Image must be under 20MB"); return; }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileChange(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { toast.error("Title is required"); return; }

    if (isEditing) {
      updateMutation.mutate({ id: editingPost.id, title, caption: caption || undefined, category, location: location || undefined, youtubeUrl: youtubeUrl || undefined });
      return;
    }

    if (currentType === "photo") {
      if (!imageFile) { toast.error("Please select an image"); return; }
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = (e.target?.result as string).split(",")[1];
        createPhotoMutation.mutate({
          title, caption: caption || undefined, category, location: location || undefined,
          imageData: base64, imageMime: imageFile.type, imageFileName: imageFile.name,
        });
      };
      reader.readAsDataURL(imageFile);
    } else {
      if (!youtubeUrl.trim()) { toast.error("YouTube URL is required"); return; }
      createVideoMutation.mutate({ title, caption: caption || undefined, category, location: location || undefined, youtubeUrl });
    }
  };

  const isPending = createPhotoMutation.isPending || createVideoMutation.isPending || updateMutation.isPending;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-card border border-border rounded-2xl p-6">
        <h2 className="font-serif text-xl font-semibold text-foreground mb-6">
          {isEditing ? "Edit Post" : "Create New Post"}
        </h2>

        {/* Type selector (only for new posts) */}
        {!isEditing && (
          <div className="flex gap-3 mb-6">
            <button
              type="button"
              onClick={() => setUploadType("photo")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all ${uploadType === "photo" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}
            >
              <Image size={20} /> Photo
            </button>
            <button
              type="button"
              onClick={() => setUploadType("video")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all ${uploadType === "video" ? "border-red-500 bg-red-500/10 text-red-400" : "border-border text-muted-foreground hover:border-red-500/50"}`}
            >
              <Youtube size={20} /> YouTube Video
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter post title..."
              className="w-full px-4 py-2.5 rounded-xl bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              required
            />
          </div>

          {/* Caption */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Caption</label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Describe this photo/video..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none"
            />
          </div>

          {/* Category + Location */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full px-4 py-2.5 rounded-xl bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                <MapPin size={14} className="inline mr-1" />Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Chitwan, Nepal"
                className="w-full px-4 py-2.5 rounded-xl bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              />
            </div>
          </div>

          {/* Photo Upload */}
          {currentType === "photo" && !isEditing && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Photo *</label>
              {imagePreview ? (
                <div className="relative rounded-xl overflow-hidden">
                  <img src={imagePreview} alt="Preview" className="w-full max-h-64 object-cover" />
                  <button
                    type="button"
                    onClick={() => { setImageFile(null); setImagePreview(null); }}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${isDragging ? "border-primary bg-primary/10" : "border-border hover:border-primary/50 hover:bg-muted/30"}`}
                >
                  <Upload size={32} className="mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Drag & drop or <span className="text-primary">browse</span></p>
                  <p className="text-xs text-muted-foreground/50 mt-1">JPG, PNG, WebP — max 20MB</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileChange(f); }}
                  />
                </div>
              )}
            </div>
          )}

          {/* YouTube URL */}
          {currentType === "video" && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">YouTube URL *</label>
              <input
                type="url"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full px-4 py-2.5 rounded-xl bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              />
              {youtubeUrl && (() => {
                const match = youtubeUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
                const id = match?.[1];
                return id ? (
                  <div className="mt-3 rounded-xl overflow-hidden aspect-video">
                    <iframe src={`https://www.youtube.com/embed/${id}`} className="w-full h-full" allowFullScreen title="Preview" />
                  </div>
                ) : null;
              })()}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-heading font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isPending ? (
                <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                <Check size={18} />
              )}
              {isEditing ? "Save Changes" : "Publish Post"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 rounded-xl border border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors font-heading font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
