import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom"; // Import useOutletContext
import { Button } from "@/components/ui/button";
import { PostCard } from "@/features/posts/components/PostCard";
import { CreatePostModal } from "@/features/posts/components/CreatePostModal";
import { API_BASE_URL } from "@/utils/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Newspaper, BellRing, Briefcase, HelpCircle, Image as ImageIcon, FilterX } from "lucide-react";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");

  // 1. Get Filter State from AppLayout (Context)
  // If context is missing (e.g. standalone test), default to "ALL"
  const { activeFilter, setActiveFilter } = useOutletContext() || { activeFilter: "ALL", setActiveFilter: () => {} };

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    
    const fetchFeed = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/feed/all`, {
          method: "GET",
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (!response.ok) throw new Error("Failed to load feed");
        const data = await response.json();
        setPosts(data);
      } catch (err) {
        console.error(err);
        setError("Could not load posts.");
      } finally {
        setLoading(false);
      }
    };
    fetchFeed();
  }, [token]);

  // 2. Filter Logic (Uses the Context ActiveFilter)
  const filteredPosts = posts.filter((post) => {
    if (activeFilter === "ALL") return true;
    return post.category === activeFilter;
  });

  const getFilterButtonStyle = (category) => {
    if (activeFilter === category) {
        return "w-full justify-center bg-blue-600 text-white hover:bg-blue-700 h-9 text-xs font-bold shadow-md transition-all";
    }
    return "w-full justify-center border-zinc-200 h-9 text-xs text-zinc-600 bg-white hover:bg-zinc-50 hover:text-blue-600 transition-all";
  };

  // Guest View
  if (!token) return (
       <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
          <h1 className="text-5xl font-bold mb-6 text-zinc-900">Welcome Guest</h1>
          <p className="text-xl text-zinc-500 mb-8 max-w-lg">Join the campus network.</p>
          <div className="flex gap-4">
             <Link to="/login"><Button size="lg" className="px-8 bg-blue-600">Login</Button></Link>
             <Link to="/register"><Button size="lg" variant="outline" className="px-8">Register</Button></Link>
          </div>
       </div>
  );

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
        
        {/* Mobile Filters (Hidden on Desktop) */}
        <div className="md:hidden grid grid-cols-2 gap-2">
            <Button variant={activeFilter === "ALL" ? "default" : "outline"} className={getFilterButtonStyle("ALL")} onClick={() => setActiveFilter("ALL")}>All Posts</Button>
            <Button variant={activeFilter === "NOTICE" ? "default" : "outline"} className={getFilterButtonStyle("NOTICE")} onClick={() => setActiveFilter("NOTICE")}><BellRing className="mr-2 h-3.5 w-3.5" />Notices</Button>
            <Button variant={activeFilter === "PLACEMENT" ? "default" : "outline"} className={getFilterButtonStyle("PLACEMENT")} onClick={() => setActiveFilter("PLACEMENT")}><Briefcase className="mr-2 h-3.5 w-3.5" />Placements</Button>
            <Button variant={activeFilter === "DOUBT" ? "default" : "outline"} className={getFilterButtonStyle("DOUBT")} onClick={() => setActiveFilter("DOUBT")}><HelpCircle className="mr-2 h-3.5 w-3.5" />Doubts</Button>
        </div>

        {/* Create Post Area */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-zinc-200 flex items-center gap-4 cursor-pointer hover:bg-slate-50 transition-all group">
            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 border border-zinc-200"><span className="font-bold text-zinc-400 text-xs">YOU</span></div>
            <CreatePostModal 
                onSuccess={() => window.location.reload()} 
                trigger={
                    <div className="flex-1 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-full px-5 py-2.5 flex items-center justify-between">
                        <span className="text-zinc-500 font-medium text-sm group-hover:text-zinc-600">Start a post...</span>
                        <ImageIcon className="h-5 w-5 text-zinc-400 group-hover:text-indigo-500 transition-colors" />
                    </div>
                }
            />
        </div>

        {/* Feed Header (Desktop Only Visual) */}
        <div className="hidden md:flex items-center justify-between px-2">
            <h2 className="text-xl font-bold text-zinc-800">
                {activeFilter === "ALL" ? "Home Feed" : 
                 activeFilter === "NOTICE" ? "Notices" : 
                 activeFilter === "DOUBT" ? "Doubts" : "Placements"}
            </h2>
            {activeFilter !== "ALL" && (
                <Button variant="ghost" size="sm" onClick={() => setActiveFilter("ALL")} className="text-zinc-500 hover:text-red-500">
                    Clear Filter
                </Button>
            )}
        </div>

        {/* Feed Logic */}
        {loading ? (
            <div className="space-y-4">{[1, 2].map((i) => <div key={i} className="bg-white p-4 rounded-xl space-y-3 border border-zinc-200"><Skeleton className="h-24 w-full" /></div>)}</div>
        ) : filteredPosts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-dashed border-zinc-300">
                {activeFilter === "ALL" ? (
                    <><Newspaper className="mx-auto h-8 w-8 text-zinc-300 mb-2" /><p className="text-zinc-500">No posts yet.</p></>
                ) : (
                    <>
                        <FilterX className="mx-auto h-8 w-8 text-zinc-300 mb-2" />
                        <p className="text-zinc-500">No posts found in <span className="font-bold">{activeFilter}</span>.</p>
                        <Button variant="link" onClick={() => setActiveFilter("ALL")} className="text-indigo-600">View all posts</Button>
                    </>
                )}
            </div>
        ) : (
          // RENDER FILTERED LIST
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onLikeToggle={(liked, likeCount) => {
                  setPosts((prev) =>
                    prev.map((p) =>
                      p.id === post.id
                        ? { ...p, likedByCurrentUser: liked, likeCount }
                        : p
                    )
                  );
                }}
                onFollowToggle={(postId, isFollowing) => {
                  setPosts((prev) =>
                    prev.map((p) =>
                      p.id === postId
                        ? { ...p, followingAuthor: isFollowing }
                        : p
                    )
                  );
                }}
              />
            ))}
          </div>
        )}
    </div>
  );
}