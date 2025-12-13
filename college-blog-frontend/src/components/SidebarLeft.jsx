import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CreatePostModal } from "@/features/posts/components/CreatePostModal";
import { API_BASE_URL } from "@/utils/api";
import { 
  Home, Search, Bell, User, LogOut, PenSquare, BookOpen, HelpCircle 
} from "lucide-react";

// Receive activeFilter and setActiveFilter from AppLayout
export default function SidebarLeft({ activeFilter, setActiveFilter }) {
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [user, setUser] = useState(null);

  // Helper for Images
  const getFullImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path; 
    const rootUrl = API_BASE_URL.replace('/api/v1', '');
    return `${rootUrl}${path}`;
  };

  const getInitials = () => user ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() : "U";

  useEffect(() => {
    if (!token) return;
    const fetchUser = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/user/me`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (response.ok) setUser(await response.json());
      } catch (error) { console.error(error); }
    };
    fetchUser();
  }, [token]);

  const handleLogout = (e) => {
    e.stopPropagation();
    if(window.confirm("Log out of your account?")) {
        localStorage.removeItem("token");
        navigate("/login");
    }
  };

  // SMART NAV ITEM: Handles Links AND Filters
  const NavItem = ({ to, icon: Icon, label, filterType }) => {
    
    // Active Logic: If filterType exists, check filter state. If not, check URL path.
    const isActive = filterType 
        ? (activeFilter === filterType && location.pathname === "/")
        : (location.pathname === to);

    const handleClick = (e) => {
        if (filterType) {
            e.preventDefault();
            // 1. If not on Home, go Home first
            if (location.pathname !== "/") navigate("/");
            
            // 2. Set the Filter
            if (setActiveFilter) {
                setActiveFilter(filterType);
                window.scrollTo({ top: 0, behavior: "smooth" });
            }
        } else {
            // Normal Link Click (Home Reset)
            if (label === "Home" && setActiveFilter) setActiveFilter("ALL");
        }
    };

    // Use <div> for filters, <Link> for normal pages
    const Wrapper = filterType ? "div" : Link;
    const props = filterType ? { onClick: handleClick } : { to, onClick: handleClick };

    return (
      <Wrapper {...props} className="group block cursor-pointer mb-1">
        <div className={`
            flex items-center gap-4 px-4 py-3 rounded-full transition-all duration-200
            ${isActive ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}
        `}>
          <Icon 
            className={`h-7 w-7 transition-colors ${isActive ? "text-indigo-600" : "text-slate-500 group-hover:text-slate-700"}`} 
            strokeWidth={isActive ? 2.5 : 2} 
          />
          <span className={`text-xl hidden xl:block ${isActive ? "font-bold" : "font-medium"}`}>
              {label}
          </span>
        </div>
      </Wrapper>
    );
  };

  if (!token) return null;

  return (
    <div className="flex flex-col h-full px-2 py-4 justify-between">
      
      {/* 1. TOP NAV */}
      <div className="space-y-1">
        
        {/* Pages */}
        <NavItem to="/" icon={Home} label="Home" />
        <NavItem to="/explore" icon={Search} label="Explore" />
        <NavItem to="/notifications" icon={Bell} label="Notifications" />
        <NavItem to={`/users/${user?.id}`} icon={User} label="Profile" />
        
        <div className="my-4 px-4"><div className="h-px bg-slate-200 w-full"></div></div>
        
        {/* Filters (Notices & Doubts) */}
        <NavItem filterType="NOTICE" icon={BookOpen} label="Notices" />
        <NavItem filterType="DOUBT" icon={HelpCircle} label="Doubts" />

        {/* Post Button */}
        <div className="my-6 px-2">
            <CreatePostModal 
                user={user}
                onSuccess={() => window.location.reload()}
                trigger={
                    <Button className="w-full h-14 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 transition-all hover:scale-[1.02] active:scale-[0.98] group">
                        <PenSquare className="h-6 w-6 xl:mr-2 group-hover:animate-pulse" />
                        <span className="hidden xl:inline text-lg font-bold">Post</span>
                    </Button>
                }
            />
        </div>
      </div>

      {/* 2. USER WIDGET */}
      <div 
        className="mt-4 flex items-center gap-3 p-3 rounded-full hover:bg-slate-100 transition-colors cursor-pointer group select-none" 
        onClick={() => navigate(`/users/${user?.id}`)}
      >
          <Avatar className="h-10 w-10 border border-slate-200 bg-white group-hover:border-indigo-200">
              <AvatarImage src={getFullImageUrl(user?.profileImageUrl)} className="object-cover"/>
              <AvatarFallback className="bg-slate-900 text-white text-xs font-bold">{getInitials()}</AvatarFallback>
          </Avatar>
          
          <div className="hidden xl:block overflow-hidden flex-1 leading-tight">
              <p className="text-sm font-bold text-slate-900 truncate">
                  {user ? `${user.firstName} ${user.lastName}` : "Loading..."}
              </p>
              <p className="text-xs text-slate-500 truncate font-medium">@{user?.firstName?.toLowerCase() || "user"}</p>
          </div>
          
          <div className="hidden xl:flex items-center justify-center">
             <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full" onClick={handleLogout} title="Log Out">
                <LogOut className="h-4 w-4" />
             </Button>
          </div>
      </div>

    </div>
  );
}