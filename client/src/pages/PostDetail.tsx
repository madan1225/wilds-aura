import { useRoute, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Heart, Share2, Download, MapPin, Play } from "lucide-react";
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

function getSessionId() {
  let sid = localStorage.getItem("wa_session");
  if (!sid) {
    sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem("wa_session", sid);
  }
  return sid;
}

export default function PostDetail() {
  const [, params] = useRoute("/post/:id");
  const postId = parseInt(params?.id ?? "0");
  const { user } = useAuth();
  const [sessionId] = useState(getSessionId);
  const [comment, setComment] = useState("");
  const [guestName, setGuestName] = useState("");

  const { data: posts = [] } = trpc.posts.listWithStats.useQuery({ sessionId });
  const post = posts.find((p: any) => p.id === postId);

  const { data: comments = [], refetch: refetchComments } = trpc.posts.comments.useQuery(
    { postId },
    { enabled: !!postId }
  );

  const [liked, setLiked] = useState(post?.liked ?? false);
  const [likeCount, setLikeCount] = useState(post?.likeCount ?? 0);

  const toggleLikeMutation = trpc.visitor.toggleLike.useMutation({
    onSuccess: (data) => {
      setLiked(data.liked);
      setLikeCount((prev) => prev + (data.liked ? 1 : -1));
    },
  });

  const addCommentMutation = trpc.visitor.addComment.useMutation({
    onSuccess: () => {
      setComment("");
      setGuestName("");
      refetchComments();
      toast.success("Comment added!");
    },
  });

  const handleDownload = useCallback(async () => {
    if (!post?.imageUrl) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      const fontSize = Math.max(24, Math.floor(img.naturalWidth / 30));
      ctx.font = `bold ${fontSize}px serif`;
      ctx.fillStyle = "rgba(255,255,255,0.55)";
      ctx.textAlign = "right";
      ctx.textBaseline = "bottom";
      ctx.fillText("© Wilds Aura", canvas.width - fontSize * 0.6, canvas.height - fontSize * 0.6);
      const a = document.createElement("a");
      a.download = `${post.title.replace(/\s+/g, "-")}-wilds-aura.jpg`;
      a.href = canvas.toDataURL("image/jpeg", 0.92);
      a.click();
    };
    img.src = post.imageUrl;
  }, [post]);

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: post?.title, url });
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Link copied!");
    }
  };

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Post not found</p>
          <Link href="/" className="text-primary hover:underline">← Back to Gallery</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6">
          <ArrowLeft size={18} /> Back to Gallery
        </Link>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Media */}
          <div className="rounded-2xl overflow-hidden bg-black">
            {post.type === "photo" ? (
              <img src={post.imageUrl ?? ""} alt={post.title} className="w-full object-contain" />
            ) : (
              <div className="aspect-video">
                <iframe
                  src={`https://www.youtube.com/embed/${post.youtubeId}`}
                  title={post.title}
                  className="w-full h-full"
                  allowFullScreen
                />
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground mb-2">{post.title}</h1>
            {post.location && (
              <div className="flex items-center gap-1 text-muted-foreground text-sm mb-4">
                <MapPin size={14} /> {post.location}
              </div>
            )}
            {post.caption && <p className="text-muted-foreground mb-6 leading-relaxed">{post.caption}</p>}

            <div className="flex items-center gap-4 mb-8">
              <button
                onClick={() => toggleLikeMutation.mutate({ postId, sessionId })}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-colors ${liked ? "border-red-400 text-red-400" : "border-border text-muted-foreground hover:border-red-400 hover:text-red-400"}`}
              >
                <Heart size={18} fill={liked ? "currentColor" : "none"} /> {likeCount}
              </button>
              <button onClick={handleShare} className="flex items-center gap-2 px-4 py-2 rounded-full border border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                <Share2 size={18} /> Share
              </button>
              {post.type === "photo" && (
                <button onClick={handleDownload} className="flex items-center gap-2 px-4 py-2 rounded-full border border-border text-muted-foreground hover:border-accent hover:text-accent transition-colors">
                  <Download size={18} /> Download
                </button>
              )}
            </div>

            {/* Comments */}
            <div>
              <h3 className="font-heading font-semibold text-foreground mb-4">Comments ({comments.length})</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                {comments.map((c: any) => (
                  <div key={c.id} className="flex gap-2">
                    <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
                      {(c.guestName || "A")[0].toUpperCase()}
                    </div>
                    <div>
                      <span className="text-xs font-medium text-foreground">{c.guestName || "Anonymous"} </span>
                      <span className="text-sm text-muted-foreground">{c.content}</span>
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={(e) => { e.preventDefault(); if (comment.trim()) addCommentMutation.mutate({ postId, content: comment.trim(), guestName: guestName || undefined }); }} className="space-y-2">
                {!user && (
                  <input type="text" placeholder="Your name (optional)" value={guestName} onChange={(e) => setGuestName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                )}
                <div className="flex gap-2">
                  <input type="text" placeholder="Add a comment..." value={comment} onChange={(e) => setComment(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                  <button type="submit" disabled={!comment.trim()} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50">Post</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
