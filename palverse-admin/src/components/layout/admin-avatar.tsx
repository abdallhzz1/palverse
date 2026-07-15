"use client";

import { useState, useRef, useEffect } from "react";
import { Camera } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminAvatarProps {
  name: string;
  className?: string;
}

export function AdminAvatar({ name, className }: AdminAvatarProps) {
  const [avatarDataUrl, setAvatarDataUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load from local storage on mount
    const savedAvatar = localStorage.getItem("admin_avatar");
    if (savedAvatar) {
      setAvatarDataUrl(savedAvatar);
    }
  }, []);

  const getInitials = (name: string) => {
    if (!name) return "PA";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Resize image using canvas before saving to prevent LocalStorage quota issues
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 256;
        const MAX_HEIGHT = 256;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
        setAvatarDataUrl(dataUrl);
        try {
          localStorage.setItem("admin_avatar", dataUrl);
        } catch (error) {
          console.error("Failed to save avatar to localStorage", error);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div 
      className={cn("group relative flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-muted text-primary font-semibold text-latin overflow-hidden border border-border shadow-sm", className)}
      onClick={() => fileInputRef.current?.click()}
      title="تغيير الصورة الشخصية"
    >
      {avatarDataUrl ? (
        <img 
          src={avatarDataUrl} 
          alt={name} 
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="group-hover:opacity-0 transition-opacity text-sm">{getInitials(name)}</span>
      )}
      
      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <Camera className="w-4 h-4 text-white" />
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />
    </div>
  );
}
