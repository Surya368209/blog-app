import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BadgeCheck, TrendingUp, Users, Search, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { API_BASE_URL } from "@/utils/api";

export default function SidebarRight() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [trendingTags, setTrendingTags] = useState([]);
  const [suggestedTeachers, setSuggestedTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  const getFullImageUrl = (path) => path ? (path.startsWith("http") ? path : `${API_BASE_URL.replace("/api/v1", "")}${path}`) : null;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tagsRes, teachersRes] = await Promise.all([
            fetch(`${API_BASE_URL}/posts/trending-tags`),
            fetch(`${API_BASE_URL}/user/suggestions`) // New Endpoint
        ]);

        if (tagsRes.ok) setTrendingTags(await tagsRes.json());
        if (teachersRes.ok) setSuggestedTeachers(await teachersRes.json());
        
      } catch (e) {
        console.error("Sidebar fetch error", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);


  return (
    // STICKY POSITIONING
    // 'sticky' makes it stick. 'top-20' gives it breathing room from the Navbar.
    // We REMOVED 'h-screen' and 'overflow' so it doesn't have its own scrollbar.
    <div className="flex flex-col gap-6 sticky top-24 w-full">
      
      {/* 1. SEARCH BAR */}

      {/* 2. TRENDING CARD */}
      <Card className="shadow-sm border-slate-200 bg-white rounded-2xl overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50 py-4">
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-900">
                <TrendingUp className="h-5 w-5 text-indigo-600" /> 
                Trending
            </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
            {loading ? (
                <div className="flex justify-center py-2"><Loader2 className="animate-spin h-5 w-5 text-slate-300" /></div>
            ) : trendingTags.length > 0 ? (
                trendingTags.slice(0, 4).map((tag, idx) => (
                    <div 
                        key={idx} 
                        className="cursor-pointer group"
                        onClick={() => navigate(`/search?q=${tag}`)}
                    >
                        <p className="text-xs text-slate-500 font-medium mb-0.5">Trending in Campus</p>
                        <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">#{tag}</p>
                    </div>
                ))
            ) : (
                <p className="text-xs text-slate-400 text-center py-2">No trends right now.</p>
            )}
        </CardContent>
      </Card>

      {/* 3. VERIFIED FACULTY (Dynamic) */}
      <Card className="shadow-sm border-slate-200 bg-white rounded-2xl overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50 py-4">
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-900">
                <Users className="h-5 w-5 text-green-600" /> 
                Faculty to Follow
            </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-5">
            {loading ? (
                <div className="flex justify-center py-2"><Loader2 className="animate-spin h-5 w-5 text-slate-300" /></div>
            ) : suggestedTeachers.length > 0 ? (
                suggestedTeachers.map((teacher) => (
                    <div key={teacher.id} className="flex items-center justify-between">
                        <div 
                            className="flex items-center gap-3 cursor-pointer group"
                        >
                            <Avatar className="h-10 w-10 border border-slate-100 bg-slate-50">
                                <AvatarImage src={getFullImageUrl(teacher.profileImageUrl)} className="object-cover" />
                                <AvatarFallback className="text-xs font-bold text-slate-500 bg-slate-100">
                                    {teacher.firstName?.[0]}
                                </AvatarFallback>
                            </Avatar>
                            <div className="leading-tight">
                                <p className="text-sm font-bold flex items-center gap-1 text-slate-900 group-hover:text-indigo-600 transition-colors">
                                    {teacher.firstName} {teacher.lastName} 
                                    <BadgeCheck className="h-3.5 w-3.5 text-blue-500 fill-blue-50" />
                                </p>
                                <p className="text-[11px] text-slate-500">@{teacher.firstName?.toLowerCase()}</p>
                            </div>
                        </div>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 text-xs px-3 rounded-full hover:border-indigo-200 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                            onClick={() => navigate(`/users/${teacher.id}`)}
                        >
                            View
                        </Button>
                    </div>
                ))
            ) : (
                <p className="text-xs text-slate-400 text-center py-2">No suggestions.</p>
            )}
        </CardContent>
      </Card>

      {/* FOOTER */}
      <div className="flex flex-wrap gap-x-4 gap-y-2 px-2 text-[11px] text-slate-400 font-medium">
        <span>© 2025 CampusLink</span>
        <a href="#" className="hover:underline hover:text-slate-600">Privacy</a>
        <a href="#" className="hover:underline hover:text-slate-600">Terms</a>
      </div>

    </div>
  );
}