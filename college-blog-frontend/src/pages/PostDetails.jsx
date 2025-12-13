import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, MoreHorizontal } from "lucide-react";
import { PostCard } from "@/features/posts/components/PostCard";
import { CommentSection } from "@/features/posts/components/CommentSection";
import { API_BASE_URL } from "@/utils/api";

export default function PostDetails() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. Fetch Post Data
  useEffect(() => {
    const fetchPost = async () => {
      if (!postId) return;

      try {
        const res = await fetch(`${API_BASE_URL}/posts/${postId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!res.ok) {
          setError("Failed to load post.");
          return;
        }

        const data = await res.json();
        console.log(data);
        // Normalize counts and flags
        setPost({
          ...data,
          likeCount: typeof data.likeCount === "number" ? data.likeCount : 0,
          commentCount:
            typeof data.commentCount === "number" ? data.commentCount : 0,
          likedByCurrentUser: data.likedByCurrentUser ?? false,
        });
      } catch (e) {
        console.error(e);
        setError("Something went wrong while loading the post.");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId, token]);

  // State Handler: Likes (called from PostCard)
  const handleLikeUpdate = (newLikedStatus, newCount) => {
    setPost((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        likedByCurrentUser: newLikedStatus,
        likeCount: newCount,
      };
    });
  };

  // State Handler: Add Comment
  const handleCommentAdd = () => {
    setPost((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        commentCount: (prev.commentCount || 0) + 1,
      };
    });
  };

  // State Handler: Delete Comment
  const handleCommentDelete = () => {
    setPost((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        commentCount: Math.max(0, (prev.commentCount || 0) - 1),
      };
    });
  };

  // Initial comments load from CommentSection
  const handleCommentsLoaded = (count) => {
    setPost((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        commentCount: count,
      };
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center mt-20">
        <Loader2 className="animate-spin h-8 w-8 text-indigo-600" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="text-center mt-20 text-zinc-500">
        {error || "Post not found."}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg_white md:bg-transparent pb-20">
      {/* MOBILE HEADER */}
      <div className="sticky top-14 z-30 bg-white/95 backdrop-blur-md border-b border-zinc-100 h-12 flex items-center justify_between px-2 md:hidden transition-all">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="rounded-full -ml-1 text-zinc-700"
        >
          <ArrowLeft className="h-5 w-5" strokeWidth={2.5} />
        </Button>
        <span className="font-bold text-sm text-zinc-900 tracking-wide uppercase">
          Thread
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full text-zinc-400"
        >
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </div>

      {/* DESKTOP HEADER */}
      <div className="hidden md:flex items-center gap-2 max-w-2xl mx-auto mb-4 mt-2">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="text-zinc-500 hover:text-indigo-600 pl-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Feed
        </Button>
      </div>

      {/* CONTENT */}
      <div className="max-w-2xl mx-auto">
        <PostCard
          post={post}
          isDetails={true}
          onLikeToggle={handleLikeUpdate}
        />

        {/* COMMENTS SECTION */}
        <div id="comments-section" className="px-0 md:px-0 mt-4">
          <CommentSection
            postId={post.id}
            onLoaded={handleCommentsLoaded}
            onCommentAdded={handleCommentAdd}
            onCommentDeleted={handleCommentDelete}
          />
        </div>
      </div>
    </div>
  );
}
