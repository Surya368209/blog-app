import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Hash, TrendingUp, Loader2, Flame } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PostCard } from "@/features/posts/components/PostCard";
import { API_BASE_URL } from "@/utils/api";

export default function Explore() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  
  const [trendingTags, setTrendingTags] = useState([]);
  const [popularPosts, setPopularPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Data on Load
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tagsRes, postsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/posts/trending-tags`),
          fetch(`${API_BASE_URL}/posts/popular`) // You can add Auth header here if you want 'liked' status to show
        ]);

        if (tagsRes.ok) setTrendingTags(await tagsRes.json());
        if (postsRes.ok) setPopularPosts(await postsRes.json());
      } catch (e) {
        console.error("Explore fetch error", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 2. Handle Search Enter Key
  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    // Strip '#' if user typed it, then navigate to Search Page
    const query = searchTerm.replace("#", "");
    navigate(`/search?q=${query}`);
  };

  return (
    <div className="min-h-screen bg-zinc-50 pb-20">
      
      {/* HEADER & SEARCH BAR */}
      <div className="bg-white border-b border-zinc-200 p-4 sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-zinc-900 mb-4">Explore</h1>
        
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-zinc-400" />
          <Input 
            className="pl-10 h-11 bg-zinc-100 border-none rounded-xl text-base focus-visible:ring-blue-500"
            placeholder="Search for tags (e.g. #java)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </form>
      </div>

      <div className="max-w-3xl mx-auto p-4 space-y-8">
        
        {/* SECTION 1: TRENDING TAGS */}
        {trendingTags.length > 0 && (
          <section className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-5 w-5 text-indigo-600" />
              <h2 className="font-bold text-lg text-zinc-800">Trending Now</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {trendingTags.map((tag) => (
                <Badge 
                  key={tag}
                  variant="secondary"
                  className="px-4 py-2 text-sm bg-zinc-50 border border-zinc-200 text-zinc-700 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 cursor-pointer transition rounded-full"
                  onClick={() => navigate(`/search?q=${tag}`)} // REUSE SEARCH PAGE
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          </section>
        )}

        {/* SECTION 2: POPULAR POSTS */}
        <section>
          <div className="flex items-center gap-2 mb-4 px-1">
            <Flame className="h-5 w-5 text-orange-500" />
            <h2 className="font-bold text-lg text-zinc-800">Popular Posts</h2>
          </div>

          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin h-8 w-8 text-zinc-400" /></div>
          ) : (
            <div className="space-y-4">
              {popularPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}