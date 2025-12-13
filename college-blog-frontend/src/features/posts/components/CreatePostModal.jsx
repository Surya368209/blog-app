import { useState, useRef } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogTrigger,
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Loader2, 
  Image as ImageIcon, 
  X, 
  Globe, 
  ChevronDown 
} from "lucide-react";
import { API_BASE_URL } from "@/utils/api";

export function CreatePostModal({ trigger, onSuccess }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("GENERAL");

  // File Upload State
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Handle Gallery Selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const resetForm = () => {
    setTitle("");
    setContent("");
    setCategory("GENERAL");
    removeImage();
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) return;
    
    setLoading(true);
    try {
      let finalImageUrl = "";

      // 1. Upload Image (If selected)
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        
        const uploadRes = await fetch(`${API_BASE_URL}/posts/image`, {
          method: "POST", 
          headers: { "Authorization": `Bearer ${token}` }, 
          body: formData
        });
        
        if (uploadRes.ok) {
          const data = await uploadRes.json();
          finalImageUrl = data.imageUrl; 
        }
      }

      // 2. Create Post
      const res = await fetch(`${API_BASE_URL}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          content,
          category,
          imageUrl: finalImageUrl
        }),
      });

      if (res.ok) {
        resetForm();
        setOpen(false);
        if (onSuccess) onSuccess(); 
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const contentTooLong = content.length > 500;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      
      {/* [&>button]:hidden removes default close button from Dialog */}
      <DialogContent className="sm:max-w-[640px] p-0 gap-0 border-0 md:border md:border-zinc-200 md:rounded-2xl h-[100dvh] sm:h-auto flex flex-col bg-white [&>button]:hidden shadow-xl overflow-hidden">
        
        <DialogTitle className="sr-only">Create Post</DialogTitle>
        <DialogDescription className="sr-only">Post Editor</DialogDescription>

        {/* === HEADER === */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 bg-white/95 backdrop-blur-sm z-20">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full -ml-2 text-zinc-600 hover:bg-zinc-100" 
              onClick={() => setOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
            <span className="text-sm font-semibold text-zinc-700">
              New Post
            </span>
          </div>

          <Button 
            onClick={handleSubmit} 
            disabled={loading || !title.trim()}
            className={`rounded-full px-6 font-semibold h-9 text-sm transition-all ${
              title.trim() 
                ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-100" 
                : "bg-indigo-100 text-indigo-300 cursor-not-allowed"
            }`}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Post"}
          </Button>
        </div>

        {/* === BODY === */}
        <div className="p-4 md:p-6 flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto space-y-4">
            
            {/* Category */}
            <div>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-7 w-fit rounded-full px-3 text-indigo-600 border-indigo-200 bg-indigo-50 text-xs font-semibold hover:bg-indigo-100 transition-colors border-0 focus:ring-0">
                  <Globe className="h-3 w-3 mr-1" />
                  <SelectValue />
                  <ChevronDown className="h-3 w-3 opacity-50 ml-1" />
                </SelectTrigger>
                <SelectContent align="start">
                  <SelectItem value="GENERAL">General</SelectItem>
                  <SelectItem value="NOTICE">Notice</SelectItem>
                  <SelectItem value="DOUBT">Doubt</SelectItem>
                  <SelectItem value="PLACEMENT">Placement</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Title */}
            <Input 
              placeholder="Add an engaging title..."
              className="text-xl md:text-2xl font-semibold border-none px-0 shadow-none focus-visible:ring-0 placeholder:text-zinc-400 p-0 h-auto"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
            
            {/* Content */}
            <Textarea 
              placeholder="Write your thoughts, announcements, or questions here..."
              className="min-h-[140px] md:min-h-[180px] text-[15px] md:text-base leading-relaxed border-none px-0 shadow-none focus-visible:ring-0 resize-none text-zinc-800 placeholder:text-zinc-300 p-0"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />

            {previewUrl && (
              <div
                className="
                  relative mt-2 rounded-2xl border border-zinc-200 bg-zinc-50 group max-w-full
                  h-64 flex items-center justify-center
                "
              >
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-h-full max-w-full object-contain"
                />
            
                <div className="absolute top-2 right-2">
                  <Button 
                    size="icon" 
                    className="bg-black/60 hover:bg-black/80 text-white rounded-full h-8 w-8 backdrop-blur-sm"
                    onClick={removeImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* === FOOTER === */}
        <div className="p-4 border-t border-zinc-100 bg-white z-10">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            
            {/* Left: Image upload */}
            <div className="flex items-center gap-2">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="p-2.5 rounded-full hover:bg-indigo-50 text-indigo-600 cursor-pointer transition-colors"
                title="Add Photo"
              >
                <ImageIcon className="h-6 w-6" />
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleFileSelect}
              />
              {selectedFile && (
                <span className="text-xs text-zinc-500 truncate max-w-[140px]">
                  {selectedFile.name}
                </span>
              )}
            </div>

            {/* Right: Char counter */}
            <div
              className={`text-xs font-medium px-2 transition-colors ${
                contentTooLong ? "text-orange-500" : "text-zinc-400"
              }`}
            >
              {content.length} chars
              {contentTooLong && " • Consider keeping it concise"}
            </div>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
}
