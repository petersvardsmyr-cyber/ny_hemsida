import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { importBlogPosts } from "@/utils/blogImporter";

export const ImportButton = () => {
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();

  const handleImport = async () => {
    setIsImporting(true);
    
    try {
      const result = await importBlogPosts();
      
      if (result.success) {
        toast({
          title: "Import lyckades!",
          description: `Importerade ${result.data?.length || 0} blogginlägg från din gamla sajt.`,
        });
      } else {
        toast({
          title: "Import misslyckades",
          description: "Kunde inte importera blogginläggen. Försök igen.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Fel uppstod",
        description: "Ett oväntat fel inträffade under importen.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Button 
      onClick={handleImport}
      disabled={isImporting}
      className="bg-primary hover:bg-primary/90"
    >
      {isImporting ? "Importerar..." : "Importera blogginlägg"}
    </Button>
  );
};