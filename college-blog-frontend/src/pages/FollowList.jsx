import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { API_BASE_URL } from "@/utils/api";

// Accepts 'type' prop: "followers" | "following"
export default function FollowList({ type }) {
  const { userId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dynamic Configuration based on 'type'
  const isFollowers = type === "followers";
  const title = isFollowers ? "Followers" : "Following";
  const emptyMessage = isFollowers ? "No followers yet." : "Not following anyone.";
  const endpoint = isFollowers ? "followers" : "following"; 

  const getFullImageUrl = (path) => path ? (path.startsWith("http") ? path : `${API_BASE_URL.replace("/api/v1", "")}${path}`) : null;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // Reset loading when switching types
      try {
        // Dynamic API Call
        const res = await fetch(`${API_BASE_URL}/follow/${userId}/${endpoint}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          setUsers(await res.json());
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    
    if (token) fetchData();
  }, [userId, token, type]); // Re-run if 'type' changes

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-zinc-100 p-4 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="-ml-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-bold text-zinc-900">{title}</h1>
      </div>

      {/* List */}
      <div className="p-0">
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="animate-spin h-6 w-6 text-indigo-600" /></div>
        ) : users.length === 0 ? (
          <div className="text-center text-zinc-500 py-20"><p>{emptyMessage}</p></div>
        ) : (
          <div className="divide-y divide-zinc-50">
            {users.map((user) => (
              <div 
                key={user.id} 
                className="flex items-center gap-3 p-4 hover:bg-zinc-50 cursor-pointer transition-colors"
                onClick={() => navigate(`/users/${user.id}`)}
              >
                <Avatar className="h-10 w-10 border border-zinc-100">
                  <AvatarImage src={getFullImageUrl(user.profileImageUrl)} className="object-cover" />
                  <AvatarFallback className="bg-indigo-50 text-indigo-600 font-bold">{user.firstName?.[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-sm text-zinc-900 leading-none mb-1">{user.firstName} {user.lastName}</p>
                  <p className="text-xs text-zinc-500 font-medium">{user.accountType}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}