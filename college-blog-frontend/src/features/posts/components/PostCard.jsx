import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns"; // Optional: npm install date-fns OR use helper below

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import ContentRenderer from "@/components/ContentRenderer";
import ImageModal from "@/pages/ImageModal"; //  Import the Modal we created earlier

import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  BadgeCheck,
  Trash2, 
  Edit,   
  UserPlus,
  UserCheck,
  Loader2
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { API_BASE_URL } from "@/utils/api";

// Helper for Time Ago (if you don't want to install date-fns)
function timeAgo(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
}

export function PostCard({ 
    post, 
    isDetails = false, 
    onLikeToggle, 
    onDelete, 
    onFollowToggle,
    currentUser // RECEIVE USER AS PROP (Fixes Performance)
}) {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // --- STATE ---
  const [liked, setLiked] = useState(post.likedByCurrentUser ?? false);
  const [likeCount, setLikeCount] = useState(typeof post.likeCount === "number" ? post.likeCount : 0);
  
  // Follow State
  const [isFollowing, setIsFollowing] = useState(post.followingAuthor ?? false);
  const [followLoading, setFollowLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Image Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingLike, setLoadingLike] = useState(false);

  // --- EFFECTS ---
  useEffect(() => {
    setLiked(post.likedByCurrentUser ?? false);
    setLikeCount(typeof post.likeCount === "number" ? post.likeCount : 0);
  }, [post.likedByCurrentUser, post.likeCount]);

  useEffect(() => {
    if (!isDirty) {
        setIsFollowing(post.followingAuthor ?? false);
    }
  }, [post.followingAuthor, isDirty]);

  // --- HELPERS ---
  const getAuthorImageUrl = (path) => path ? (path.startsWith("http") ? path : `${API_BASE_URL.replace("/api/v1", "")}${path}`) : null;
  const getPostImageUrl = (path) => path ? (path.startsWith("http") ? path : `${API_BASE_URL.replace("/api/v1", "")}${path}`) : null;
  
  const getCategoryBadge = (category) => {
    switch (category) {
      case "NOTICE": return <Badge className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100">Notice</Badge>;
      case "PLACEMENT": return <Badge className="bg-green-50 text-green-600 border-green-200 hover:bg-green-100">Placement</Badge>;
      case "DOUBT": return <Badge className="bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100">Doubt</Badge>;
      default: return <Badge variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-200">General</Badge>;
    }
  };

  const commentCount = typeof post.commentCount === "number" ? post.commentCount : 0;

  // --- ACTIONS ---
  const handleFollow = async (e) => {
    e.stopPropagation();
    if (!token || post.authorRole !== "TEACHER") return;
    
    const nextState = !isFollowing;
    setIsDirty(true);
    setIsFollowing(nextState);
    setFollowLoading(true);

    try {
      const method = nextState ? "POST" : "DELETE";
      const res = await fetch(`${API_BASE_URL}/follow/${post.authorId}`, {
        method, 
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed");
      if (onFollowToggle) onFollowToggle(post.authorId, nextState);
    } catch (err) {
      console.error("Follow error:", err);
      // Optional: Revert state if needed, but keeping optimistic UI is smoother
    } finally {
      setFollowLoading(false);
    }
  };

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!token || loadingLike) return;

    const prevLiked = liked;
    const prevCount = likeCount;
    const newLiked = !liked;
    const newCount = newLiked ? prevCount + 1 : prevCount - 1; 

    setLiked(newLiked);
    setLikeCount(newCount);
    setLoadingLike(true);

    if (onLikeToggle) onLikeToggle(newLiked, newCount);

    try {
      const method = prevLiked ? "DELETE" : "POST";
      const res = await fetch(`${API_BASE_URL}/posts/${post.id}/likes`, {
        method, headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed");
    } catch (err) {
      setLiked(prevLiked);
      setLikeCount(prevCount);
      if (onLikeToggle) onLikeToggle(prevLiked, prevCount);
    } finally {
      setLoadingLike(false);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if(!confirm("Delete this post?")) return;
    try {
        const res = await fetch(`${API_BASE_URL}/posts/${post.id}`, {
            method: "DELETE", headers: { "Authorization": `Bearer ${token}` }
        });
        if(res.ok) {
            if(onDelete) onDelete(post.id);
            if(isDetails) navigate("/"); 
        } else {
            alert("Failed to delete.");
        }
    } catch(error) { console.error(error); }
  };

  const handleCardClick = () => { if (!isDetails) navigate(`/posts/${post.id}`); };
  const handleCommentClick = (e) => { 
      e.stopPropagation(); 
      if (!isDetails) navigate(`/posts/${post.id}`); 
      else { 
        const el = document.getElementById("comments-section"); 
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); 
      }
  };
  
  const handleShare = async (e) => { 
      e.stopPropagation(); 
      const url = `${window.location.origin}/posts/${post.id}`; 
      if (navigator.share) { 
          try { await navigator.share({ title: post.title, url }); } catch(e){} 
      } else { 
          navigator.clipboard.writeText(url); 
          alert("Link copied!"); 
      }
  };

  return (
    <>
    <Card
      className={`bg-white overflow-hidden transition-all border-slate-200/60 ${
        isDetails ? "shadow-none border-0 md:border md:rounded-xl" : "mb-4 shadow-sm hover:shadow-md cursor-pointer group"
      }`}
      onClick={handleCardClick}
    >
      <CardHeader className="flex flex-row items-start justify-between p-4 pb-0 space-y-0">
        <div className="flex gap-3 flex-1 min-w-0">
          
          <Avatar 
            className="h-10 w-10 border border-slate-100 flex-shrink-0 cursor-pointer transition-opacity hover:opacity-80"
            onClick={(e) => { e.stopPropagation(); navigate(`/users/${post.authorId}`); }}
          >
            <AvatarImage src={getAuthorImageUrl(post.authorImageUrl)} className="object-cover" />
            <AvatarFallback className="bg-indigo-50 text-indigo-600 font-bold">{post.authorName?.[0]}</AvatarFallback>
          </Avatar>

          <div className="flex flex-col min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-sm font-bold text-slate-900 hover:underline cursor-pointer truncate max-w-[160px] sm:max-w-none"
                onClick={(e) => { e.stopPropagation(); navigate(`/users/${post.authorId}`); }}>
                {post.authorName}
              </span>

              {post.authorVerified && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger><BadgeCheck className="h-4 w-4 text-blue-500" /></TooltipTrigger>
                    <TooltipContent><p>Verified Faculty</p></TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              {/* FOLLOW BUTTON */}
              {post.authorRole === "TEACHER" && currentUser?.accountType === "STUDENT" && currentUser.id !== post.authorId && (
                <button
                  onClick={handleFollow}
                  className={`text-[11px] font-semibold ml-1 flex items-center gap-1 px-2.5 py-0.5 rounded-full border transition-all duration-200 ${
                    isFollowing
                      ? "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                      : "border-indigo-100 bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                  }`}
                >
                    {followLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : (
                      <>
                         {isFollowing ? "Following" : "Follow"}
                      </>
                    )}
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
              <span className={post.authorRole === "TEACHER" ? "text-indigo-600 font-medium bg-indigo-50 px-1.5 rounded" : ""}>
                {post.authorRole}
              </span>
              <span>•</span>
              {/* REAL WORLD: Time Ago */}
              <span>{timeAgo(post.createdAt)}</span>
            </div>
          </div>
        </div>

        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600 -mr-2"><MoreHorizontal className="h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
                {currentUser && (currentUser.email === post.authorEmail || currentUser.id === post.authorId) ? (
                    <>
                        <DropdownMenuItem className="cursor-pointer" onClick={(e) => e.stopPropagation()}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={handleDelete} className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                    </>
                ) : (
                    <DropdownMenuItem onClick={(e) => e.stopPropagation()}>Report Post</DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent className="p-4 pt-3 space-y-3">
        <div className="flex items-start justify-between gap-4">
          <h3 className={`font-bold text-slate-900 leading-tight ${isDetails ? "text-xl" : "text-lg line-clamp-1"}`}>
            {post.title}
          </h3>
          {getCategoryBadge(post.category)}
        </div>
        
        {/* REAL WORLD: Line Clamp for feed, Full text for details */}
        <div className={`text-slate-700 whitespace-pre-line leading-relaxed ${isDetails ? "text-base" : "text-sm line-clamp-3"}`}>
            <ContentRenderer content={post.content} />
        </div>

        {/* REAL WORLD: Image Handling */}
        {post.imageUrl && (
          <div 
            className="mt-3 group/image relative w-full bg-slate-100 rounded-xl overflow-hidden cursor-zoom-in border border-slate-100"
            onClick={(e) => { e.stopPropagation(); setIsModalOpen(true); }}
          >
             {/* Feed: Fixed Height (h-64). Details: Max Height (max-h-[500px]) */}
             <img 
                src={getPostImageUrl(post.imageUrl)} 
                className={`w-full object-cover transition-transform duration-500 group-hover/image:scale-105 ${isDetails ? "max-h-[500px]" : "h-64"}`} 
                alt="Post attachment"
             />
             {!isDetails && <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/5 transition-colors" />}
          </div>
        )}
      </CardContent>
      
      {!isDetails && <Separator className="bg-slate-50" />}
      
      <CardFooter className="p-2 px-4 flex justify-between">
        <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleLike} 
            className={`gap-1.5 transition-colors ${liked ? "text-red-500 hover:text-red-600 hover:bg-red-50" : "text-slate-500 hover:text-red-500 hover:bg-red-50"}`}
        >
            <Heart className={`h-5 w-5 transition-transform ${liked ? "fill-current scale-110" : "scale-100"}`} />
            <span className="text-sm font-medium">{likeCount > 0 ? likeCount : ""}</span>
        </Button>

        <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleCommentClick} 
            className="text-slate-500 gap-1.5 hover:text-blue-600 hover:bg-blue-50"
        >
            <MessageCircle className="h-5 w-5" />
            <span className="text-sm font-medium">{commentCount > 0 ? commentCount : "Comment"}</span>
        </Button>

        <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleShare} 
            className="text-slate-500 gap-1.5 hover:text-indigo-600 hover:bg-indigo-50"
        >
            <Share2 className="h-5 w-5" />
        </Button>
      </CardFooter>
    </Card>

    {/* RENDER MODAL HERE */}
    <ImageModal 
        isOpen={isModalOpen} 
        src={getPostImageUrl(post.imageUrl)} 
        onClose={() => setIsModalOpen(false)} 
    />
    </>
  );
}