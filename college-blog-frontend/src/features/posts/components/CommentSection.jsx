import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send, Trash2 } from "lucide-react";
import { API_BASE_URL } from "@/utils/api";
import VerificationBadge from "@/components/VerificationBadge";

export function CommentSection({
  postId,
  onCommentAdded,
  onCommentDeleted,
  onLoaded,
}) {
  const token = localStorage.getItem("token");

  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // helper: build full URL for profile image from backend
  const getAuthorImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${API_BASE_URL.replace("/api/v1", "")}${path}`;
  };

  useEffect(() => {
    const initData = async () => {
      try {
        // 1. current user (for delete permission)
        const userRes = await fetch(`${API_BASE_URL}/user/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (userRes.ok) setCurrentUser(await userRes.json());

        // 2. comments
        const commentsRes = await fetch(
          `${API_BASE_URL}/posts/${postId}/comments`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (commentsRes.ok) {
          const data = await commentsRes.json();
          setComments(data);

          if (onLoaded) onLoaded(data.length);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    if (postId) initData();
  }, [postId, token]);

  const handleSubmit = async () => {
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: newComment }),
      });

      if (res.ok) {
        const savedComment = await res.json();
        setComments((prev) => [...prev, savedComment]);
        setNewComment("");
        if (onCommentAdded) onCommentAdded();
      }
    } catch (e) {
      alert("Failed to comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!confirm("Delete this comment?")) return;

    const previousComments = [...comments];
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    if (onCommentDeleted) onCommentDeleted();

    try {
      const res = await fetch(
        `${API_BASE_URL}/posts/${postId}/comments/${commentId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Failed");
    } catch (e) {
      setComments(previousComments);
      if (onCommentAdded) onCommentAdded(); // revert count
      alert("Could not delete comment.");
    }
  };

  return (
    <div className="mt-6" id="comments-section">
      <h3 className="text-lg font-bold text-slate-900 mb-4 px-1">
        Comments{" "}
        <span className="text-slate-400 font-normal text-sm ml-1">
          ({comments.length})
        </span>
      </h3>

      {/* New comment composer */}
      <div className="flex gap-3 mb-8 bg-white p-4 rounded-xl border border-zinc-200 shadow-sm">
        <div className="flex-1">
          <Textarea
            placeholder="Write a thoughtful comment..."
            className="min-h-[80px] border-zinc-200 focus-visible:ring-indigo-500 resize-none bg-zinc-50"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <div className="flex justify-end mt-2">
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={submitting || !newComment.trim()}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Send className="h-3 w-3 mr-2" /> Post
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Comments list */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="animate-spin text-slate-400" />
        </div>
      ) : (
        <div className="space-y-6">
          {comments.length === 0 && (
            <p className="text-center text-slate-400 py-4 italic">
              No comments yet.
            </p>
          )}

          {comments.map((comment) => (
            <div
              key={comment.id}
              className="flex gap-3 group animate-in fade-in slide-in-from-bottom-2 relative"
            >
              {/* Avatar with backend profile photo */}
              <Avatar className="h-8 w-8 mt-1 border border-zinc-200">
                <AvatarImage
                  src={getAuthorImageUrl(comment.authorImageUrl)}
                  className="object-cover"
                />
                <AvatarFallback>
                  {comment.authorName?.[0] || "U"}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="bg-zinc-50 p-3 rounded-2xl rounded-tl-none border border-zinc-100 hover:bg-white transition-colors shadow-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-slate-900">
                      {comment.authorName}
                    </span>

                    {(comment.authorVerified ||
                      comment.authorRole === "TEACHER") && (
                      <VerificationBadge />
                    )}

                    <span className="text-xs text-slate-400">
                      •{" "}
                      {new Date(comment.createdAt).toLocaleDateString(
                        "en-IN",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        }
                      )}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {comment.content}
                  </p>
                </div>
              </div>

              {/* Delete (only owner or admin, backend enforces too) */}
              {currentUser && currentUser.id === comment.authorId && (
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="absolute top-2 right-2 p-1.5 text-zinc-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all rounded-full"
                  title="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
