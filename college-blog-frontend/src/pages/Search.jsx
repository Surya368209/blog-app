import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, SearchX, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PostCard } from "@/features/posts/components/PostCard";
import { API_BASE_URL } from "@/utils/api";

export default function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q"); 
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]); // Store found users
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const headers = token ? { "Authorization": `Bearer ${token}` } : {};

        // Run both searches in parallel
        const [postsRes, usersRes] = await Promise.all([
            fetch(`${API_BASE_URL}/posts/search?tag=${query}`, { headers }),
            fetch(`${API_BASE_URL}/user/search?query=${query}`, { headers })
        ]);

        if (postsRes.ok) setPosts(await postsRes.json());
        if (usersRes.ok) setUsers(await usersRes.json());

      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    if (query) fetchResults();
  }, [query, token]);

  return (
    <div className="min-h-screen bg-zinc-50 pb-20">
      
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-zinc-200 p-4 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="-ml-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
            <h1 className="text-lg font-bold text-zinc-900">Search</h1>
            <p className="text-xs text-zinc-500">Results for "<span className="font-semibold text-blue-600">{query}</span>"</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="animate-spin h-8 w-8 text-indigo-600" /></div>
        ) : (
          <>
            {/*1. PEOPLE RESULTS SECTION */}
            {users.length > 0 && (
                <div className="bg-white rounded-xl border border-zinc-200 p-4 shadow-sm">
                    <h2 className="text-sm font-bold text-zinc-500 mb-3 uppercase tracking-wider flex items-center gap-2">
                        <User className="h-4 w-4" /> People
                    </h2>
                    <div className="space-y-3">
                        {users.map((user) => (
                            <div 
                                key={user.id} 
                                className="flex items-center justify-between p-2 hover:bg-zinc-50 rounded-lg cursor-pointer transition-colors"
                                
                            >
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10 border border-zinc-200">
                                        <AvatarImage src={user.profileImageUrl} className="object-cover" />
                                        <AvatarFallback>{user.firstName?.[0]}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-sm font-bold text-zinc-900">{user.firstName} {user.lastName}</p>
                                        <p className="text-xs text-zinc-500">@{user.firstName?.toLowerCase()}</p>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" className="h-8 text-xs rounded-full"
                                onClick={() => navigate(`/users/${user.id}`)}
                                >View</Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 2. POST RESULTS SECTION */}
            <div>
                {posts.length > 0 && (
                    <h2 className="text-sm font-bold text-zinc-500 mb-3 uppercase tracking-wider px-1">Posts</h2>
                )}
                
                <div className="space-y-4">
                    {posts.length > 0 ? (
                        posts.map((post) => <PostCard key={post.id} post={post} />)
                    ) : (
                        // Only show "No results" if BOTH lists are empty
                        users.length === 0 && (
                            <div className="text-center py-20 text-zinc-500">
                                <div className="bg-zinc-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <SearchX className="h-8 w-8 text-zinc-400" />
                                </div>
                                <h3 className="font-semibold text-lg text-zinc-900">No results found</h3>
                                <p>Try searching for a different name or tag.</p>
                            </div>
                        )
                    )}
                </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}