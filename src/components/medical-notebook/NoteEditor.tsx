import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { Bold, Italic, List, AlignLeft, Hash, Quote, Plus, Type, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/contexts/SettingsContext";
import { useTheme } from "@/contexts/ThemeContext";

interface NoteData {
  id: string;
  title: string;
  content: string;
  lastModified: string;
}

interface NoteEditorProps {
  selectedNote: string | null;
  highlightedText: string;
  noteData?: NoteData;
  onNoteUpdate?: (noteId: string, title: string, content: string) => void;
  onOpenYouTubeProcessor?: () => void;
}

interface NoteEditorRef {
  saveCurrentNote: () => { title: string; content: string } | null;
  insertContent: (content: string) => void;
}

const NoteEditorComponent = forwardRef<NoteEditorRef, NoteEditorProps>(({ selectedNote, highlightedText, noteData, onNoteUpdate, onOpenYouTubeProcessor }, ref) => {
  const [noteContent, setNoteContent] = useState("");
  const [noteTitle, setNoteTitle] = useState("Untitled Note");
  const editorRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { settings } = useSettings();
  const { actualTheme } = useTheme();

  // Generate theme-aware grid background - Notion style
  const getGridBackground = () => {
    if (!settings.showGridBackground) return {};

    // Notion-style grid colors and opacity
    const gridOpacity = actualTheme === 'dark' ? 0.12 : 0.03;
    const majorGridOpacity = actualTheme === 'dark' ? 0.06 : 0.01;
    const gridColor = actualTheme === 'dark' ? '255, 255, 255' : '0, 0, 0';

    return {
      backgroundImage: `
        linear-gradient(rgba(${gridColor}, ${gridOpacity}) 1px, transparent 1px),
        linear-gradient(90deg, rgba(${gridColor}, ${gridOpacity}) 1px, transparent 1px),
        linear-gradient(rgba(${gridColor}, ${majorGridOpacity}) 1px, transparent 1px),
        linear-gradient(90deg, rgba(${gridColor}, ${majorGridOpacity}) 1px, transparent 1px)
      `,
      backgroundSize: `${settings.gridSize}px ${settings.gridSize}px, ${settings.gridSize}px ${settings.gridSize}px, ${settings.gridSize * 5}px ${settings.gridSize * 5}px, ${settings.gridSize * 5}px ${settings.gridSize * 5}px`,
      backgroundPosition: '-1px -1px, -1px -1px, -1px -1px, -1px -1px'
    };
  };

  // Expose save and insert functions to parent component
  useImperativeHandle(ref, () => ({
    saveCurrentNote: () => {
      if (noteContent.trim() || noteTitle !== "Untitled Note") {
        return {
          title: noteTitle,
          content: noteContent
        };
      }
      return null;
    },
    insertContent: (content: string) => {
      if (editorRef.current) {
        const separator = noteContent.trim() ? '\n\n' : '';
        const newContent = noteContent + separator + content;
        setNoteContent(newContent);
        editorRef.current.innerHTML = newContent.replace(/\n/g, '<br>');

        // Focus the editor after inserting content
        setTimeout(() => {
          if (editorRef.current) {
            editorRef.current.focus();
            // Move cursor to end
            const range = document.createRange();
            const selection = window.getSelection();
            range.selectNodeContents(editorRef.current);
            range.collapse(false);
            selection?.removeAllRanges();
            selection?.addRange(range);
          }
        }, 50);
      }
    }
  }), [noteContent, noteTitle]);

  // Load note data when selectedNote or noteData changes
  useEffect(() => {
    if (noteData) {
      setNoteTitle(noteData.title);
      setNoteContent(noteData.content);
      if (editorRef.current) {
        editorRef.current.innerHTML = noteData.content.replace(/\n/g, '<br>');
      }
    } else if (selectedNote) {
      // New note - reset to defaults
      setNoteTitle("Untitled Note");
      setNoteContent("");
      if (editorRef.current) {
        editorRef.current.innerHTML = "";
      }
    }
  }, [selectedNote, noteData]);

  // Auto-save functionality and update parent
  useEffect(() => {
    if (!settings.autoSave) return;

    const autoSave = setTimeout(() => {
      if (selectedNote && onNoteUpdate && (noteContent.trim() || noteTitle !== "Untitled Note")) {
        onNoteUpdate(selectedNote, noteTitle, noteContent);
        if (settings.enableNotifications) {
          toast({
            title: "Auto-saved",
            description: "Your note has been automatically saved.",
          });
        }
      }
    }, settings.autoSaveInterval);

    return () => clearTimeout(autoSave);
  }, [noteContent, noteTitle, selectedNote, onNoteUpdate, toast, settings.autoSave, settings.autoSaveInterval, settings.enableNotifications]);

  // Handle content changes in the editor
  const handleEditorInput = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerText || "";
      setNoteContent(content);
    }
  };

  // Note: Highlighted text insertion is now handled by the AI system in PDFViewer
  // The highlightedText prop is kept for potential future use but no longer auto-inserts

  const formatText = (format: string) => {
    if (!editorRef.current) return;

    editorRef.current.focus();

    switch (format) {
      case "bold":
        document.execCommand('bold', false);
        break;
      case "italic":
        document.execCommand('italic', false);
        break;
      case "heading":
        // For heading, we'll make text larger and bold
        document.execCommand('fontSize', false, '5');
        document.execCommand('bold', false);
        break;
      case "quote":
        // For quote, we'll make text italic and indented
        document.execCommand('italic', false);
        document.execCommand('indent', false);
        break;
      case "list":
        document.execCommand('insertUnorderedList', false);
        break;
      default:
        break;
    }

    // Update content state
    handleEditorInput();
  };

  const addBlock = () => {
    if (editorRef.current) {
      editorRef.current.focus();
      const newBlock = document.createElement('div');
      newBlock.innerHTML = '<br><strong>New Section</strong><br><br>Type your content here...<br>';
      editorRef.current.appendChild(newBlock);
      handleEditorInput();
    }
  };

  const addSampleContent = () => {
    if (editorRef.current) {
      const sampleContent = `<div>
        <h2><strong>Medical Notes Sample</strong></h2><br>

        <strong>Patient Information</strong><br>
        <strong>Name:</strong> John Doe<br>
        <strong>Age:</strong> 45<br>
        <strong>Date:</strong> ${new Date().toLocaleDateString()}<br><br>

        <strong>Chief Complaint</strong><br>
        Patient presents with <em>chest pain</em> and <strong>shortness of breath</strong>.<br><br>

        <strong>History of Present Illness</strong><br>
        • Onset: 2 hours ago<br>
        • Character: Sharp, stabbing pain<br>
        • Location: Left chest<br>
        • Radiation: To left arm<br>
        • Associated symptoms:<br>
        &nbsp;&nbsp;• Nausea<br>
        &nbsp;&nbsp;• Diaphoresis<br>
        &nbsp;&nbsp;• Anxiety<br><br>

        <strong>Assessment</strong><br>
        <em>Possible acute coronary syndrome. Requires immediate evaluation.</em><br><br>

        <strong>Plan</strong><br>
        1. <strong>Immediate:</strong> ECG, cardiac enzymes<br>
        2. <strong>Monitoring:</strong> Continuous cardiac monitoring<br>
        3. <strong>Medications:</strong> Aspirin, nitroglycerin PRN<br>
        4. <strong>Follow-up:</strong> Cardiology consultation<br><br>

        <em>Note: This is a sample medical note demonstrating rich text formatting.</em>
      </div>`;

      editorRef.current.innerHTML = sampleContent;
      handleEditorInput();
    }
  };

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      {/* Note Header */}
      <div className="h-16 border-b border-border flex items-center px-6 flex-shrink-0">
        <div className="flex-1">
          <input
            type="text"
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
            className="text-xl font-semibold bg-transparent border-0 outline-none text-foreground w-full"
            placeholder="Note title..."
          />
          <p className="text-sm text-muted-foreground">
            {selectedNote ? "Last edited 2 minutes ago" : "New note"}
          </p>
        </div>
      </div>

      {/* Formatting Toolbar */}
      <div className="h-12 border-b border-border flex items-center px-6 gap-2 flex-shrink-0">
        <Button size="sm" variant="ghost" onClick={() => formatText("bold")} title="Bold">
          <Bold className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="ghost" onClick={() => formatText("italic")} title="Italic">
          <Italic className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="ghost" onClick={() => formatText("heading")} title="Heading">
          <Hash className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="ghost" onClick={() => formatText("quote")} title="Quote">
          <Quote className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="ghost" onClick={() => formatText("list")} title="List">
          <List className="h-4 w-4" />
        </Button>
        <div className="h-6 w-px bg-border mx-2" />
        <Button size="sm" variant="ghost" onClick={addBlock} title="Add new section">
          <Plus className="h-4 w-4 mr-1" />
          Block
        </Button>
        <Button size="sm" variant="ghost" onClick={addSampleContent} title="Add sample medical note">
          <Type className="h-4 w-4 mr-1" />
          Sample
        </Button>
        {onOpenYouTubeProcessor && (
          <Button size="sm" variant="ghost" onClick={onOpenYouTubeProcessor} title="Analyze YouTube medical videos">
            <Video className="h-4 w-4 mr-1 text-red-500" />
            YouTube
          </Button>
        )}
      </div>

      {/* Note Content Area */}
      <div className="flex-1 overflow-hidden relative" style={{ height: 'calc(100vh - 160px)' }}>
        {selectedNote ? (
          <div
            className="p-6 relative h-full flex flex-col overflow-hidden"
            style={getGridBackground()}
          >
            <div
              ref={editorRef}
              contentEditable
              onInput={handleEditorInput}
              className="note-editor w-full flex-1 leading-relaxed bg-transparent border-none shadow-none focus:outline-none overflow-y-auto"
              style={{
                background: 'transparent',
                fontSize: `${settings.fontSize}px`,
                fontFamily: settings.fontFamily,
                minHeight: '100%',
                whiteSpace: settings.enableWordWrap ? 'pre-wrap' : 'pre'
              }}
              spellCheck={settings.enableSpellCheck}
              data-placeholder="Start writing your medical notes here...

You can:
• Highlight text in the PDF to add it here
• Use AI to summarize or explain concepts
• Use the formatting toolbar above to make text bold, italic, etc.
• Create blocks for better organization

Click the formatting buttons to style your text!"
            />
          </div>
        ) : (
          <div
            className="flex flex-col items-center justify-center h-full text-center p-6 overflow-y-auto"
            style={getGridBackground()}
          >
            <Type className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No Note Selected</h3>
            <p className="text-muted-foreground max-w-md">
              Select a note from the sidebar or create a new one to start taking notes. Your notes will be automatically saved.
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

NoteEditorComponent.displayName = "NoteEditor";

export const NoteEditor = NoteEditorComponent;