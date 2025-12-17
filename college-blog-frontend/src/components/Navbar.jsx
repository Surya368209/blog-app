import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"

export default function Navbar() {
  const token = localStorage.getItem("token");

  // Reusable Logo
  const Logo = () => (
    <Link to="/" className="flex items-center gap-2">
      <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
        <span className="text-white font-bold text-lg">C</span>
      </div>
      <span className="text-xl font-bold tracking-tight text-slate-900">
        SVEC Campus
      </span>
    </Link>
  );

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* 1. BRANDING (Left Aligned) */}
        <Logo />

        {/* 2. GUEST ACTIONS (Only visible if NOT logged in) */}
        {/* If Logged In: Show NOTHING here. The Sidebars handle everything. */}
        {!token && (
            <div className="flex gap-2">
              <Link to="/login"><Button variant="ghost" className="text-slate-600">Sign in</Button></Link>
              <Link to="/register"><Button className="bg-indigo-600 hover:bg-indigo-700">Get Started</Button></Link>
            </div>
        )}

      </div>
    </nav>
  )
}