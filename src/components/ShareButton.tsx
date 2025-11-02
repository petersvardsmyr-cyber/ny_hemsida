import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";

interface ShareButtonProps {
  title: string;
  text?: string;
  url: string;
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm" | "lg" | "icon";
}

export const ShareButton = ({ 
  title, 
  text = "", 
  url,
  variant = "ghost",
  size = "icon"
}: ShareButtonProps) => {
  const { toast } = useToast();

  const handleShare = async () => {
    // Try native Web Share API first
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url,
        });
      } catch (error) {
        // User cancelled or error occurred
        console.log('Share cancelled or failed:', error);
      }
    } else {
      // Fallback: copy to clipboard
      handleCopyLink();
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Länk kopierad!",
        description: "Länken har kopierats till urklipp",
      });
    } catch (error) {
      console.error('Failed to copy:', error);
      toast({
        title: "Kunde inte kopiera",
        description: "Något gick fel när länken skulle kopieras",
        variant: "destructive",
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // If Web Share API is available, use it directly
  if (navigator.share) {
    return (
      <Button 
        variant={variant} 
        size={size}
        onClick={handleShare}
        aria-label="Dela inlägg"
      >
        <Share2 className="h-4 w-4" />
      </Button>
    );
  }

  // Fallback: show popover with options
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant={variant} 
          size={size}
          aria-label="Dela inlägg"
        >
          <Share2 className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-2">
        <div className="flex flex-col gap-1">
          <Button
            variant="ghost"
            className="justify-start"
            onClick={handleCopyLink}
          >
            Kopiera länk
          </Button>
          <Button
            variant="ghost"
            className="justify-start"
            onClick={handlePrint}
          >
            Skriv ut
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
