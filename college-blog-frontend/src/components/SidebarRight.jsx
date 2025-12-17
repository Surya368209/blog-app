import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BadgeCheck, TrendingUp, Users, Loader2, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { API_BASE_URL } from "@/utils/api";

export default function SidebarRight() {
  const navigate = useNavigate();
  const [trendingTags, setTrendingTags] = useState([]);
  const [suggestedTeachers, setSuggestedTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  const getFullImageUrl = (path) => path ? (path.startsWith("http") ? path : `${API_BASE_URL.replace("/api/v1", "")}${path}`) : null;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tagsRes, teachersRes] = await Promise.all([
            fetch(`${API_BASE_URL}/posts/trending-tags`),
            fetch(`${API_BASE_URL}/user/suggestions`)
        ]);

        if (tagsRes.ok) {
            const tags = await tagsRes.json();
            setTrendingTags(tags);
        }

        if (teachersRes.ok) {
            const teachers = await teachersRes.json();
            // Randomly shuffle the array and pick the first 2
            const shuffled = teachers.sort(() => 0.5 - Math.random());
            setSuggestedTeachers(shuffled.slice(0, 2));
        }
        
      } catch (e) {
        console.error("Sidebar fetch error", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    // RESPONSIVE: Hidden on Mobile, Visible on Laptop (lg:flex)
    <div className="hidden lg:flex flex-col gap-5 sticky top-24 w-full max-w-[300px] ml-auto pb-10">
      
      {/* 1. TRENDING CARD (Top 5) */}
      <Card className="shadow-none border border-slate-200 bg-white rounded-xl overflow-hidden">
        <CardHeader className="pb-2 border-b border-slate-50 px-4 py-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-900">
                <TrendingUp className="h-4 w-4 text-slate-900" /> 
                Trending Topics
            </CardTitle>
        </CardHeader>
        <CardContent className="pt-3 px-4 space-y-4">
            {loading ? (
                <div className="flex justify-center py-4"><Loader2 className="animate-spin h-5 w-5 text-slate-300" /></div>
            ) : trendingTags.length > 0 ? (
                <div className="flex flex-col gap-3">
                    {/* Show Top 5 Tags */}
                    {trendingTags.slice(0, 5).map((tag, idx) => (
                        <div 
                            key={idx} 
                            className="cursor-pointer group flex items-center justify-between"
                            onClick={() => navigate(`/search?q=${tag}`)}
                        >
                            <div>
                                <p className="text-[10px] text-slate-400 font-medium mb-0.5 uppercase tracking-wider">Trending</p>
                                <p className="font-bold text-sm text-slate-800 group-hover:text-violet-600 transition-colors">#{tag}</p>
                            </div>
                            <ArrowRight className="h-3 w-3 text-slate-300 -ml-2 opacity-0 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-xs text-slate-400 text-center py-2">No trends right now.</p>
            )}
        </CardContent>
      </Card>

      {/* 2. FACULTY SUGGESTIONS (2 Random) */}
      <Card className="shadow-none border border-slate-200 bg-white rounded-xl overflow-hidden">
        <CardHeader className="pb-2 border-b border-slate-50 px-4 py-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-900">
                <Users className="h-4 w-4 text-slate-900" /> 
                Faculty to Follow
            </CardTitle>
        </CardHeader>
        <CardContent className="pt-3 px-4 space-y-4">
            {loading ? (
                <div className="flex justify-center py-4"><Loader2 className="animate-spin h-5 w-5 text-slate-300" /></div>
            ) : suggestedTeachers.length > 0 ? (
                // Only showing the 2 Random Teachers picked in useEffect
                suggestedTeachers.map((teacher) => (
                    <div key={teacher.id} className="flex items-center justify-between">
                        <div 
                            className="flex items-center gap-2.5 cursor-pointer group"
                            onClick={() => navigate(`/users/${teacher.id}`)}
                        >
                            <Avatar className="h-9 w-9 border border-slate-100 bg-slate-50">
                                <AvatarImage src={getFullImageUrl(teacher.profileImageUrl)} className="object-cover" />
                                <AvatarFallback className="text-[10px] font-bold text-slate-500 bg-slate-100">
                                    {teacher.firstName?.[0]}
                                </AvatarFallback>
                            </Avatar>
                            <div className="leading-tight">
                                <p className="text-xs font-bold flex items-center gap-1 text-slate-900 group-hover:text-violet-600 transition-colors">
                                    {teacher.firstName} {teacher.lastName} 
                                    <BadgeCheck className="h-3 w-3 text-blue-500 fill-blue-50" />
                                </p>
                                <p className="text-[10px] text-slate-400">@{teacher.firstName?.toLowerCase()}</p>
                            </div>
                        </div>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 text-[10px] px-2.5 font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full"
                            onClick={() => navigate(`/users/${teacher.id}`)}
                        >
                            View
                        </Button>
                    </div>
                ))
            ) : (
                <p className="text-xs text-slate-400 text-center py-2">No suggestions available.</p>
            )}
        </CardContent>
      </Card>

      {/* FOOTER */}
      <div className="px-2">
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-400 font-medium">
            <a href="#" className="hover:underline hover:text-slate-600">Privacy</a>
            <span>•</span>
            <a href="#" className="hover:underline hover:text-slate-600">Terms</a>
            <span>•</span>
            <a href="#" className="hover:underline hover:text-slate-600">Guidelines</a>
        </div>
        <p className="text-[10px] text-slate-300 mt-2">© 2025 CampusLink Inc.</p>
      </div>

    </div>
  );
}