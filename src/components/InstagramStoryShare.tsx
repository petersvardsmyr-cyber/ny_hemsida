import { useState, useRef, useEffect } from "react";
import { Instagram, Download, Share2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface InstagramStoryShareProps {
  title: string;
  imageUrl?: string;
  author?: string;
}

export const InstagramStoryShare = ({ 
  title, 
  imageUrl,
  author = "Peter Svärdsmyr"
}: InstagramStoryShareProps) => {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Story dimensions (9:16 aspect ratio)
  const STORY_WIDTH = 1080;
  const STORY_HEIGHT = 1920;

  const generateStoryImage = async () => {
    setIsGenerating(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = STORY_WIDTH;
    canvas.height = STORY_HEIGHT;

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, STORY_HEIGHT);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(0.5, '#16213e');
    gradient.addColorStop(1, '#0f0f23');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, STORY_WIDTH, STORY_HEIGHT);

    // Add subtle pattern overlay
    ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * STORY_WIDTH;
      const y = Math.random() * STORY_HEIGHT;
      const size = Math.random() * 100 + 50;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    // If there's a featured image, load and draw it
    if (imageUrl) {
      try {
        const img = await loadImage(imageUrl);
        
        // Calculate image dimensions to cover the top portion
        const imageHeight = STORY_HEIGHT * 0.55;
        const aspectRatio = img.width / img.height;
        let drawWidth = STORY_WIDTH;
        let drawHeight = drawWidth / aspectRatio;
        
        if (drawHeight < imageHeight) {
          drawHeight = imageHeight;
          drawWidth = drawHeight * aspectRatio;
        }
        
        const offsetX = (STORY_WIDTH - drawWidth) / 2;
        const offsetY = 0;
        
        // Draw image with gradient overlay
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, STORY_WIDTH, imageHeight);
        ctx.clip();
        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
        ctx.restore();
        
        // Gradient overlay on image for text readability
        const imageGradient = ctx.createLinearGradient(0, imageHeight - 300, 0, imageHeight);
        imageGradient.addColorStop(0, 'rgba(15, 15, 35, 0)');
        imageGradient.addColorStop(1, 'rgba(15, 15, 35, 1)');
        ctx.fillStyle = imageGradient;
        ctx.fillRect(0, imageHeight - 300, STORY_WIDTH, 300);
      } catch (error) {
        console.error('Failed to load image:', error);
      }
    }

    // Decorative elements
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(80, STORY_HEIGHT * 0.58);
    ctx.lineTo(STORY_WIDTH - 80, STORY_HEIGHT * 0.58);
    ctx.stroke();

    // Title text
    const titleY = imageUrl ? STORY_HEIGHT * 0.62 : STORY_HEIGHT * 0.4;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    
    // Wrap title text
    const maxWidth = STORY_WIDTH - 160;
    const lineHeight = 72;
    const words = title.split(' ');
    let lines: string[] = [];
    let currentLine = '';
    
    ctx.font = 'bold 56px system-ui, -apple-system, sans-serif';
    
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }
    
    // Limit to 5 lines
    if (lines.length > 5) {
      lines = lines.slice(0, 5);
      lines[4] = lines[4].slice(0, -3) + '...';
    }
    
    // Draw title lines
    lines.forEach((line, index) => {
      ctx.fillText(line, STORY_WIDTH / 2, titleY + (index * lineHeight));
    });

    // Author/website text
    const authorY = titleY + (lines.length * lineHeight) + 60;
    ctx.font = '32px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillText(author, STORY_WIDTH / 2, authorY);

    // Website URL
    ctx.font = '28px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fillText('petersvardsmyr.se/blogg', STORY_WIDTH / 2, authorY + 50);

    // "Läs mer" indicator at bottom
    ctx.font = 'bold 36px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('⬆️ Svep upp för att läsa', STORY_WIDTH / 2, STORY_HEIGHT - 120);

    // Generate preview URL
    const dataUrl = canvas.toDataURL('image/png');
    setPreviewUrl(dataUrl);
    setIsGenerating(false);
  };

  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  const handleDownload = () => {
    if (!previewUrl) return;
    
    const link = document.createElement('a');
    link.download = `story-${Date.now()}.png`;
    link.href = previewUrl;
    link.click();
    
    toast({
      title: "Bild nedladdad!",
      description: "Dela bilden till din Instagram Story",
    });
  };

  const handleShare = async () => {
    if (!previewUrl) return;
    
    try {
      // Convert data URL to blob
      const response = await fetch(previewUrl);
      const blob = await response.blob();
      const file = new File([blob], 'instagram-story.png', { type: 'image/png' });
      
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: title,
        });
      } else {
        // Fallback to download
        handleDownload();
      }
    } catch (error) {
      console.error('Share failed:', error);
      handleDownload();
    }
  };

  useEffect(() => {
    if (isOpen) {
      generateStoryImage();
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          aria-label="Dela till Instagram Story"
          className="text-pink-500 hover:text-pink-600 hover:bg-pink-500/10"
        >
          <Instagram className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Instagram className="h-5 w-5 text-pink-500" />
            Dela till Instagram Story
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center gap-4">
          {/* Hidden canvas for generation */}
          <canvas ref={canvasRef} className="hidden" />
          
          {/* Preview */}
          <div className="relative w-full max-w-[200px] aspect-[9/16] rounded-xl overflow-hidden bg-muted">
            {isGenerating ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : previewUrl ? (
              <img 
                src={previewUrl} 
                alt="Story preview" 
                className="w-full h-full object-cover"
              />
            ) : null}
          </div>
          
          {/* Action buttons */}
          <div className="flex gap-2 w-full">
            <Button 
              onClick={handleDownload} 
              className="flex-1"
              disabled={!previewUrl || isGenerating}
            >
              <Download className="h-4 w-4 mr-2" />
              Ladda ner
            </Button>
            <Button 
              onClick={handleShare} 
              variant="secondary"
              className="flex-1"
              disabled={!previewUrl || isGenerating}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Dela
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground text-center">
            Ladda ner bilden och dela den i din Instagram Story. 
            Lägg till länk-sticker för att länka till inlägget!
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
