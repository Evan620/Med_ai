import { useState, useRef } from "react";
import { FileText, Upload, Plus, Search, ChevronLeft, ChevronRight, Trash2, X, BookOpen, StickyNote, File, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { AudioControls } from "./AudioControls";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface NoteData {
  id: string;
  title: string;
  content: string;
  lastModified: string;
}

interface SidebarNote {
  id: string;
  title: string;
  lastModified: string;
}

interface SidebarProps {
  selectedNote: string | null;
  onSelectNote: (noteId: string) => void;
  selectedPDF: string | null;
  onSelectPDF: (pdfId: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onCreateNewNote?: () => void;
  notesData: Record<string, NoteData>;
  onCreateNote: (noteId: string) => void;
  onDeleteNote: (noteId: string) => void;
  onPDFUpload?: (file: File) => string;
  pdfFile?: File;
  pdfText?: string;
  pdfTitle?: string;
}

export const Sidebar = ({ selectedNote, onSelectNote, selectedPDF, onSelectPDF, isCollapsed, onToggleCollapse, onCreateNewNote, notesData, onCreateNote, onDeleteNote, onPDFUpload, pdfFile, pdfText, pdfTitle }: SidebarProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Convert notesData to sidebar format and include default notes
  const notes: SidebarNote[] = [
    // Default notes (these could be removed if you don't want them)
    { id: "1", title: "Cardiovascular System", lastModified: "2 hours ago" },
    { id: "2", title: "Respiratory Physiology", lastModified: "1 day ago" },
    { id: "3", title: "Neuroanatomy Notes", lastModified: "3 days ago" },
    // Add user-created notes from notesData
    ...Object.values(notesData).map(note => ({
      id: note.id,
      title: note.title,
      lastModified: note.lastModified
    }))
  ];
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
      const pdfId = onPDFUpload ? onPDFUpload(file) : Date.now().toString();
      const newPdf = {
        id: pdfId,
        title: file.name.replace('.pdf', ''),
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`
      };
      setPdfs(prev => [...prev, newPdf]);
      onSelectPDF(pdfId); // Auto-select the uploaded PDF
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
    // Save current note before creating new one
    if (onCreateNewNote) {
      onCreateNewNote();
    }

    const newNoteId = Date.now().toString();
    onCreateNote(newNoteId);
    onSelectNote(newNoteId);
    toast({
      title: "New Note Created",
      description: "A new note has been created.",
    });
  };

  const handleDeleteNote = (noteId: string, noteTitle: string) => {
    onDeleteNote(noteId);
    setDeleteConfirmId(null);

    // If the deleted note was selected, clear selection
    if (selectedNote === noteId) {
      onSelectNote("");
    }

    toast({
      title: "Note Deleted",
      description: `"${noteTitle}" has been deleted.`,
    });
  };

  const confirmDelete = (noteId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent note selection
    setDeleteConfirmId(noteId);
  };

  const cancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirmId(null);
  };

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-80'} bg-gradient-to-b from-background to-muted/20 border-r border-border/50 flex flex-col transition-all duration-300 shadow-sm`}>
      {/* Header with toggle */}
      <div className="p-4 border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Medical Notebook</h2>
                <p className="text-xs text-muted-foreground">Study & Research</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="ml-auto hover:bg-muted/50 transition-colors"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
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
        <div className="flex flex-col items-center gap-3 p-3">
          <div className="w-full">
            <Button
              size="sm"
              variant="ghost"
              onClick={createNewNote}
              className="w-full h-10 hover:bg-blue-500/10 hover:text-blue-600 transition-colors"
              title="Create new note"
            >
              <StickyNote className="h-4 w-4" />
            </Button>
          </div>
          <div className="w-full">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleFileUpload}
              className="w-full h-10 hover:bg-red-500/10 hover:text-red-600 transition-colors"
              title="Upload PDF"
            >
              <Upload className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Expanded View */}
      {!isCollapsed && (
        <>
          {/* Search */}
          <div className="p-4 border-b border-border/50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notes and PDFs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-muted/30 border-muted-foreground/20 focus:bg-background transition-colors"
              />
            </div>
          </div>

          {/* Notes Section */}
          <div className="flex-1 overflow-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-500/10 rounded-md">
                    <StickyNote className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Notes</h3>
                    <p className="text-xs text-muted-foreground">{notes.length} items</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={createNewNote}
                  className="hover:bg-blue-500/10 hover:text-blue-600 transition-colors"
                  title="Create new note"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-2">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className={`relative group cursor-pointer rounded-lg border transition-all duration-200 hover:shadow-sm ${
                      selectedNote === note.id
                        ? 'bg-primary/5 border-primary/20 shadow-sm'
                        : 'bg-card/50 border-border/50 hover:bg-muted/30 hover:border-border'
                    }`}
                    onClick={() => onSelectNote(note.id)}
                  >
                    {deleteConfirmId === note.id ? (
                      // Delete confirmation dialog
                      <div className="flex items-center justify-between p-2 bg-destructive/10 border border-destructive/20 rounded">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-destructive">Delete this note?</div>
                          <div className="text-xs text-muted-foreground">This action cannot be undone</div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteNote(note.id, note.title);
                            }}
                            className="h-6 px-2 text-xs"
                          >
                            Delete
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={cancelDelete}
                            className="h-6 px-2 text-xs"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // Normal note display
                      <div className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className="p-1.5 bg-blue-500/10 rounded-md mt-0.5">
                              <File className="h-3 w-3 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm text-foreground truncate">{note.title}</div>
                              <div className="flex items-center gap-2 mt-1">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                <div className="text-xs text-muted-foreground">{note.lastModified}</div>
                              </div>
                              {selectedNote === note.id && (
                                <Badge variant="secondary" className="mt-2 text-xs">
                                  Currently editing
                                </Badge>
                              )}
                            </div>
                          </div>
                          {/* Only show delete button for user-created notes (not default ones) */}
                          {notesData[note.id] && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => confirmDelete(note.id, e)}
                              className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* PDFs Section */}
            <Separator className="mx-4" />
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-red-500/10 rounded-md">
                    <FileText className="h-4 w-4 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">PDFs</h3>
                    <p className="text-xs text-muted-foreground">{pdfs.length} documents</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleFileUpload}
                  className="hover:bg-red-500/10 hover:text-red-600 transition-colors"
                  title="Upload PDF"
                >
                  <Upload className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2">
                {pdfs.map((pdf) => (
                  <div
                    key={pdf.id}
                    className={`relative group cursor-pointer rounded-lg border transition-all duration-200 hover:shadow-sm ${
                      selectedPDF === pdf.id
                        ? 'bg-red-500/5 border-red-500/20 shadow-sm'
                        : 'bg-card/50 border-border/50 hover:bg-muted/30 hover:border-border'
                    }`}
                    onClick={() => onSelectPDF(pdf.id)}
                  >
                    <div className="p-3">
                      <div className="flex items-start gap-3">
                        <div className="p-1.5 bg-red-500/10 rounded-md mt-0.5">
                          <FileText className="h-3 w-3 text-red-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-foreground truncate">{pdf.title}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="text-xs text-muted-foreground">{pdf.size}</div>
                            {selectedPDF === pdf.id && (
                              <Badge variant="secondary" className="text-xs">
                                Currently viewing
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Audio Controls */}
      <div className="mt-auto">
        <AudioControls
          selectedPDF={selectedPDF}
          pdfFile={pdfFile}
          pdfText={pdfText}
          pdfTitle={pdfTitle}
          isCollapsed={isCollapsed}
        />
      </div>
    </div>
  );
};