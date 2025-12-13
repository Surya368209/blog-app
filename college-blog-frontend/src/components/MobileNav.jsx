import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Search, PlusSquare, Bell, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {CreatePostModal} from "@/features/posts/components/CreatePostModal";
import { API_BASE_URL } from "@/utils/api";

export default function MobileNav() {
  const location = useLocation();
  const token = localStorage.getItem("token");
  const [user, setUser] = useState(null);

  // Helper to fix image URLs
  const getFullImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path; 
    const rootUrl = API_BASE_URL.replace('/api/v1', '');
    return `${rootUrl}${path}`;
  };

  // Fetch User Data (So we can show their face)
  useEffect(() => {
    if (!token) return;
    const fetchUser = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/user/me`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data);
        }
      } catch (error) {
        console.error("MobileNav Auth error:", error);
      }
    };
    fetchUser();
  }, [token]);

  // If not logged in, don't show bottom bar
  if (!token) return null;

  const isActive = (path) => location.pathname === path;
  const getInitials = () => user ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() : "U";

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 h-16 px-6 z-50 pb-safe">
      <div className="flex justify-between items-center h-full">
        
        {/* 1. HOME */}
        <Link to="/" className="flex flex-col items-center gap-1">
          <Home 
            className={`h-6 w-6 transition-all ${isActive('/') ? "text-blue-600 fill-blue-100" : "text-zinc-500"}`} 
            strokeWidth={isActive('/') ? 2.5 : 2}
          />
        </Link>

        {/* 2. SEARCH */}
        <Link to="/explore" className="flex flex-col items-center gap-1">
          <Search 
            className={`h-6 w-6 transition-all ${isActive('/explore') ? "text-blue-600" : "text-zinc-500"}`} 
            strokeWidth={isActive('/explore') ? 2.5 : 2}
          />
        </Link>

        {/* 3. CREATE POST (Modal Trigger) */}
        <CreatePostModal 
            user={user}
            onSuccess={() => window.location.reload()}
            trigger={
               <div className="bg-zinc-900 h-10 w-10 rounded-xl flex items-center justify-center shadow-lg shadow-zinc-200 active:scale-95 transition-transform cursor-pointer">
                  <PlusSquare className="h-6 w-6 text-white" />
               </div>
            }
        />

        {/* 4. NOTIFICATIONS */}
        <Link to="/notifications" className="flex flex-col items-center gap-1">
          <Bell 
            className={`h-6 w-6 transition-all ${isActive('/notifications') ? "text-blue-600 fill-blue-100" : "text-zinc-500"}`} 
            strokeWidth={isActive('/notifications') ? 2.5 : 2}
          />
        </Link>

        {/* 5. PROFILE (The Avatar Circle) */}
        <Link to="/profile" className="flex flex-col items-center gap-1">
          <div className={`rounded-full p-0.5 transition-all ${isActive('/profile') ? "ring-2 ring-blue-600 ring-offset-1" : ""}`}>
             <Avatar className="h-7 w-7 border border-zinc-200">
                <AvatarImage 
                  src={getFullImageUrl(user?.profileImageUrl)} 
                  className="object-cover"
                />
                <AvatarFallback className="bg-zinc-100 text-[10px] font-bold text-zinc-600">
                  {getInitials()}
                </AvatarFallback>
             </Avatar>
          </div>
        </Link>

      </div>
    </div>
  );
}