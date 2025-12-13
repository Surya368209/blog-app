import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "@/layouts/AppLayout";

// Pages
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Profile from "@/pages/Profile";
import CreatePost from "@/pages/CreatePost";
import PostDetails from "@/pages/PostDetails";
import FollowList from "@/pages/FollowList";
import Search from "@/pages/Search";
import Explore from "@/pages/Explore";
import Notifications from "@/pages/Notifications";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import ResetPassword from "@/pages/auth/ResetPassword";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* The Global Layout (Navbar + Sidebars + Content) */}
        <Route element={<AppLayout />}>
          
          {/* 1. Feed */}
          <Route path="/" element={<Home />} />
          
          {/* 2. Auth Pages (Layout hides sidebars for these automatically) */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* 3. User Features */}
          <Route path="/profile" element={<Profile />} />
          <Route path="/create-post" element={<CreatePost />} />
          
          {/* 4. Single Post View (We will build this next) */}
          <Route path="/posts/:postId" element={<PostDetails />} />
          <Route path="/users/:userId" element={<Profile />} />

          {/* Route 1: Followers */}
          <Route path="/users/:userId/followers" element={<FollowList type="followers" />} 
          />

          {/* Route 2: Following */}
          <Route path="/users/:userId/following" element={<FollowList type="following" />} 
          />
          <Route path="/search" element={<Search />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/notifications" element={<Notifications />} />

          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}