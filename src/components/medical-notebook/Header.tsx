import { FileText, Download, Share, Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export const Header = () => {
  const { toast } = useToast();

  const handleDownload = () => {
    // Get note content from the editor
    const noteContent = document.querySelector('.note-editor') as HTMLTextAreaElement;
    const noteTitle = document.querySelector('input[placeholder="Note title..."]') as HTMLInputElement;
    
    if (noteContent && noteContent.value.trim()) {
      const title = noteTitle?.value || 'Medical Note';
      const content = noteContent.value;
      const blob = new Blob([`# ${title}\n\n${content}`], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Download completed",
        description: "Your notes have been downloaded successfully.",
      });
    } else {
      toast({
        title: "No content to download",
        description: "Please add some notes before downloading.",
        variant: "destructive",
      });
    }
  };

  const handleShare = () => {
    // WhatsApp sharing functionality
    const text = "Check out my medical notes!";
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <header className="h-16 bg-background border-b border-border flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-semibold text-foreground">MedNote AI</h1>
        </div>
        <span className="text-sm text-muted-foreground">Medical Study Companion</span>
      </div>
      
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleDownload}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          Download
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleShare}
          className="gap-2"
        >
          <Share className="h-4 w-4" />
          Share
        </Button>
        
        <Button variant="ghost" size="sm">
          <Settings className="h-4 w-4" />
        </Button>
        
        <Button variant="ghost" size="sm">
          <User className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
};