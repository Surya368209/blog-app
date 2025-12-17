import { useEffect } from "react";
import { X } from "lucide-react"; // Assuming you use lucide-react for icons

export default function ImageModal({ isOpen, src, onClose }) {
  // 1. Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => (document.body.style.overflow = "unset");
  }, [isOpen]);

  // 2. Close on Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!isOpen || !src) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
      onClick={onClose} // Click background to close
    >
      {/* Close Button */}
      <button 
        onClick={onClose}
        className="absolute top-2 right-1 p-2 bg-black/50 rounded-full text-white hover:bg-white/20 transition-colors"
      >
        <X size={22} />
      </button>

      {/* The Image */}
      <img
        src={src}
        alt="Full View"
        className="max-w-[80vw] max-h-[85vh] object-contain rounded-md shadow-2xl scale-100 transition-transform duration-300 animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image itself
      />
    </div>
  );
}