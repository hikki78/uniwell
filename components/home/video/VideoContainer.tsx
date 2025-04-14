import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

interface Props {
  className?: string;
  imageCategory?: "dashboard" | "mindmap" | "tasks" | "pomodoro" | "chat" | "calendar";
}

export const VideoContainer = ({ className, imageCategory = "dashboard" }: Props) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Define image groups by category
  const imageGroups = {
    dashboard: [
      "/images/dashboardBlack.png", 
      "/images/dashboardWhite.png"
    ],
    mindmap: [
      "/images/mindMapEditBlack.png",
      "/images/mindMapPreviewBlack.png",
      "/images/mindMapEditTagsBlack.png",
      "/images/mindMapEditEdgeOptionsBlack.png",
      "/images/mindMapPreviewWhite.png"
    ],
    tasks: [
      "/images/taskContentBlack.png",
      "/images/taskContentEditorOptionsBlack.png",
      "/images/createShortcutTaskBlack.png",
      "/images/assignedToMeBlack.png",
      "/images/starredItemsBlack.png"
    ],
    pomodoro: [
      "/images/pomodoroBlack.png",
      "/images/pomodoroSettingsBlack.png",
      "/images/pomodoroWhite.png",
      "/images/pomodoroSettingsWhite.png"
    ],
    chat: [
      "/images/groupChatBlack.png",
      "/images/groupChatNewMessageBlack.png",
      "/images/groupChatEditMessageBlack.png",
      "/images/groupChatFileUploadBlack.png",
      "/images/groupChatFileViewBlack.png",
      "/images/groupChatAndNotificationsBlack.png"
    ],
    calendar: [
      "/images/calendarPage.png",
      "/images/calendarWhite.png"
    ]
  };
  
  // Get the images for the current category
  const images = imageGroups[imageCategory] || imageGroups.dashboard;
  
  // Function to advance to the next image with a fade effect
  const advanceImage = () => {
    setIsTransitioning(true);
    
    // Wait for transition to complete
    setTimeout(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
      setIsTransitioning(false);
    }, 500);
  };
  
  // Auto-advance images to create a slideshow effect
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      advanceImage();
    }, 1200); // Change image every 1.5 seconds
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [currentImageIndex, images.length]);
  
  return (
    <div
      className={cn(
        `w-full h-full bg-secondary rounded-3xl border border-border relative overflow-hidden`,
        className
      )}
    >
      {images.map((src, index) => (
        <div
          key={src}
          className={cn(
            "absolute inset-0 transition-opacity duration-500",
            currentImageIndex === index ? "opacity-100 z-10" : "opacity-0 z-0",
            isTransitioning && currentImageIndex === index ? "opacity-0" : ""
          )}
        >
          <Image
            src={src}
            alt={`Feature screenshot ${index + 1}`}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            style={{ objectFit: "cover", objectPosition: "center" }}
            priority={index === 0}
          />
        </div>
      ))}
      
      {/* Image counter indicator */}
      <div className="absolute bottom-2 right-2 z-20 bg-black/50 rounded-full px-2 py-1 text-xs text-white">
        {currentImageIndex + 1}/{images.length}
      </div>
    </div>
  );
};
