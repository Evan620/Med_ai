import { useState, useRef, useCallback, useEffect } from "react";
import { Sidebar } from "@/components/medical-notebook/Sidebar";
import { PDFViewer } from "@/components/medical-notebook/PDFViewer";
import { NoteEditor } from "@/components/medical-notebook/NoteEditor";
import { AIPanel } from "@/components/medical-notebook/AIPanel";
import { YouTubeProcessor } from "@/components/medical-notebook/YouTubeProcessor";
import { Header } from "@/components/medical-notebook/Header";
import { Toaster } from "@/components/ui/toaster";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Stethoscope, Plus, Video } from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";
import { useAuth } from "@/contexts/AuthContext";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { aiService } from "@/services/aiService";
import { useToast } from "@/hooks/use-toast";

// Define the ref interface to match NoteEditor
interface NoteEditorRef {
  saveCurrentNote: () => { title: string; content: string } | null;
  insertContent: (content: string) => void;
}

// Define the note data structure
interface NoteData {
  id: string;
  title: string;
  content: string;
  lastModified: string;
}

const Index = () => {
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const [selectedPDF, setSelectedPDF] = useState<string | null>(null);
  const [aiPanelVisible, setAiPanelVisible] = useState(false);
  const [youtubeProcessorVisible, setYoutubeProcessorVisible] = useState(false);
  const [highlightedText, setHighlightedText] = useState<string>("");
  const [promptText, setPromptText] = useState<string>("");
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [aiResponse, setAiResponse] = useState<string>("");
  const { settings, updateSetting } = useSettings();
  const { user } = useAuth();
  const { toast } = useToast();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(settings.sidebarCollapsed);

  // Resizable panels state
  const [pdfWidth, setPdfWidth] = useState(50); // PDF takes 50% width initially
  const [isResizing, setIsResizing] = useState(false);

  // Store note data in memory (in a real app, this would be in a database or localStorage)
  const [notesData, setNotesData] = useState<Record<string, NoteData>>({});

  // Reference to the NoteEditor to access its save function
  const noteEditorRef = useRef<NoteEditorRef>(null);

  // Welcome message for new users
  useEffect(() => {
    if (user) {
      const isNewUser = new Date(user.createdAt).getTime() > Date.now() - 60000; // Created within last minute
      if (isNewUser) {
        setTimeout(() => {
          toast({
            title: `Welcome to MedNote AI, ${user.firstName}! 🎉`,
            description: "Start by creating your first note or uploading a PDF to analyze. Dr. Sarah Mitchell is here to help with your medical studies.",
          });
        }, 1000);
      }
    }
  }, [user, toast]);

  // Function to save current note before switching
  const saveCurrentNote = () => {
    if (selectedNote && noteEditorRef.current) {
      const noteData = noteEditorRef.current.saveCurrentNote();
      if (noteData) {
        setNotesData(prev => ({
          ...prev,
          [selectedNote]: {
            id: selectedNote,
            title: noteData.title,
            content: noteData.content,
            lastModified: new Date().toLocaleString()
          }
        }));
      }
    }
  };

  // Function to handle note selection with auto-save
  const handleSelectNote = (noteId: string) => {
    // Save current note before switching
    saveCurrentNote();

    // Switch to new note
    setSelectedNote(noteId);
  };

  // Function to create a new note
  const handleCreateNote = (noteId: string) => {
    setNotesData(prev => ({
      ...prev,
      [noteId]: {
        id: noteId,
        title: "Untitled Note",
        content: "",
        lastModified: new Date().toLocaleString()
      }
    }));
  };

  // Function to update note data (title and content)
  const handleNoteUpdate = (noteId: string, title: string, content: string) => {
    setNotesData(prev => ({
      ...prev,
      [noteId]: {
        id: noteId,
        title: title,
        content: content,
        lastModified: new Date().toLocaleString()
      }
    }));
  };

  // Function to delete a note
  const handleDeleteNote = (noteId: string) => {
    setNotesData(prev => {
      const newData = { ...prev };
      delete newData[noteId];
      return newData;
    });

    // If the deleted note was currently selected, clear the selection
    if (selectedNote === noteId) {
      setSelectedNote(null);
    }
  };

  // Function to insert content into the current note
  const handleInsertToNote = (content: string) => {
    if (!selectedNote) {
      // If no note is selected, create a new one first
      const newNoteId = Date.now().toString();
      handleCreateNote(newNoteId);
      setSelectedNote(newNoteId);

      // Wait for the note to be created and then insert content
      setTimeout(() => {
        if (noteEditorRef.current) {
          noteEditorRef.current.insertContent(content);
        }
      }, 100);
    } else if (noteEditorRef.current) {
      // Use the insertContent method to add content to the existing note
      noteEditorRef.current.insertContent(content);
    }
  };

  // Resizable panel handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;

    const container = document.querySelector('.main-content-container') as HTMLElement;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const newPdfWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;

    // Constrain between 20% and 80%
    const constrainedWidth = Math.min(Math.max(newPdfWidth, 20), 80);
    setPdfWidth(constrainedWidth);
  }, [isResizing]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  // Add event listeners for mouse move and up
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  const handleAIPrompt = async () => {
    if (!promptText.trim()) return;

    setIsAIProcessing(true);

    try {
      const result = await aiService.answerQuestion(promptText);

      if (result.success) {
        setAiResponse(result.content);

        // Show success toast with insert option
        toast({
          title: "Dr. Mitchell's Response Ready",
          description: "Professional medical analysis completed.",
          action: (
            <Button
              size="sm"
              onClick={() => handleInsertToNote(result.content)}
              className="gap-1"
            >
              <Plus className="h-3 w-3" />
              Insert to Note
            </Button>
          ),
        });
      } else {
        toast({
          title: "AI Service Error",
          description: result.error || "Failed to get response. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('AI Prompt Error:', error);
      toast({
        title: "Request Failed",
        description: "Unable to process your request. Please try again.",
        variant: "destructive",
      });
    }

    setIsAIProcessing(false);
    setPromptText("");
  };

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onNewNote: () => {
      saveCurrentNote();
      const newNoteId = Date.now().toString();
      handleCreateNote(newNoteId);
      setSelectedNote(newNoteId);
    },
    onSaveNote: saveCurrentNote,
    onToggleSidebar: () => {
      const newCollapsed = !sidebarCollapsed;
      setSidebarCollapsed(newCollapsed);
      updateSetting('sidebarCollapsed', newCollapsed);
    },
    onFocusSearch: () => {
      // Focus the search input in sidebar
      const searchInput = document.querySelector('input[placeholder="Search notes and PDFs..."]') as HTMLInputElement;
      if (searchInput) {
        searchInput.focus();
      }
    }
  });

  return (
    <div className="h-screen bg-surface flex flex-col overflow-hidden">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar for notes and PDFs */}
        <Sidebar
          selectedNote={selectedNote}
          onSelectNote={handleSelectNote}
          selectedPDF={selectedPDF}
          onSelectPDF={setSelectedPDF}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => {
            const newCollapsed = !sidebarCollapsed;
            setSidebarCollapsed(newCollapsed);
            updateSetting('sidebarCollapsed', newCollapsed);
          }}
          onCreateNewNote={saveCurrentNote}
          notesData={notesData}
          onCreateNote={handleCreateNote}
          onDeleteNote={handleDeleteNote}
        />
        
        {/* Main content area with resizable split view */}
        <div className="flex-1 flex relative main-content-container">
          {/* PDF Viewer */}
          <div
            className="border-r border-border transition-all duration-200 ease-in-out h-full"
            style={{ width: `${pdfWidth}%` }}
          >
            <PDFViewer
              selectedPDF={selectedPDF}
              onTextHighlight={setHighlightedText}
              onAIActionRequest={() => setAiPanelVisible(true)}
              onInsertToNote={handleInsertToNote}
            />
          </div>

          {/* Resizable Divider */}
          <div
            className={`w-1 cursor-col-resize transition-colors duration-200 relative group ${
              isResizing
                ? 'bg-primary/40'
                : 'bg-border hover:bg-primary/20'
            }`}
            onMouseDown={handleMouseDown}
          >
            <div className={`absolute inset-y-0 -left-1 -right-1 ${
              isResizing
                ? 'bg-primary/20'
                : 'group-hover:bg-primary/10'
            }`} />
            {/* Visual indicator */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="flex flex-col space-y-1">
                <div className="w-0.5 h-4 bg-muted-foreground/40 rounded-full"></div>
                <div className="w-0.5 h-4 bg-muted-foreground/40 rounded-full"></div>
                <div className="w-0.5 h-4 bg-muted-foreground/40 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Note Editor */}
          <div
            className="flex flex-col transition-all duration-200 ease-in-out h-full"
            style={{ width: `${100 - pdfWidth}%` }}
          >
            <NoteEditor
              ref={noteEditorRef}
              selectedNote={selectedNote}
              highlightedText={highlightedText}
              noteData={selectedNote ? notesData[selectedNote] : undefined}
              onNoteUpdate={handleNoteUpdate}
              onOpenYouTubeProcessor={() => setYoutubeProcessorVisible(true)}
            />

            {/* AI Panel */}
            {aiPanelVisible && (
              <AIPanel
                highlightedText={highlightedText}
                onClose={() => setAiPanelVisible(false)}
                onInsertToNote={(content) => {
                  // This will be handled by the note editor
                  console.log("Insert to note:", content);
                }}
              />
            )}
          </div>
        </div>
      </div>
      
      {/* AI Prompt Bar */}
      <div className="bg-background border-t border-border">
        {/* AI Response Display */}
        {aiResponse && (
          <div className="px-6 py-3 border-b border-border bg-muted/30">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Stethoscope className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">Dr. Sarah Mitchell, MD</span>
                  <span className="text-xs text-muted-foreground">Senior Medical Practitioner</span>
                </div>
                <div className="text-sm text-foreground whitespace-pre-wrap max-h-32 overflow-y-auto">
                  {aiResponse}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleInsertToNote(aiResponse)}
                  className="gap-1"
                >
                  <Plus className="h-3 w-3" />
                  Insert to Note
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setAiResponse("")}
                >
                  ×
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Input Bar */}
        <div className="h-16 flex items-center px-6 gap-3">
          <div className="flex items-center gap-2">
            <Stethoscope className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Ask Dr. Mitchell:</span>
            {(!import.meta.env.VITE_OPENROUTER_API_KEY || import.meta.env.VITE_OPENROUTER_API_KEY === 'your-api-key-here') && (
              <span className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded-full">
                Demo Mode
              </span>
            )}
          </div>
          <Input
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            placeholder="Ask any medical question - diagnosis, treatment, pathophysiology, clinical guidelines..."
            className="flex-1"
            disabled={isAIProcessing}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleAIPrompt();
              }
            }}
          />
          <Button
            onClick={() => setYoutubeProcessorVisible(true)}
            size="sm"
            variant="outline"
            className="gap-2"
            title="Analyze YouTube medical videos"
          >
            <Video className="h-4 w-4 text-red-500" />
            YouTube
          </Button>
          <Button
            onClick={handleAIPrompt}
            disabled={!promptText.trim() || isAIProcessing}
            size="sm"
            className="gap-2"
          >
            {isAIProcessing ? (
              <>
                <div className="animate-spin h-3 w-3 border-2 border-current border-t-transparent rounded-full"></div>
                Analyzing...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Ask Dr. Mitchell
              </>
            )}
          </Button>
        </div>
      </div>

      {/* YouTube Processor Modal */}
      {youtubeProcessorVisible && (
        <YouTubeProcessor
          onInsertToNote={handleInsertToNote}
          onClose={() => setYoutubeProcessorVisible(false)}
        />
      )}

      <Toaster />
    </div>
  );
};

export default Index;
