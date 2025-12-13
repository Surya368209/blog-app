import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Send, Image as ImageIcon, X, AlertCircle } from "lucide-react";
import { API_BASE_URL } from "@/utils/api";

export default function CreatePost() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  
  // State for the authenticated user (to show "Posting as...")
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form State matches Backend DTO exactly
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "GENERAL", // Default Enum
    imageUrl: ""
  });

  // Helper for Image URLs
  const getFullImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path; 
    const rootUrl = API_BASE_URL.replace('/api/v1', '');
    return `${rootUrl}${path}`;
  };

  const getInitials = () => user ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() : "U";

  // 1. Fetch User on Mount (for UI context)
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/user/me`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (response.ok) setUser(await response.json());
      } catch (e) { console.error("Failed to load user info"); }
    };
    if (token) fetchUser();
  }, [token]);

  // Handle Text Inputs
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  // Handle Category Select
  const handleCategoryChange = (value) => {
    setFormData((prev) => ({ ...prev, category: value }));
  };

  // 2. Submit Logic (Matches Endpoint #1: POST /api/posts)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Basic Validation
    if (!formData.title.trim() || !formData.content.trim()) {
        setError("Title and Content are required.");
        setLoading(false);
        return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // Backend identifies user via Token
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to publish post. Please try again.");
      }

      // Success!
      // Navigate to Home to see the new post in the feed
      navigate("/");

    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      
      <Card className="shadow-lg border-zinc-200 bg-white">
        
        {/* Header Section */}
        <CardHeader className="border-b border-zinc-100 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-zinc-900">Create Post</CardTitle>
            
            {/* User Context: Shows who is posting */}
            {user && (
                <div className="flex items-center gap-2 bg-zinc-50 px-3 py-1.5 rounded-full border border-zinc-200">
                    <Avatar className="h-6 w-6">
                        <AvatarImage src={getFullImageUrl(user.profileImageUrl)} />
                        <AvatarFallback className="text-[10px] bg-indigo-100 text-indigo-700">{getInitials()}</AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-medium text-zinc-600">
                        Posting as <span className="text-zinc-900 font-bold">{user.firstName}</span>
                    </span>
                </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Error Message Display */}
            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm flex items-center gap-2 border border-red-100">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                </div>
            )}

            {/* 1. TITLE INPUT */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-zinc-700 font-medium">Title</Label>
              <Input 
                id="title" 
                placeholder="What's the topic? (e.g. Exam Schedule)" 
                value={formData.title}
                onChange={handleChange}
                className="text-lg font-medium bg-zinc-50/50 focus:bg-white border-zinc-200 focus:border-indigo-500 transition-all"
              />
            </div>

            {/* 2. CATEGORY SELECTOR */}
            <div className="space-y-2">
              <Label className="text-zinc-700 font-medium">Category</Label>
              <Select value={formData.category} onValueChange={handleCategoryChange}>
                <SelectTrigger className="bg-zinc-50/50 border-zinc-200 w-full md:w-[200px]">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="GENERAL">General</SelectItem>
                  <SelectItem value="NOTICE" className="text-red-600 font-medium">Notice</SelectItem>
                  <SelectItem value="DOUBT" className="text-orange-600 font-medium">Doubt</SelectItem>
                  <SelectItem value="PLACEMENT" className="text-green-600 font-medium">Placement</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 3. IMAGE URL INPUT */}
            <div className="space-y-2">
              <Label htmlFor="imageUrl" className="flex items-center gap-2 text-zinc-700 font-medium">
                <ImageIcon className="h-4 w-4 text-zinc-400" /> Image URL <span className="text-zinc-400 font-normal text-xs">(Optional)</span>
              </Label>
              <div className="flex gap-2">
                <Input 
                  id="imageUrl" 
                  placeholder="https://..." 
                  value={formData.imageUrl}
                  onChange={handleChange}
                  className="bg-zinc-50/50 border-zinc-200"
                />
                {formData.imageUrl && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setFormData(prev => ({...prev, imageUrl: ""}))}
                    className="text-zinc-400 hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Live Preview */}
              {formData.imageUrl && (
                <div className="mt-3 rounded-lg overflow-hidden border border-zinc-200 bg-zinc-50 relative group">
                   <img 
                     src={formData.imageUrl} 
                     alt="Preview" 
                     className="w-full h-auto max-h-[300px] object-cover"
                     onError={(e) => {e.target.style.display='none'}} 
                   />
                </div>
              )}
            </div>

            {/* 4. CONTENT TEXTAREA */}
            <div className="space-y-2">
              <Label htmlFor="content" className="text-zinc-700 font-medium">Content</Label>
              <Textarea 
                id="content" 
                placeholder="Write the details here..." 
                value={formData.content}
                onChange={handleChange}
                className="min-h-[200px] text-base resize-y bg-zinc-50/50 focus:bg-white border-zinc-200 focus:border-indigo-500"
              />
            </div>

            {/* ACTION FOOTER */}
            <div className="flex justify-end items-center gap-4 pt-4 border-t border-zinc-100">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => navigate("/")}
                className="text-zinc-500 hover:text-zinc-900"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                size="lg" 
                className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[140px] shadow-md shadow-indigo-100" 
                disabled={loading}
              >
                {loading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Publishing...</>
                ) : (
                  <><Send className="mr-2 h-4 w-4" /> Publish Post</>
                )}
              </Button>
            </div>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}