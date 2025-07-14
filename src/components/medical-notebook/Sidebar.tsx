import { useState, useRef } from "react";
import { FileText, Upload, Plus, Search, Folder, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface SidebarProps {
  selectedNote: string | null;
  onSelectNote: (noteId: string) => void;
  selectedPDF: string | null;
  onSelectPDF: (pdfId: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar = ({ selectedNote, onSelectNote, selectedPDF, onSelectPDF, isCollapsed, onToggleCollapse }: SidebarProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [notes, setNotes] = useState([
    { id: "1", title: "Cardiovascular System", lastModified: "2 hours ago" },
    { id: "2", title: "Respiratory Physiology", lastModified: "1 day ago" },
    { id: "3", title: "Neuroanatomy Notes", lastModified: "3 days ago" },
  ]);
  const [pdfs, setPdfs] = useState([
    { id: "1", title: "Gray's Anatomy - Chapter 4", size: "15.2 MB" },
    { id: "2", title: "Physiology Textbook", size: "23.1 MB" },
    { id: "3", title: "Clinical Medicine Guide", size: "8.7 MB" },
  ]);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      const newPdf = {
        id: Date.now().toString(),
        title: file.name.replace('.pdf', ''),
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`
      };
      setPdfs(prev => [...prev, newPdf]);
      toast({
        title: "PDF uploaded successfully",
        description: `${file.name} has been added to your library.`,
      });
    } else {
      toast({
        title: "Invalid file type",
        description: "Please select a PDF file.",
        variant: "destructive",
      });
    }
  };

  const createNewNote = () => {
    const newNote = {
      id: Date.now().toString(),
      title: "Untitled Note",
      lastModified: "now"
    };
    setNotes(prev => [newNote, ...prev]);
    onSelectNote(newNote.id);
    toast({
      title: "New Note Created",
      description: "A new note has been created.",
    });
  };

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-80'} bg-card border-r border-border flex flex-col transition-all duration-300`}>
      {/* Collapse Toggle */}
      <div className="p-2 border-b border-border flex justify-end">
        <Button size="sm" variant="ghost" onClick={onToggleCollapse}>
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Collapsed View - Show only icons */}
      {isCollapsed && (
        <div className="flex flex-col items-center gap-4 p-2">
          <Button size="sm" variant="ghost" onClick={createNewNote}>
            <Plus className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={handleFileUpload}>
            <Upload className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Expanded View */}
      {!isCollapsed && (
        <>
          {/* Search */}
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notes and PDFs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Notes Section */}
          <div className="flex-1 overflow-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Notes
                </h3>
                <Button size="sm" variant="ghost" onClick={createNewNote}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-2">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className={`notion-block ${selectedNote === note.id ? 'bg-selection-bg' : ''}`}
                    onClick={() => onSelectNote(note.id)}
                  >
                    <div className="font-medium text-sm text-foreground">{note.title}</div>
                    <div className="text-xs text-muted-foreground">{note.lastModified}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* PDFs Section */}
            <div className="p-4 border-t border-border">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-foreground flex items-center gap-2">
                  <Folder className="h-4 w-4" />
                  PDFs
                </h3>
                <Button size="sm" variant="ghost" onClick={handleFileUpload}>
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-2">
                {pdfs.map((pdf) => (
                  <div
                    key={pdf.id}
                    className={`notion-block ${selectedPDF === pdf.id ? 'bg-selection-bg' : ''}`}
                    onClick={() => onSelectPDF(pdf.id)}
                  >
                    <div className="font-medium text-sm text-foreground">{pdf.title}</div>
                    <div className="text-xs text-muted-foreground">{pdf.size}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};