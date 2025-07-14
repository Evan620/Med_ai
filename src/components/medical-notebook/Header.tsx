import { useState } from "react";
import { FileText, Download, Share, Settings, User, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/contexts/SettingsContext";
import { useAuth } from "@/contexts/AuthContext";
import { SettingsPanel } from "./SettingsPanel";
import { UserProfile } from "@/components/auth/UserProfile";

export const Header = () => {
  const { toast } = useToast();
  const { settings } = useSettings();
  const { isAuthenticated } = useAuth();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleDownload = () => {
    // Get note content from the editor
    const noteContent = document.querySelector('.note-editor') as HTMLDivElement;
    const noteTitle = document.querySelector('input[placeholder="Note title..."]') as HTMLInputElement;

    if (noteContent && noteContent.innerText.trim()) {
      const title = noteTitle?.value || 'Medical Note';
      const content = noteContent.innerText;

      // Handle different export formats based on settings
      let blob: Blob;
      let fileName: string;
      let mimeType: string;

      switch (settings.exportFormat) {
        case 'pdf':
          // For PDF, we'll create a simple HTML structure and let the browser handle it
          const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
              <title>${title}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
                h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
                .content { white-space: pre-wrap; }
              </style>
            </head>
            <body>
              <h1>${title}</h1>
              <div class="content">${content}</div>
            </body>
            </html>
          `;
          blob = new Blob([htmlContent], { type: 'text/html' });
          fileName = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.html`;
          mimeType = 'text/html';
          break;

        case 'docx':
          // For Word format, create a simple RTF that Word can open
          const rtfContent = `{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}}\\f0\\fs24 {\\b ${title}}\\par\\par ${content.replace(/\n/g, '\\par ')}}`;
          blob = new Blob([rtfContent], { type: 'application/rtf' });
          fileName = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.rtf`;
          mimeType = 'application/rtf';
          break;

        case 'txt':
          blob = new Blob([`${title}\n\n${content}`], { type: 'text/plain' });
          fileName = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
          mimeType = 'text/plain';
          break;

        default: // markdown
          blob = new Blob([`# ${title}\n\n${content}`], { type: 'text/plain' });
          fileName = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
          mimeType = 'text/plain';
          break;
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Download completed",
        description: `Your notes have been downloaded as ${settings.exportFormat.toUpperCase()}.`,
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
          <Stethoscope className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-semibold text-foreground">MedNote AI</h1>
        </div>
        <span className="text-sm text-muted-foreground">Intelligent Medical Note-Taking with Dr. Sarah Mitchell</span>
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
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSettingsOpen(true)}
        >
          <Settings className="h-4 w-4" />
        </Button>

        {isAuthenticated ? (
          <UserProfile />
        ) : (
          <Button variant="ghost" size="sm">
            <User className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Settings Panel */}
      <SettingsPanel
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </header>
  );
};