import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom"; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
    Camera, Loader2, LogOut, FileText, Settings, Edit2, Users, ArrowLeft, BadgeCheck// Added BadgeCheck
} from "lucide-react"; 
import { API_BASE_URL } from "@/utils/api";
import { PostCard } from "@/features/posts/components/PostCard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Profile() {
  const navigate = useNavigate();
  const { userId } = useParams(); 
  const token = localStorage.getItem("token");
  const fileInputRef = useRef(null);

  const [user, setUser] = useState(null);
  const [currentUserMe, setCurrentUserMe] = useState(null); 
  const [userPosts, setUserPosts] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  const isOwnProfile = !userId || (currentUserMe && String(currentUserMe.id) === String(userId));

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [formData, setFormData] = useState({ firstName: "", lastName: "" });

  const getFullImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path; 
    const rootUrl = API_BASE_URL.replace('/api/v1', '');
    return `${rootUrl}${path}`;
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const meRes = await fetch(`${API_BASE_URL}/user/me`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (meRes.status === 403 || meRes.status === 401) {
            localStorage.removeItem("token");
            navigate("/login");
            return;
        }
        const meData = await meRes.json();
        setCurrentUserMe(meData);

        let profileData = meData;
        if (userId) {
            const otherUserRes = await fetch(`${API_BASE_URL}/user/${userId}`, { 
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (otherUserRes.ok) {
                profileData = await otherUserRes.json();
            }
        }

        setUser(profileData);
        setFormData({ firstName: profileData.firstName, lastName: profileData.lastName });

        if (profileData.id) {
          const postsRes = await fetch(`${API_BASE_URL}/posts/users/${profileData.id}/posts`, {
              headers: { "Authorization": `Bearer ${token}` }
          });
          if (postsRes.ok) {
            const postsData = await postsRes.json();
            if (Array.isArray(postsData)) setUserPosts(postsData);
          }
        }

      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setLoading(false);
      }
    };

    if (token) loadData();
    else navigate("/login");
  }, [token, userId, navigate]);

  const handlePostDelete = (deletedPostId) => {
    setUserPosts(prev => prev.filter(p => p.id !== deletedPostId));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) { setSelectedFile(file); setPreviewImage(URL.createObjectURL(file)); }
  };
  const handleCancel = () => {
    setIsEditing(false);
    setFormData({ firstName: user.firstName, lastName: user.lastName });
    setSelectedFile(null);
    setPreviewImage(null);
  };
  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (selectedFile) {
        const fd = new FormData(); fd.append("file", selectedFile); 
        await fetch(`${API_BASE_URL}/user/profile-image`, { method: "POST", headers: { "Authorization": `Bearer ${token}` }, body: fd });
      }
      await fetch(`${API_BASE_URL}/user/me`, {
        method: "PUT", headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(formData)
      });
      window.location.reload(); 
    } catch(e) { alert("Error saving"); } finally { setIsSaving(false); }
  };
  const handleLogout = () => { localStorage.removeItem("token"); navigate("/login"); };
  const getInitials = () => user ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() : "U";

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;
  if (!user) return <div className="p-10 text-center">User not found.</div>;

  return (
    <div className="w-full pb-24 md:pb-10">
      
      {!isOwnProfile && (
        <div className="max-w-2xl mx-auto mb-4 px-2">
            <Button variant="ghost" onClick={() => navigate(-1)} className="text-zinc-500 hover:text-indigo-600 pl-0">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
        </div>
      )}

      <div className="bg-white md:rounded-xl md:shadow-sm md:border md:border-zinc-200 overflow-hidden mb-8">
        
        <div className="h-32 md:h-48 bg-gradient-to-r from-blue-600 to-indigo-600 relative">
            {isOwnProfile && (
                <div className="absolute top-4 right-4 md:hidden">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-white/90 hover:bg-white/20">
                                <Settings className="h-6 w-6" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setIsEditing(true)}>
                                <Edit2 className="mr-2 h-4 w-4" /> Edit Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                                <LogOut className="mr-2 h-4 w-4" /> Log Out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )}
        </div>

        <div className="px-4 md:px-8 pb-6 relative">
            
            <div className="flex justify-between items-end -mt-10 md:-mt-16 mb-4">
                <div className="relative group">
                    <Avatar className="h-24 w-24 md:h-36 md:w-36 border-4 border-white shadow-md bg-white rounded-full">
                        <AvatarImage src={previewImage || getFullImageUrl(user.profileImageUrl)} className="object-cover" />
                        <AvatarFallback className="text-3xl font-bold bg-zinc-100 text-zinc-500">{getInitials()}</AvatarFallback>
                    </Avatar>
                    
                    {isOwnProfile && isEditing && (
                        <div onClick={() => fileInputRef.current.click()} className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center cursor-pointer z-10">
                            <Camera className="text-white h-8 w-8" />
                        </div>
                    )}
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
                </div>

                {isOwnProfile && (
                    <div className="mb-1 hidden md:flex gap-2">
                        {isEditing ? (
                            <>
                                <Button variant="ghost" onClick={handleCancel} disabled={isSaving}>Cancel</Button>
                                <Button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
                                    {isSaving ? <Loader2 className="animate-spin h-4 w-4" /> : "Save Changes"}
                                </Button>
                            </>
                        ) : (
                            <Button variant="outline" onClick={() => setIsEditing(true)} className="rounded-full px-6 border-zinc-300">
                                Edit Profile
                            </Button>
                        )}
                    </div>
                )}
            </div>

            <div className="space-y-1 mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 leading-tight flex items-center gap-2">
                  {user.lastName} {user.firstName}
                            
                  {user.verified && (
                      <TooltipProvider>
                          <Tooltip>
                              <TooltipTrigger>
                                  {/* ml-1 adds a tiny bit extra margin if needed, but gap-2 handles most of it */}
                                  <BadgeCheck className="h-6 w-6 text-blue-500 ml-1" />
                              </TooltipTrigger>
                              <TooltipContent>
                                  <p>Verified Faculty</p>
                              </TooltipContent>
                          </Tooltip>
                      </TooltipProvider>
                  )}
              </h1>
                <p className="text-zinc-500 font-medium">{user.email}</p>
                
                <div className="flex flex-wrap items-center gap-3 pt-2">
                      <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1">
                          {user.accountType}
                      </Badge>
                                
                      {user.accountType === 'TEACHER' && (
                          <div 
                              onClick={() => navigate(`/users/${user.id}/followers`)}
                              className="flex items-center gap-1.5 text-sm text-zinc-600 bg-zinc-50 border border-zinc-200 px-3 py-1 rounded-full font-medium cursor-pointer hover:bg-zinc-100 transition active:scale-95"
                          >
                              <Users className="h-3.5 w-3.5 text-zinc-400" />
                              <span><span className="font-bold text-zinc-900">{user.followerCount || 0}</span> Followers</span>
                          </div>
                      )}
                  
                      {user.accountType === 'STUDENT' && (
                          <div 
                              onClick={() => navigate(`/users/${user.id}/following`)}
                              className="flex items-center gap-1.5 text-sm text-zinc-600 bg-zinc-50 border border-zinc-200 px-3 py-1 rounded-full font-medium cursor-pointer hover:bg-zinc-100 transition active:scale-95"
                          >
                              <Users className="h-3.5 w-3.5 text-zinc-400" />
                              <span><span className="font-bold text-zinc-900">{user.followingCount || 0}</span> Following</span>
                          </div>
                      )}
                </div>

                {/* ADMIN VERIFICATION BUTTON */}
                {/* Only show if I am an ADMIN and viewing someone else */}
                {currentUserMe?.role === 'ADMIN' && !isOwnProfile && (
                    <Button 
                        onClick={async () => {
                             if(!confirm("Change verification status?")) return;
                             try {
                                 const res = await fetch(`${API_BASE_URL}/admin/verify/${user.id}`, {
                                     method: 'PUT',
                                     headers: { Authorization: `Bearer ${token}` }
                                 });
                                 if(res.ok) window.location.reload();
                                 else alert("Failed to verify");
                             } catch(e) { console.error(e); }
                        }}
                        variant="outline"
                        size="sm"
                        className={`mt-4 w-full sm:w-auto border-blue-200 text-blue-700 hover:bg-blue-50 ${user.verified ? "bg-blue-50 border-blue-300" : ""}`}
                    >
                        {user.verified ? (
                            <><BadgeCheck className="w-4 h-4 mr-2" /> Verified (Click to Remove)</>
                        ) : (
                            "Verify Teacher"
                        )}
                    </Button>
                )}
            </div>

            {isOwnProfile && isEditing && (
                <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100 mb-6 animate-in slide-in-from-top-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label className="text-xs font-semibold text-zinc-500 uppercase">First Name</Label>
                            <Input value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} className="bg-white" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs font-semibold text-zinc-500 uppercase">Last Name</Label>
                            <Input value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} className="bg-white" />
                        </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 mt-4 md:hidden">
                        <Button className="w-full bg-blue-600" onClick={handleSave} disabled={isSaving}>{isSaving ? "Saving..." : "Save Changes"}</Button>
                        <Button variant="ghost" className="w-full text-zinc-500" onClick={handleCancel} disabled={isSaving}>Cancel</Button>
                    </div>
                </div>
            )}
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
            <h3 className="text-lg font-bold text-zinc-900 border-b-2 border-zinc-900 pb-1 inline-block">
                {isOwnProfile ? "My Activity" : `${user.firstName}'s Activity`}
            </h3>
            <span className="text-sm text-zinc-500 font-medium">{userPosts.length} Posts</span>
        </div>

        <div className="space-y-4">
            {userPosts.length > 0 ? (
                userPosts.map(post => (
                    <PostCard key={post.id} post={post} onDelete={handlePostDelete} />
                ))
            ) : (
                <div className="text-center py-16 bg-white rounded-xl border border-dashed border-zinc-200">
                    <div className="bg-zinc-50 h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-3">
                        <FileText className="h-6 w-6 text-zinc-300" />
                    </div>
                    <p className="text-zinc-500 font-medium">No posts yet</p>
                </div>
            )}
        </div>
      </div>

    </div>
  );
}