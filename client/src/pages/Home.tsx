import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "wouter";
import { Heart, MessageCircle, Share2, Download, Play, MapPin, Menu, X, Instagram, Youtube, Facebook, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";

const HERO_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663405254145/XVj2P2ZP8typMp4sb8ShKr/hero-bg-d2BeBHjzDBLYCZCWXrHF2v.webp";
const LOGO = "https://d2xsxph8kpxj0f.cloudfront.net/310519663405254145/XVj2P2ZP8typMp4sb8ShKr/wilds-aura/branding/wildsaura-logo.png";

// Session ID for anonymous likes
function getSessionId() {
  let sid = localStorage.getItem("wa_session");
  if (!sid) {
    sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem("wa_session", sid);
  }
  return sid;
}

const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "wildlife", label: "Wildlife" },
  { value: "landscape", label: "Landscape" },
  { value: "street", label: "Street" },
];

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [category, setCategory] = useState("all");
  const [menuOpen, setMenuOpen] = useState(false);
  const [sessionId] = useState(getSessionId);
  const [likedPosts, setLikedPosts] = useState<Record<number, boolean>>({});
  const [likeCounts, setLikeCounts] = useState<Record<number, number>>({});
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { data: posts = [], refetch } = trpc.posts.listWithStats.useQuery(
    { category: category === "all" ? undefined : category, sessionId },
    { refetchOnWindowFocus: false }
  );

  useEffect(() => {
    const counts: Record<number, number> = {};
    const liked: Record<number, boolean> = {};
    posts.forEach((p: any) => {
      counts[p.id] = p.likeCount;
      liked[p.id] = p.liked;
    });
    setLikeCounts(counts);
    setLikedPosts(liked);
  }, [posts]);

  const toggleLikeMutation = trpc.visitor.toggleLike.useMutation({
    onSuccess: (data, variables) => {
      setLikedPosts((prev) => ({ ...prev, [variables.postId]: data.liked }));
      setLikeCounts((prev) => ({
        ...prev,
        [variables.postId]: (prev[variables.postId] ?? 0) + (data.liked ? 1 : -1),
      }));
    },
  });

  const handleLike = (postId: number) => {
    toggleLikeMutation.mutate({ postId, sessionId });
  };

  const handleShare = (post: any) => {
    const url = `${window.location.origin}/post/${post.id}`;
    if (navigator.share) {
      navigator.share({ title: post.title, url });
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    }
  };

  const handleDownload = useCallback(async (post: any) => {
    if (!post.imageUrl) return;
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0);
        // Watermark
        const fontSize = Math.max(24, Math.floor(img.naturalWidth / 30));
        ctx.font = `bold ${fontSize}px 'Playfair Display', serif`;
        ctx.fillStyle = "rgba(255,255,255,0.55)";
        ctx.textAlign = "right";
        ctx.textBaseline = "bottom";
        const padding = fontSize * 0.6;
        ctx.fillText("© Wilds Aura", canvas.width - padding, canvas.height - padding);
        // Small logo text
        const smallFont = Math.max(14, Math.floor(fontSize * 0.55));
        ctx.font = `${smallFont}px 'Inter', sans-serif`;
        ctx.fillStyle = "rgba(255,255,255,0.40)";
        ctx.fillText("wilds_aura", canvas.width - padding, canvas.height - padding - fontSize - 4);
        // Download
        const a = document.createElement("a");
        a.download = `${post.title.replace(/\s+/g, "-")}-wilds-aura.jpg`;
        a.href = canvas.toDataURL("image/jpeg", 0.92);
        a.click();
      };
      img.src = post.imageUrl;
    } catch {
      toast.error("Download failed. Please try again.");
    }
  }, []);

  const scrollToGallery = () => {
    document.getElementById("gallery")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-background/80 backdrop-blur-md border-b border-border">
        <Link href="/" className="flex items-center gap-3">
          <img src={LOGO} alt="Wilds Aura" className="w-10 h-10 rounded-full object-cover" />
          <span className="font-serif text-xl font-semibold text-foreground">Wilds Aura</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          <span className="text-xs text-muted-foreground tracking-widest uppercase">Wildlife • Landscape • Street Photography</span>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <a href="https://www.facebook.com/Wildsaura" target="_blank" rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors">
            <Facebook size={18} />
          </a>
          <a href="https://www.instagram.com/wilds_aura" target="_blank" rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors">
            <Instagram size={18} />
          </a>
          <a href="https://www.youtube.com/@NatureFrame_com" target="_blank" rel="noopener noreferrer"
            className="text-muted-foreground hover:text-[#ff0000] transition-colors">
            <Youtube size={18} />
          </a>
          {user?.role === "admin" && (
            <Link href="/admin"
              className="px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-heading font-medium hover:bg-primary/90 transition-colors">
              Admin
            </Link>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button className="md:hidden text-foreground" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-background/95 backdrop-blur-md flex flex-col items-center justify-center gap-8 md:hidden">
          <Link href="/" onClick={() => setMenuOpen(false)} className="font-serif text-2xl text-foreground">Home</Link>
          <div className="flex gap-6">
            <a href="https://www.facebook.com/Wildsaura" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary"><Facebook size={24} /></a>
            <a href="https://www.instagram.com/wilds_aura" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary"><Instagram size={24} /></a>
            <a href="https://www.youtube.com/@NatureFrame_com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-[#ff0000]"><Youtube size={24} /></a>
          </div>
          {user?.role === "admin" && (
            <Link href="/admin" onClick={() => setMenuOpen(false)}
              className="px-6 py-2 rounded-full bg-primary text-primary-foreground font-heading font-medium">
              Admin Panel
            </Link>
          )}
        </div>
      )}

      {/* ── Hero Section ── */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <img
          src={HERO_BG}
          alt="Hero"
          className="absolute inset-0 w-full h-full object-cover scale-105"
          style={{ filter: "brightness(0.7)" }}
        />
        <div className="hero-overlay absolute inset-0" />
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/40 bg-primary/10 text-primary text-xs font-heading tracking-widest uppercase mb-6">
            Wildlife • Landscape • Street Photography
          </div>
          <h1 className="font-serif text-5xl md:text-7xl font-bold text-white leading-tight mb-4">
            Nature As You've
            <span className="block text-primary italic">Never Seen It</span>
          </h1>
          <p className="text-white/70 text-lg md:text-xl max-w-2xl mx-auto mb-8 leading-relaxed">
            Capturing the raw essence of wildlife and the soul of landscapes<br className="hidden md:block" />
            from Kathmandu to the world.
          </p>
          <button
            onClick={scrollToGallery}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-primary text-primary-foreground font-heading font-semibold text-base hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 shadow-lg"
          >
            Explore the Wilderness →
          </button>
        </div>
        <button
          onClick={scrollToGallery}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 hover:text-white transition-colors animate-bounce"
        >
          <ChevronDown size={32} />
        </button>
      </section>

      {/* ── Gallery Section ── */}
      <section id="gallery" className="py-16 px-4 md:px-8 max-w-screen-2xl mx-auto">
        {/* Category Filter */}
        <div className="flex items-center gap-3 mb-10 overflow-x-auto pb-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`flex-shrink-0 px-5 py-2 rounded-full font-heading text-sm font-medium transition-all ${
                category === cat.value
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "border border-border text-muted-foreground hover:border-primary hover:text-primary"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        {posts.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground">
            <div className="text-6xl mb-4">📷</div>
            <p className="font-serif text-xl">No posts yet. Check back soon!</p>
          </div>
        ) : (
          <div className="gallery-grid">
            {posts.map((post: any) => (
              <div key={post.id} className="gallery-item">
                <PostCard
                  post={post}
                  liked={likedPosts[post.id] ?? false}
                  likeCount={likeCounts[post.id] ?? 0}
                  onLike={() => handleLike(post.id)}
                  onShare={() => handleShare(post)}
                  onDownload={() => handleDownload(post)}
                  onOpen={() => setSelectedPost(post)}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border py-12 px-6 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <img src={LOGO} alt="Wilds Aura" className="w-8 h-8 rounded-full" />
          <span className="font-serif text-lg text-foreground">Wilds Aura</span>
        </div>
        <p className="text-muted-foreground text-sm mb-6">Capturing the wild, one frame at a time.</p>
        <div className="flex items-center justify-center gap-6 mb-6">
          <a href="https://www.facebook.com/Wildsaura" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm">
            <Facebook size={16} /> Facebook
          </a>
          <a href="https://www.instagram.com/wilds_aura" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm">
            <Instagram size={16} /> Instagram
          </a>
          <a href="https://www.youtube.com/@NatureFrame_com" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 text-muted-foreground hover:text-[#ff0000] transition-colors text-sm">
            <Youtube size={16} /> YouTube
          </a>
        </div>
        <p className="text-muted-foreground/50 text-xs">© {new Date().getFullYear()} Wilds Aura. All rights reserved. Photos watermarked on download.</p>
      </footer>

      {/* ── Post Modal ── */}
      {selectedPost && (
        <PostModal
          post={selectedPost}
          liked={likedPosts[selectedPost.id] ?? false}
          likeCount={likeCounts[selectedPost.id] ?? 0}
          onLike={() => handleLike(selectedPost.id)}
          onShare={() => handleShare(selectedPost)}
          onDownload={() => handleDownload(selectedPost)}
          onClose={() => setSelectedPost(null)}
          sessionId={sessionId}
        />
      )}
    </div>
  );
}

// ── Post Card Component ──────────────────────────────────────────────────────
function PostCard({ post, liked, likeCount, onLike, onShare, onDownload, onOpen }: {
  post: any; liked: boolean; likeCount: number;
  onLike: () => void; onShare: () => void; onDownload: () => void; onOpen: () => void;
}) {
  return (
    <div className="photo-card rounded-xl overflow-hidden bg-card border border-border group cursor-pointer" onClick={onOpen}>
      {post.type === "photo" ? (
        <div className="relative overflow-hidden">
          <img
            src={post.imageUrl}
            alt={post.title}
            className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      ) : (
        <div className="relative aspect-video bg-black overflow-hidden">
          {post.youtubeId ? (
            <img
              src={`https://img.youtube.com/vi/${post.youtubeId}/hqdefault.jpg`}
              alt={post.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <Play size={48} className="text-muted-foreground" />
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-black/60 flex items-center justify-center border-2 border-white/30 backdrop-blur-sm">
              <Play size={24} className="text-white ml-1" fill="white" />
            </div>
          </div>
        </div>
      )}

      <div className="p-4">
        <h3 className="font-serif text-base font-semibold text-foreground mb-1 line-clamp-1">{post.title}</h3>
        {post.caption && <p className="text-muted-foreground text-sm line-clamp-2 mb-3">{post.caption}</p>}
        {post.location && (
          <div className="flex items-center gap-1 text-muted-foreground text-xs mb-3">
            <MapPin size={12} /> {post.location}
          </div>
        )}
        <div className="flex items-center gap-3 pt-2 border-t border-border" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={onLike}
            className={`flex items-center gap-1.5 text-sm transition-colors ${liked ? "text-red-400" : "text-muted-foreground hover:text-red-400"}`}
          >
            <Heart size={16} fill={liked ? "currentColor" : "none"} />
            <span>{likeCount}</span>
          </button>
          <button onClick={onOpen} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
            <MessageCircle size={16} />
          </button>
          <button onClick={onShare} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
            <Share2 size={16} />
          </button>
          {post.type === "photo" && (
            <button onClick={onDownload} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-accent transition-colors ml-auto">
              <Download size={16} />
            </button>
          )}
          <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize">
            {post.category}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Post Modal ───────────────────────────────────────────────────────────────
function PostModal({ post, liked, likeCount, onLike, onShare, onDownload, onClose, sessionId }: {
  post: any; liked: boolean; likeCount: number; sessionId: string;
  onLike: () => void; onShare: () => void; onDownload: () => void; onClose: () => void;
}) {
  const { user } = useAuth();
  const [comment, setComment] = useState("");
  const [guestName, setGuestName] = useState("");

  const { data: comments = [], refetch: refetchComments } = trpc.posts.comments.useQuery({ postId: post.id });

  const addCommentMutation = trpc.visitor.addComment.useMutation({
    onSuccess: () => {
      setComment("");
      setGuestName("");
      refetchComments();
      toast.success("Comment added!");
    },
    onError: () => toast.error("Failed to add comment"),
  });

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    addCommentMutation.mutate({
      postId: post.id,
      content: comment.trim(),
      guestName: user ? undefined : (guestName.trim() || "Anonymous"),
    });
  };

  // Close on backdrop click
  const handleBackdrop = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={handleBackdrop}>
      <div className="bg-card border border-border rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row">
        {/* Media */}
        <div className="md:w-3/5 bg-black flex items-center justify-center">
          {post.type === "photo" ? (
            <img src={post.imageUrl} alt={post.title} className="w-full h-full object-contain max-h-[60vh] md:max-h-[90vh]" />
          ) : (
            <div className="w-full aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${post.youtubeId}?autoplay=1`}
                title={post.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}
        </div>

        {/* Info + Comments */}
        <div className="md:w-2/5 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-border flex items-start justify-between">
            <div>
              <h2 className="font-serif text-lg font-semibold text-foreground">{post.title}</h2>
              {post.location && (
                <div className="flex items-center gap-1 text-muted-foreground text-xs mt-1">
                  <MapPin size={11} /> {post.location}
                </div>
              )}
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground ml-2 flex-shrink-0">
              <X size={20} />
            </button>
          </div>

          {/* Caption */}
          {post.caption && (
            <div className="px-4 py-3 border-b border-border">
              <p className="text-sm text-muted-foreground">{post.caption}</p>
            </div>
          )}

          {/* Actions */}
          <div className="px-4 py-3 border-b border-border flex items-center gap-4">
            <button onClick={onLike} className={`flex items-center gap-1.5 text-sm transition-colors ${liked ? "text-red-400" : "text-muted-foreground hover:text-red-400"}`}>
              <Heart size={18} fill={liked ? "currentColor" : "none"} /> {likeCount}
            </button>
            <button onClick={onShare} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
              <Share2 size={18} /> Share
            </button>
            {post.type === "photo" && (
              <button onClick={onDownload} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-accent transition-colors">
                <Download size={18} /> Download
              </button>
            )}
          </div>

          {/* Comments */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {comments.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-4">No comments yet. Be the first!</p>
            ) : (
              comments.map((c: any) => (
                <div key={c.id} className="flex gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
                    {(c.guestName || "A")[0].toUpperCase()}
                  </div>
                  <div>
                    <span className="text-xs font-medium text-foreground">{c.guestName || "Anonymous"} </span>
                    <span className="text-sm text-muted-foreground">{c.content}</span>
                    <div className="text-xs text-muted-foreground/50 mt-0.5">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Comment Input */}
          <form onSubmit={handleSubmitComment} className="p-4 border-t border-border space-y-2">
            {!user && (
              <input
                type="text"
                placeholder="Your name (optional)"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            )}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                type="submit"
                disabled={!comment.trim() || addCommentMutation.isPending}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50 hover:bg-primary/90 transition-colors"
              >
                Post
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
