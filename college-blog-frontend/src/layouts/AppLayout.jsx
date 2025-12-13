import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import MobileNav from "@/components/MobileNav";
import SidebarLeft from "@/components/SidebarLeft";
import SidebarRight from "@/components/SidebarRight";

export default function AppLayout() {
  const location = useLocation();
  
  // 1. CHECK LOGIN STATUS
  // We check if the token exists in localStorage. 
  // If it exists, 'isLoggedIn' becomes true.
  const token = localStorage.getItem("token"); // OR use your AuthContext here
  const isLoggedIn = !!token; 

  // 2. AUTH PAGES (Login/Register/Reset)
  // These completely hide the dashboard layout
  const authRoutes = ["/login", "/register", "/forgot-password", "/reset-password"];
  const isAuthPage = authRoutes.includes(location.pathname);

  // 3. SETTINGS PAGES (Logged in, but hide Right Sidebar)
  const hideRightSidebarPaths = ["/change-password", "/settings", "/profile/edit"];
  const shouldHideRightSidebar = hideRightSidebarPaths.includes(location.pathname);

  const [activeFilter, setActiveFilter] = useState("ALL");

  // --- LAYOUT A: FULL SCREEN AUTH (No Navbar, No Sidebars) ---
  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
           <Outlet />
        </div>
      </div>
    );
  }

  // --- LAYOUT B: MAIN APP ---
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <div className="flex-1 w-full max-w-7xl mx-auto pt-4 md:pt-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 px-4">
            
            {/* --- LEFT SIDEBAR (Faculty) --- */}
            {/* ONLY SHOW IF LOGGED IN */}
            {isLoggedIn && (
                <aside className="hidden md:block md:col-span-3 lg:col-span-3 sticky top-24 h-[calc(100vh-6rem)] overflow-y-auto scrollbar-hide">
                    <SidebarLeft 
                        activeFilter={activeFilter} 
                        setActiveFilter={setActiveFilter} 
                    />
                </aside>
            )}

            {/* --- MAIN CONTENT --- */}
            {/* If NOT logged in, expand to full width (12 cols) */}
            {/* If logged in, use standard width (6 or 9 cols) */}
            <main className={`col-span-1 min-h-[80vh] bg-white rounded-xl shadow-sm border border-slate-200
                ${!isLoggedIn ? 'md:col-span-12 lg:col-span-12' : 
                  shouldHideRightSidebar ? 'md:col-span-9 lg:col-span-9' : 'md:col-span-9 lg:col-span-6'}
            `}>
                <div className="p-4 md:p-6">
                    <Outlet context={{ activeFilter, setActiveFilter }} />
                </div>
            </main>

            {/* --- RIGHT SIDEBAR (Trending) --- */}
            {/* ONLY SHOW IF LOGGED IN AND NOT ON SETTINGS PAGE */}
            {isLoggedIn && !shouldHideRightSidebar && (
                <aside className="hidden lg:block lg:col-span-3 sticky top-24 h-[calc(100vh-6rem)] overflow-y-auto scrollbar-hide">
                    <SidebarRight />
                </aside>
            )}

        </div>
      </div>

      {/* Only show Mobile Nav if Logged In */}
      {isLoggedIn && (
        <div className="md:hidden">
            <MobileNav activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
        </div>
      )}

    </div>
  );
}