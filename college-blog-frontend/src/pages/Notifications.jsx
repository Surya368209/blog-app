import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Heart, MessageCircle, UserPlus, BellOff } from "lucide-react";
import { API_BASE_URL } from "@/utils/api";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // 1. Fetch Notifications from Backend
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
            const data = await res.json();
            setNotifications(data);
        }
      } catch (e) {
        console.error("Failed to load notifications", e);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchNotifications();
  }, [token]);

  // 2. Helper: Choose Icon based on Type
  const getIcon = (type) => {
    switch (type) {
      case "LIKE": return <Heart className="h-3.5 w-3.5 text-white fill-current" />;
      case "COMMENT": return <MessageCircle className="h-3.5 w-3.5 text-white fill-current" />;
      case "FOLLOW": return <UserPlus className="h-3.5 w-3.5 text-white" />;
      default: return null;
    }
  };

  // 3. Helper: Choose Color based on Type
  const getBgColor = (type) => {
    switch (type) {
      case "LIKE": return "bg-red-500 border-red-100";
      case "COMMENT": return "bg-blue-500 border-blue-100";
      case "FOLLOW": return "bg-green-500 border-green-100";
      default: return "bg-gray-400";
    }
  };

  // 4. Helper: Dynamic Message Text
  const getMessage = (n) => {
    switch (n.type) {
        case "LIKE": return <span className="text-zinc-600">liked your post.</span>;
        case "COMMENT": return <span className="text-zinc-600">commented on your post.</span>;
        case "FOLLOW": return <span className="text-zinc-600">started following you.</span>;
        default: return "interacted with you.";
    }
  };

  // 5. Handle Click Navigation
  const handleClick = (n) => {
    if (n.type === "FOLLOW") {
        // Fix: Go to User Profile for Follows
        // Make sure your backend DTO includes 'actorId'
        const targetId = n.actorId || n.actor?.id; 
        if (targetId) navigate(`/users/${targetId}`);
    } else if (n.relatedPostId) {
        // Fix: Go to Post for Likes/Comments
        navigate(`/posts/${n.relatedPostId}`);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 pb-20">
      
      {/* Header */}
      <div className="bg-white border-b border-zinc-200 p-4 sticky top-0 z-10 shadow-sm">
        <h1 className="text-xl font-bold text-zinc-900">Notifications</h1>
      </div>

      <div className="max-w-2xl mx-auto p-0 md:p-6">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin h-8 w-8 text-indigo-600" /></div>
        ) : notifications.length > 0 ? (
          <div className="bg-white md:rounded-2xl shadow-sm border border-zinc-200 divide-y divide-zinc-100 overflow-hidden">
            {notifications.map((n) => (
              <div 
                key={n.id} 
                onClick={() => handleClick(n)}
                className={`p-4 flex gap-4 hover:bg-zinc-50 cursor-pointer transition-colors ${!n.isRead ? "bg-indigo-50/40" : ""}`}
              >
                {/* Avatar with Icon Badge */}
                <div className="relative flex-shrink-0">
                    <Avatar className="h-12 w-12 border border-zinc-100 shadow-sm">
                        <AvatarImage src={n.actorImageUrl} className="object-cover" />
                        <AvatarFallback className="bg-zinc-200 text-zinc-600 font-bold">{n.actorName?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-1 -right-1 h-6 w-6 rounded-full border-2 border-white flex items-center justify-center shadow-sm ${getBgColor(n.type)}`}>
                        {getIcon(n.type)}
                    </div>
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                    <p className="text-sm text-zinc-900 leading-snug">
                        <span className="font-bold hover:underline">{n.actorName}</span> {getMessage(n)}
                    </p>
                    <p className="text-xs text-zinc-400 mt-1.5 font-medium">
                        {new Date(n.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>

                {/* Unread Indicator Dot */}
                {!n.isRead && (
                    <div className="flex items-center justify-center">
                        <div className="h-2.5 w-2.5 rounded-full bg-indigo-600"></div>
                    </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
            <div className="h-16 w-16 bg-zinc-100 rounded-full flex items-center justify-center mb-4">
                <BellOff className="h-8 w-8 text-zinc-300" />
            </div>
            <p className="text-lg font-medium text-zinc-600">No notifications yet</p>
            <p className="text-sm">When people interact with you, it'll show up here.</p>
          </div>
        )}
      </div>
    </div>
  );
}