"use client";

import Image from "next/image";
import { X, ChevronRight, ChevronLeft } from "lucide-react";
import { useEffect, useCallback } from "react";

interface ImagePreviewModalProps {
  images: string[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
  altText?: string;
}

export function ImagePreviewModal({ images, initialIndex = 0, isOpen, onClose, altText = "Image preview" }: ImagePreviewModalProps) {
  // Use local state if we want to navigate between images in the modal
  const [currentIndex, setCurrentIndex] = require("react").useState(initialIndex);

  // Sync state if initialIndex changes when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
    }
  }, [initialIndex, isOpen]);

  const handlePrevious = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev: number) => (prev > 0 ? prev - 1 : images.length - 1));
  }, [images.length]);

  const handleNext = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev: number) => (prev < images.length - 1 ? prev + 1 : 0));
  }, [images.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") handleNext(); // RTL: ArrowLeft goes to next image
      if (e.key === "ArrowRight") handlePrevious(); // RTL: ArrowRight goes to prev image
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, handleNext, handlePrevious]);

  if (!isOpen || images.length === 0) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
      dir="rtl"
    >
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 md:top-6 md:right-6 p-2 text-white/70 hover:text-white bg-black/50 hover:bg-black/70 rounded-full transition-colors z-[110]"
      >
        <X className="w-6 h-6 md:w-8 md:h-8" />
      </button>

      {images.length > 1 && (
        <>
          <button 
            onClick={handlePrevious}
            className="absolute right-4 md:right-8 p-3 text-white/70 hover:text-white bg-black/50 hover:bg-black/70 rounded-full transition-colors z-[110]"
          >
            <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
          </button>
          
          <button 
            onClick={handleNext}
            className="absolute left-4 md:left-8 p-3 text-white/70 hover:text-white bg-black/50 hover:bg-black/70 rounded-full transition-colors z-[110]"
          >
            <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/80 bg-black/50 px-4 py-1.5 rounded-full text-sm font-medium z-[110]">
            {currentIndex + 1} / {images.length}
          </div>
        </>
      )}

      <div 
        className="relative w-full max-w-5xl h-[75vh] md:h-[85vh] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <Image 
          src={images[currentIndex]} 
          alt={`${altText} ${currentIndex + 1}`} 
          fill 
          className="object-contain" 
          unoptimized 
        />
      </div>
    </div>
  );
}
