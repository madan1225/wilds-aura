import { trpc } from "@/lib/trpc";
import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "wouter";
import { Heart, MessageCircle, Share2, Download, Play, MapPin, Menu, X, Instagram, Youtube, Facebook, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";
import { addWatermarkToImage } from "@/lib/watermark";
import { useAuth } from "@/_core/hooks/useAuth";

const HERO_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663405254145/XVj2P2ZP8typMp4sb8ShKr/hero-bg-d2BeBHjzDBLYCZCWXrHF2v.webp";
const LOGO = "https://d2xsxph8kpxj0f.cloudfront.net/310519663405254145/XVj2P2ZP8typMp4sb8ShKr/wildsaura-logo-black-bg-QTJLVvTLmD697CTGQqYF2Q.webp";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [sessionId] = useState(() => Math.random().toString(36).substring(7));
  const [likedPosts, setLikedPosts] = useState<Record<number, boolean>>({});
  const [likeCounts, setLikeCounts] = useState<Record<number, number>>({});
  const [menuOpen, setMenuOpen] = useState(false);
  const galleryRef = useRef<HTMLDivElement>(null);

  const { data: postsData = [], isLoading } = trpc.posts.listWithStats.useQuery({
    category: selectedCategory === "all" ? undefined : selectedCategory,
    sessionId,
  });

  useEffect(() => {
    if (postsData.length > 0) {
      setPosts(postsData);
      const liked: Record<number, boolean> = {};
      const counts: Record<number, number> = {};
      postsData.forEach((p) => {
        liked[p.id] = p.liked;
        counts[p.id] = p.likeCount;
      });
      setLikedPosts(liked);
      setLikeCounts(counts);
    }
  }, [postsData]);

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
    if (!post.imageUrl && !post.videoUrl) return;
    try {
      if (post.imageUrl) {
        toast.loading("Preparing download...");
        const watermarkedUrl = await addWatermarkToImage(post.imageUrl, LOGO, post.title);
        const a = document.createElement("a");
        a.download = `${post.title.replace(/\s+/g, "-")}-wilds-aura.jpg`;
        a.href = watermarkedUrl;
        a.click();
        toast.success("Photo downloaded!");
      } else if (post.videoUrl) {
        const a = document.createElement("a");
        a.download = `${post.title.replace(/\s+/g, "-")}-wilds-aura.mp4`;
        a.href = post.videoUrl;
        a.click();
        toast.success("Video download started!");
      }
    } catch (error) {
      toast.error("Download failed. Please try again.");
      console.error(error);
    }
  }, []);

  const scrollToGallery = () => {
    document.getElementById("gallery")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm px-4 md:px-8 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-serif text-xl font-bold text-foreground hover:opacity-80 transition-opacity">
          <img src={LOGO} alt="Wilds Aura" className="w-8 h-8 rounded-full" />
          Wilds Aura
        </Link>

        {/* Desktop menu */}
        <div className="hidden md:flex items-center gap-6">
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
          {["all", "wildlife", "landscape", "street"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-2 rounded-full font-heading font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "border border-border text-foreground hover:border-primary"
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {/* Posts Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : posts.length > 0 ? (
          <div ref={galleryRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                liked={likedPosts[post.id] ?? false}
                likeCount={likeCounts[post.id] ?? 0}
                onLike={() => handleLike(post.id)}
                onShare={() => handleShare(post)}
                onDownload={() => handleDownload(post)}
                onOpen={() => setSelectedPost(post)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">No posts yet. Check back soon!</p>
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
          ) : post.videoUrl ? (
            <video
              src={post.videoUrl}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <Play size={48} className="text-muted-foreground" />
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center">
            <Play size={64} className="text-white/80" />
          </div>
        </div>
      )}
      <div className="p-4">
        <h3 className="font-serif text-lg font-bold text-foreground mb-2 line-clamp-2">{post.title}</h3>
        {post.location && (
          <p className="flex items-center gap-1 text-muted-foreground text-sm mb-3">
            <MapPin size={14} /> {post.location}
          </p>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={(e) => { e.stopPropagation(); onLike(); }} className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
              <Heart size={18} fill={liked ? "currentColor" : "none"} className={liked ? "text-primary" : ""} />
              <span className="text-xs">{likeCount}</span>
            </button>
            <button onClick={(e) => { e.stopPropagation(); onShare(); }} className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
              <Share2 size={18} />
            </button>
          </div>
          <button onClick={(e) => { e.stopPropagation(); onDownload(); }} className="text-muted-foreground hover:text-primary transition-colors">
            <Download size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Post Modal Component ──────────────────────────────────────────────────────
function PostModal({ post, liked, likeCount, onLike, onShare, onDownload, onClose, sessionId }: {
  post: any; liked: boolean; likeCount: number;
  onLike: () => void; onShare: () => void; onDownload: () => void; onClose: () => void; sessionId: string;
}) {
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [guestName, setGuestName] = useState("");

  const { data: commentsData = [] } = trpc.posts.comments.useQuery({ postId: post.id });
  const addCommentMutation = trpc.visitor.addComment.useMutation({
    onSuccess: () => {
      setNewComment("");
      setGuestName("");
    },
  });

  useEffect(() => {
    setComments(commentsData);
  }, [commentsData]);

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    addCommentMutation.mutate({
      postId: post.id,
      content: newComment,
      guestName: guestName || "Anonymous",
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Media */}
        {post.type === "photo" ? (
          <img src={post.imageUrl} alt={post.title} className="w-full object-cover" />
        ) : post.youtubeId ? (
          <iframe
            width="100%"
            height="400"
            src={`https://www.youtube.com/embed/${post.youtubeId}`}
            frameBorder="0"
            allowFullScreen
          />
        ) : post.videoUrl ? (
          <video src={post.videoUrl} controls className="w-full" />
        ) : null}

        {/* Content */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="font-serif text-2xl font-bold text-foreground mb-2">{post.title}</h2>
              {post.location && (
                <p className="flex items-center gap-1 text-muted-foreground">
                  <MapPin size={16} /> {post.location}
                </p>
              )}
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <X size={24} />
            </button>
          </div>

          {post.caption && <p className="text-foreground/80 mb-6">{post.caption}</p>}

          {/* Actions */}
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
            <button onClick={onLike} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
              <Heart size={20} fill={liked ? "currentColor" : "none"} className={liked ? "text-primary" : ""} />
              <span>{likeCount}</span>
            </button>
            <button onClick={onShare} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
              <Share2 size={20} />
            </button>
            <button onClick={onDownload} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
              <Download size={20} />
            </button>
          </div>

          {/* Comments */}
          <div className="mb-6">
            <h3 className="font-heading font-semibold text-foreground mb-4">Comments ({comments.length})</h3>
            <div className="space-y-4 mb-6 max-h-48 overflow-y-auto">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-background p-3 rounded-lg">
                  <p className="font-medium text-sm text-foreground">{comment.guestName || "Anonymous"}</p>
                  <p className="text-muted-foreground text-sm mt-1">{comment.content}</p>
                </div>
              ))}
            </div>

            {/* Add Comment */}
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Your name (optional)"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground placeholder-muted-foreground text-sm"
              />
              <textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground placeholder-muted-foreground text-sm resize-none"
                rows={3}
              />
              <button
                onClick={handleAddComment}
                disabled={addCommentMutation.isPending}
                className="w-full px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {addCommentMutation.isPending ? "Posting..." : "Post Comment"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
